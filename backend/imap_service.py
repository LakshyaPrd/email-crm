import imaplib
import email
from email.header import decode_header
from typing import List, Dict, Optional
import re
from datetime import datetime

class IMAPService:
    """IMAP service for connecting to multiple email providers"""
    
    # Provider configurations
    PROVIDERS = {
        "gmail": {
            "host": "imap.gmail.com",
            "port": 993,
            "requires_app_password": True,
            "help_url": "https://support.google.com/accounts/answer/185833"
        },
        "outlook": {
            "host": "outlook.office365.com",
            "port": 993,
            "requires_app_password": False,
            "help_url": "https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944"
        },
        "yahoo": {
            "host": "imap.mail.yahoo.com",
            "port": 993,
            "requires_app_password": True,
            "help_url": "https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html"
        }
    }
    
    def __init__(self):
        self.connection = None
        self.email_address = None
        
    def connect(self, email: str, password: str, provider: str = None) -> bool:
        """Connect to IMAP server"""
        try:
            # Auto-detect provider from email domain if not specified
            if not provider:
                domain = email.split('@')[1].lower()
                if 'gmail' in domain:
                    provider = 'gmail'
                elif 'outlook' in domain or 'hotmail' in domain or 'live' in domain:
                    provider = 'outlook'
                elif 'yahoo' in domain:
                    provider = 'yahoo'
                else:
                    raise ValueError(f"Unknown email provider. Please specify provider manually.")
            
            if provider not in self.PROVIDERS:
                raise ValueError(f"Unsupported provider: {provider}")
            
            config = self.PROVIDERS[provider]
            
            # Connect to IMAP server
            print(f"📧 Connecting to {config['host']}...")
            self.connection = imaplib.IMAP4_SSL(config['host'], config['port'])
            
            # Login
            print(f"🔐 Authenticating {email}...")
            self.connection.login(email, password)
            
            self.email_address = email
            print(f"✅ Connected successfully to {provider}")
            return True
            
        except imaplib.IMAP4.error as e:
            print(f"❌ IMAP authentication failed: {str(e)}")
            if "authentication failed" in str(e).lower():
                raise ValueError("Authentication failed. Please check your email and app password.")
            raise
        except Exception as e:
            print(f"❌ Connection error: {str(e)}")
            raise
    
    def disconnect(self):
        """Disconnect from IMAP server"""
        if self.connection:
            try:
                self.connection.logout()
                print("✅ Disconnected from IMAP server")
            except:
                pass
            self.connection = None
            self.email_address = None
    
    def get_emails(self, search_query: str = "ALL", max_results: int = 500) -> List[Dict]:
        """Fetch emails based on search criteria"""
        if not self.connection:
            raise ValueError("Not connected to IMAP server")
        
        try:
            # Select inbox
            self.connection.select('INBOX')
            
            # Search for emails
            print(f"🔍 Searching emails with query: {search_query}")
            status, messages = self.connection.search(None, search_query)
            
            if status != 'OK':
                print("❌ No messages found")
                return []
            
            email_ids = messages[0].split()
            total = len(email_ids)
            
            # Limit results
            email_ids = email_ids[-max_results:] if total > max_results else email_ids
            
            print(f"📬 Found {len(email_ids)} emails (total: {total})")
            
            emails = []
            for i, email_id in enumerate(reversed(email_ids)):  # Most recent first
                try:
                    email_data = self._fetch_email_details(email_id)
                    if email_data:
                        emails.append(email_data)
                        if (i + 1) % 10 == 0:
                            print(f"   Loaded {i + 1}/{len(email_ids)} emails...")
                except Exception as e:
                    print(f"⚠️ Error loading email {email_id}: {str(e)}")
                    continue
            
            return emails
            
        except Exception as e:
            print(f"❌ Error fetching emails: {str(e)}")
            return []
    
    def _fetch_email_details(self, email_id) -> Optional[Dict]:
        """Fetch detailed email information"""
        try:
            status, msg_data = self.connection.fetch(email_id, '(RFC822)')
            
            if status != 'OK':
                return None
            
            # Parse email
            email_body = msg_data[0][1]
            email_message = email.message_from_bytes(email_body)
            
            # Decode subject
            subject = self._decode_header(email_message['Subject'])
            from_email = self._decode_header(email_message['From'])
            to_email = self._decode_header(email_message['To'])
            cc_email = self._decode_header(email_message.get('Cc', ''))
            date_str = email_message['Date']
            
            # Get email body
            body_plain, body_html = self._get_email_body(email_message)
            
            # Get attachments
            attachments = self._get_attachments(email_message, email_id)
            
            return {
                'id': email_id.decode() if isinstance(email_id, bytes) else str(email_id),
                'subject': subject or '(No Subject)',
                'from': from_email or '',
                'to': to_email or '',
                'cc': cc_email or '',
                'date': date_str or '',
                'body': body_plain or '',
                'body_html': body_html or '',
                'signature': '',  # Extract if needed
                'attachments': attachments
            }
            
        except Exception as e:
            print(f"Error parsing email: {str(e)}")
            return None
    
    def _decode_header(self, header_value) -> str:
        """Decode email header"""
        if not header_value:
            return ''
        
        decoded_parts = decode_header(header_value)
        header_text = ''
        
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                header_text += part.decode(encoding or 'utf-8', errors='ignore')
            else:
                header_text += str(part)
        
        return header_text
    
    def _get_email_body(self, email_message) -> tuple:
        """Extract plain text and HTML body from email"""
        body_plain = ''
        body_html = ''
        
        if email_message.is_multipart():
            for part in email_message.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get('Content-Disposition', ''))
                
                # Skip attachments
                if 'attachment' in content_disposition:
                    continue
                
                try:
                    body = part.get_payload(decode=True)
                    if body:
                        if content_type == 'text/plain' and not body_plain:
                            body_plain = body.decode('utf-8', errors='ignore')
                        elif content_type == 'text/html' and not body_html:
                            body_html = body.decode('utf-8', errors='ignore')
                except:
                    continue
        else:
            # Not multipart
            content_type = email_message.get_content_type()
            body = email_message.get_payload(decode=True)
            if body:
                decoded_body = body.decode('utf-8', errors='ignore')
                if content_type == 'text/html':
                    body_html = decoded_body
                else:
                    body_plain = decoded_body
        
        return body_plain, body_html
    
    def _get_attachments(self, email_message, email_id) -> List[Dict]:
        """Extract attachment metadata from email"""
        attachments = []
        
        if email_message.is_multipart():
            for part in email_message.walk():
                content_disposition = str(part.get('Content-Disposition', ''))
                
                if 'attachment' in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        filename = self._decode_header(filename)
                        attachments.append({
                            'filename': filename,
                            'mimeType': part.get_content_type(),
                            'attachmentId': f"{email_id}_{len(attachments)}",
                            'size': len(part.get_payload(decode=True) or b''),
                            '_part': part  # Store part for later download
                        })
        
        return attachments
    
    def download_attachment(self, attachment_data: Dict) -> Optional[bytes]:
        """Download attachment from email"""
        try:
            if '_part' in attachment_data:
                return attachment_data['_part'].get_payload(decode=True)
            return None
        except Exception as e:
            print(f"Error downloading attachment: {str(e)}")
            return None
    
    def get_user_profile(self) -> Dict:
        """Get user profile information"""
        return {
            'emailAddress': self.email_address or 'unknown@example.com',
            'messagesTotal': 0,  # IMAP doesn't provide this easily
            'threadsTotal': 0
        }

    @staticmethod
    def get_provider_info(provider: str) -> Dict:
        """Get provider configuration info"""
        if provider in IMAPService.PROVIDERS:
            return IMAPService.PROVIDERS[provider]
        return {}
