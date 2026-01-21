"""
Web-based OAuth Handler for Multi-User Gmail Authentication
"""
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build
from config import settings
import json

class WebOAuthHandler:
    """Handles web-based OAuth flow for multi-user authentication"""
    
    def __init__(self):
        self.scopes = settings.GMAIL_SCOPES
        # Use VPS IP by default, fallback to localhost for development
        self.redirect_uri = os.getenv('OAUTH_REDIRECT_URI', 'http://76.13.17.251:8000/api/auth/google/callback')
        
    def generate_auth_url(self, state: Optional[str] = None) -> Dict[str, str]:
        """
        Generate OAuth authorization URL for user to visit
        
        Returns:
            dict with 'auth_url' and 'state' (for CSRF protection)
        """
        if not state:
            state = secrets.token_urlsafe(32)
        
        flow = Flow.from_client_secrets_file(
            settings.GMAIL_CREDENTIALS_FILE,
            scopes=self.scopes,
            redirect_uri=self.redirect_uri
        )
        
        auth_url, _ = flow.authorization_url(
            access_type='offline',  # Gets refresh token
            include_granted_scopes='true',
            prompt='select_account',  # Force account selection
            state=state
        )
        
        return {
            'auth_url': auth_url,
            'state': state
        }
    
    def handle_callback(self, code: str, state: str, stored_state: str) -> Dict:
        """
        Exchange authorization code for tokens
        
        Args:
            code: Authorization code from Google
            state: State parameter from callback
            stored_state: State we sent initially (for verification)
            
        Returns:
            dict with token info and user email
        """
        # Verify state for CSRF protection
        if state != stored_state:
            raise ValueError("Invalid state parameter - possible CSRF attack")
        
        flow = Flow.from_client_secrets_file(
            settings.GMAIL_CREDENTIALS_FILE,
            scopes=self.scopes,
            redirect_uri=self.redirect_uri,
            state=state
        )
        
        # Exchange code for tokens
        flow.fetch_token(code=code)
        
        creds = flow.credentials
        
        # Get user info
        service = build('gmail', 'v1', credentials=creds)
        profile = service.users().getProfile(userId='me').execute()
        user_email = profile.get('emailAddress')
        
        return {
            'email': user_email,
            'access_token': creds.token,
            'refresh_token': creds.refresh_token,
            'token_expiry': creds.expiry.isoformat() if creds.expiry else None,
            'scopes': json.dumps(list(creds.scopes)) if creds.scopes else '[]'
        }
    
    def refresh_access_token(self, refresh_token: str) -> Dict:
        """
        Refresh an expired access token
        
        Args:
            refresh_token: User's refresh token
            
        Returns:
            dict with new access token and expiry
        """
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=self._get_client_id(),
            client_secret=self._get_client_secret(),
            scopes=self.scopes
        )
        
        # Refresh the token
        creds.refresh(GoogleRequest())
        
        return {
            'access_token': creds.token,
            'token_expiry': creds.expiry.isoformat() if creds.expiry else None
        }
    
    def get_credentials_from_tokens(self, access_token: str, refresh_token: str, 
                                    token_expiry: Optional[datetime] = None) -> Credentials:
        """
        Create Credentials object from stored tokens
        
        Args:
            access_token: User's access token
            refresh_token: User's refresh token
            token_expiry: When the access token expires
            
        Returns:
            Google Credentials object ready for API calls
        """
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=self._get_client_id(),
            client_secret=self._get_client_secret(),
            scopes=self.scopes
        )
        
        if token_expiry:
            creds.expiry = token_expiry
        
        # Auto-refresh if expired
        if creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
        
        return creds
    
    def _get_client_id(self) -> str:
        """Extract client ID from credentials file"""
        with open(settings.GMAIL_CREDENTIALS_FILE, 'r') as f:
            creds_data = json.load(f)
            return creds_data['installed']['client_id']
    
    def _get_client_secret(self) -> str:
        """Extract client secret from credentials file"""
        with open(settings.GMAIL_CREDENTIALS_FILE, 'r') as f:
            creds_data = json.load(f)
            return creds_data['installed']['client_secret']
