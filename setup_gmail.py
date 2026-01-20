"""
Standalone script to set up Gmail API credentials
Run this to authenticate your Gmail account for the first time
"""

import os
import sys
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def main():
    print("=" * 50)
    print("Gmail API Authentication Setup")
    print("=" * 50)
    print()
    
    if not os.path.exists('credentials.json'):
        print("❌ ERROR: credentials.json not found!")
        print()
        print("Please follow these steps:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Create a new project or select existing")
        print("3. Enable Gmail API")
        print("4. Create OAuth 2.0 Client ID (Desktop app)")
        print("5. Download credentials and save as credentials.json")
        print()
        sys.exit(1)
    
    creds = None
    
    # Check if token already exists
    if os.path.exists('token.json'):
        print("⚠️  token.json already exists")
        response = input("Do you want to re-authenticate? (y/n): ")
        if response.lower() != 'y':
            print("Keeping existing token")
            return
        os.remove('token.json')
    
    print("🔐 Starting authentication process...")
    print("Your browser will open for Gmail authorization")
    print()
    
    try:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', 
            SCOPES
        )
        creds = flow.run_local_server(port=0)
        
        # Save the credentials
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
        
        # Test the connection
        print("✅ Authentication successful!")
        print("Testing Gmail API connection...")
        
        service = build('gmail', 'v1', credentials=creds)
        profile = service.users().getProfile(userId='me').execute()
        
        print(f"✅ Connected to Gmail account: {profile['emailAddress']}")
        print(f"📧 Total messages: {profile.get('messagesTotal', 'Unknown')}")
        print()
        print("Setup complete! You can now run the application.")
        
    except Exception as e:
        print(f"❌ Error during authentication: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
