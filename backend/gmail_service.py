import os
import base64
import email
import re
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from config import settings
import io

class GmailService:
    def __init__(self):
        self.creds = None
        self.service = None
        
    def authenticate(self):
        """Authenticate with Gmail API - uses existing token or fails gracefully"""
        # Check if token file exists
        if os.path.exists(settings.GMAIL_TOKEN_FILE):
            self.creds = Credentials.from_authorized_user_file(
                settings.GMAIL_TOKEN_FILE, 
                settings.GMAIL_SCOPES
            )
        
        # If credentials are invalid or don't exist, try to refresh or fail gracefully
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                try:
                    print("🔄 Refreshing expired token...")
                    self.creds.refresh(Request())
                    print("✅ Token refreshed successfully!")
                    # Save refreshed token
                    with open(settings.GMAIL_TOKEN_FILE, 'w') as token:
                        token.write(self.creds.to_json())
                except Exception as e:
                    print(f"❌ Token refresh failed: {e}")
                    # Delete old token
                    if os.path.exists(settings.GMAIL_TOKEN_FILE):
                        os.remove(settings.GMAIL_TOKEN_FILE)
                    raise Exception("Token expired and refresh failed. Please re-authenticate locally and upload new token.json to the server.")
            else:
                # No valid token - check if we're on a headless server
                if not os.path.exists(settings.GMAIL_CREDENTIALS_FILE):
                    raise FileNotFoundError(
                        f"Gmail credentials file not found: {settings.GMAIL_CREDENTIALS_FILE}\n"
                        f"Please download OAuth credentials from Google Cloud Console"
                    )
                
                # Check if we can open a browser (development mode)
                import sys
                if sys.platform == "linux" and not os.environ.get("DISPLAY"):
                    # Headless server - cannot run browser OAuth
                    raise Exception(
                        "Cannot authenticate on headless server. "
                        "Please run OAuth authentication locally:\n"
                        "1. On your local machine: python -c 'from backend.gmail_service import GmailService; gs = GmailService(); gs.authenticate()'\n"
                        "2. Upload generated token.json to the server\n"
                        "3. Restart the backend"
                    )
                
                print("🔓 Opening browser for Gmail authentication...")
                print("⚠️  Please authorize in the browser window that opens")
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    settings.GMAIL_CREDENTIALS_FILE,
                    settings.GMAIL_SCOPES
                )
                # Force account selector and offline access
                flow.redirect_uri = 'http://localhost:8080/'
                
                # CRITICAL: These parameters force account selection
                try:
                    self.creds = flow.run_local_server(
                        port=8080,
                        prompt='select_account',  # Forces account selector
                        access_type='offline',     # Gets refresh token
                        open_browser=True          # Explicitly open browser
                    )
                    print("✅ Gmail authentication successful!")
                except Exception as e:
                    print(f"❌ OAuth flow failed: {e}")
                    raise Exception(f"Gmail OAuth failed. Please check browser and try again. Error: {str(e)}")
            
                # Save credentials
                with open(settings.GMAIL_TOKEN_FILE, 'w') as token:
                    token.write(self.creds.to_json())
                token.write(self.creds.to_json())
        
        self.service = build('gmail', 'v1', credentials=self.creds)
        return True
    
    def get_user_profile(self) -> Dict:
        """Get Gmail user profile information"""
        if not self.service:
            self.authenticate()
        
        try:
            profile = self.service.users().getProfile(userId='me').execute()
            return {
                'emailAddress': profile.get('emailAddress', ''),
                'messagesTotal': profile.get('messagesTotal', 0),
                'threadsTotal': profile.get('threadsTotal', 0)
            }
        except Exception as e:
            print(f"Error getting user profile: {str(e)}")
            return {'emailAddress': 'unknown@example.com'}
    
    def get_emails(self, search_query: str = "", hours_back: Optional[int] = None) -> List[Dict]:
        """Get emails based on custom search query - incoming emails from all folders"""
        if not self.service:
            self.authenticate()
        
        # Build query - search all emails, not just inbox (to catch Promotions, Updates, etc)
        query = ""
        if search_query:
            query = search_query
        
        # Add time filter if specified
        if hours_back is not None:
            after_date = datetime.now() - timedelta(hours=hours_back)
            after_timestamp = int(after_date.timestamp())
            query = f'{query} after:{after_timestamp}'.strip()
        
        try:
            print(f"🔍 Gmail Query: '{query or 'ALL EMAILS'}'")
            results = self.service.users().messages().list(
                userId='me',
                q=query if query else None,
                maxResults=500
            ).execute()
            
            messages = results.get('messages', [])
            print(f"📬 Found {len(messages)} emails")
            emails = []
            
            for i, msg in enumerate(messages):
                print(f"   Loading email {i+1}/{len(messages)}...")
                email_data = self.get_email_details(msg['id'])
                if email_data:
                    emails.append(email_data)
            
            return emails
        
        except Exception as e:
            print(f"Error fetching emails: {str(e)}")
            return []
    
    def get_job_emails(self, hours_back: Optional[int] = 24) -> List[Dict]:
        """Get job-related emails from the last X hours, or all emails if hours_back is None"""
        job_keywords = '(job OR application OR resume OR cv OR apply OR position OR candidate OR hiring OR vacancy OR career)'
        query = f'has:attachment {job_keywords}'
        return self.get_emails(search_query=query, hours_back=hours_back)
    
    def get_email_details(self, msg_id: str) -> Optional[Dict]:
        """Get full email details including attachments, CC, and signature"""
        try:
            message = self.service.users().messages().get(
                userId='me',
                id=msg_id,
                format='full'
            ).execute()
            
            headers = message['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), '')
            from_email = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
            to_email = next((h['value'] for h in headers if h['name'].lower() == 'to'), '')
            cc_email = next((h['value'] for h in headers if h['name'].lower() == 'cc'), '')
            date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
            
            # Parse email body (both plain text and HTML)
            body_plain, body_html = self._get_body_full(message['payload'])
            
            # Extract signature from email body
            signature = self._extract_signature(body_plain)
            
            # Get attachments
            attachments = self._get_attachments(message['payload'], msg_id)
            
            return {
                'id': msg_id,
                'subject': subject,
                'from': from_email,
                'to': to_email,
                'cc': cc_email,
                'date': date_str,
                'body': body_plain,
                'body_html': body_html,
                'signature': signature,
                'attachments': attachments
            }
        
        except Exception as e:
            print(f"Error getting email details: {str(e)}")
            return None
    
    def _extract_signature(self, body: str) -> str:
        """Extract email signature from body"""
        if not body:
            return ""
        
        # Common signature patterns
        signature_patterns = [
            r'\n--\s*\n',  # Standard signature delimiter
            r'\n_{3,}\s*\n',  # Underscores
            r'\n-{3,}\s*\n',  # Dashes
            r'\nBest\s+[Rr]egards?\s*[,.]?\s*\n',
            r'\nKind\s+[Rr]egards?\s*[,.]?\s*\n',
            r'\nRegards\s*[,.]?\s*\n',
            r'\nSincerely\s*[,.]?\s*\n',
            r'\nThanks?\s*[,.]?\s*\n',
            r'\nThank\s+you\s*[,.]?\s*\n',
            r'\nCheers\s*[,.]?\s*\n',
            r'\nWarm\s+regards\s*[,.]?\s*\n',
        ]
        
        for pattern in signature_patterns:
            match = re.search(pattern, body, re.IGNORECASE)
            if match:
                signature = body[match.start():].strip()
                # Limit signature length
                if len(signature) < 1000:
                    return signature
                return signature[:1000]
        
        return ""
    
    def _get_body_full(self, payload) -> tuple:
        """Extract both plain text and HTML email body from payload"""
        body_plain = ""
        body_html = ""
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        body_plain = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                elif part['mimeType'] == 'text/html':
                    if 'data' in part['body']:
                        body_html = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                elif 'parts' in part:  # Handle nested parts (multipart)
                    for subpart in part['parts']:
                        if subpart['mimeType'] == 'text/plain' and not body_plain:
                            if 'data' in subpart.get('body', {}):
                                body_plain = base64.urlsafe_b64decode(subpart['body']['data']).decode('utf-8')
                        elif subpart['mimeType'] == 'text/html' and not body_html:
                            if 'data' in subpart.get('body', {}):
                                body_html = base64.urlsafe_b64decode(subpart['body']['data']).decode('utf-8')
        else:
            if 'body' in payload and 'data' in payload['body']:
                data = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
                if payload.get('mimeType') == 'text/html':
                    body_html = data
                else:
                    body_plain = data
        
        return body_plain, body_html
    
    def _get_attachments(self, payload, msg_id: str) -> List[Dict]:
        """Extract attachments from email (including nested parts)"""
        attachments = []
        
        def process_parts(parts):
            for part in parts:
                # Check if this part has an attachment
                if part.get('filename'):
                    if 'body' in part and 'attachmentId' in part['body']:
                        attachment = {
                            'filename': part['filename'],
                            'mimeType': part['mimeType'],
                            'attachmentId': part['body']['attachmentId'],
                            'size': part['body'].get('size', 0)
                        }
                        attachments.append(attachment)
                        print(f"   📎 Found attachment: {part['filename']}")
                
                # Recursively check nested parts
                if 'parts' in part:
                    process_parts(part['parts'])
        
        if 'parts' in payload:
            process_parts(payload['parts'])
        
        # Also check the payload itself for single-part emails
        if payload.get('filename'):
            if 'body' in payload and 'attachmentId' in payload['body']:
                attachment = {
                    'filename': payload['filename'],
                    'mimeType': payload['mimeType'],
                    'attachmentId': payload['body']['attachmentId'],
                    'size': payload['body'].get('size', 0)
                }
                attachments.append(attachment)
                print(f"   📎 Found attachment: {payload['filename']}")
        
        return attachments
    
    def download_attachment(self, msg_id: str, attachment_id: str) -> Optional[bytes]:
        """Download attachment from email"""
        try:
            attachment = self.service.users().messages().attachments().get(
                userId='me',
                messageId=msg_id,
                id=attachment_id
            ).execute()
            
            data = attachment['data']
            file_data = base64.urlsafe_b64decode(data)
            return file_data
        
        except Exception as e:
            print(f"Error downloading attachment: {str(e)}")
            return None
