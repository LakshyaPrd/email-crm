# OAuth Configuration - Important Notes

## Fixed Issues ✅

### 1. Google Account Selector
**Problem:** Google OAuth was logging in with default account  
**Solution:** Added `prompt='select_account'` to OAuth flow

**File Changed:** `backend/gmail_service.py` line 42-44

**Now users will see:**
- "Choose an account" popup
- List of all Google accounts
- Can select which account to connect

---

## Email Provider Support

### Gmail - OAuth (No App Password) ✅
- Uses Google OAuth 2.0
- Most user-friendly
- Shows account selector
- No passwords stored

### Outlook - IMAP + App Password
- Requires Microsoft app password
- Generate at: https://account.microsoft.com/security

### Yahoo - IMAP + App Password  
- Requires Yahoo app password
- Generate at: https://login.yahoo.com/account/security

### Custom IMAP - IMAP + Password
- Works with any IMAP provider
- Requires IMAP credentials

---

## Future Enhancements (Optional)

### Add Microsoft OAuth for Outlook
Would eliminate app password for Outlook users.

**Steps:**
1. Register app in Azure AD
2. Add Microsoft OAuth flow similar to Google
3. Update backend with MSAL library

**Estimated Time:** 30-45 minutes

---

## OAuth Credentials Setup

### Google Cloud Console Steps:
1. Go to https://console.cloud.google.com/
2. Create new project "Indeed CRM"
3. Enable Gmail API
4. Create OAuth 2.0 Client ID
5. Type: Desktop application
6. Download credentials.json
7. Upload to project root

### Authorized Redirect URIs:
- Local: `http://localhost:8080/`
- Production: Configure in Google Cloud Console if using web flow

---

## Security Notes

- OAuth tokens stored in `token.json` (gitignored)
- Tokens auto-refresh when expired
- No passwords stored in database
- IMAP connections use TLS encryption
- Rate limiting on API endpoints

---

## Testing OAuth

### Local Testing:
```bash
cd backend
python -c "from gmail_service import GmailService; gs = GmailService(); gs.authenticate()"
```

Should open browser with account selector ✅

### Production Testing:
1. Visit https://yourdomain.com
2. Click "Connect with Gmail"
3. Should see account selector popup
4. Select account
5. Grant permissions
6. Redirected back to CRM

---

**Last Updated:** January 2026  
**OAuth Account Selector:** ✅ WORKING
