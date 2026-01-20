# ✅ Setup Progress Checklist

## 1. Environment Setup
- [x] Gemini API key added to `.env`
- [x] Backend updated to use gemini-2.0-flash
- [ ] Gmail OAuth credentials configured

## 2. Gmail API Setup (Next Step!)

### Step-by-Step Guide:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project**
   - Click "Select a project" → "New Project"
   - Name: "Email Automation" or similar
   - Click "Create"

3. **Enable Gmail API**
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure consent screen:
     * User Type: External
     * App name: "Email Automation"
     * User support email: your email
     * Developer contact: your email
     * Click "Save and Continue" through remaining steps
   - Back to Create OAuth client ID:
     * Application type: **Desktop app**
     * Name: "Email Scanner"
     * Click "Create"

5. **Download Credentials**
   - Click "Download JSON" on the created credential
   - Save the file as `credentials.json` in:
     ```
     c:\Lakshya\indeed-crm\credentials.json
     ```

## 3. First-Time Gmail Authentication (Optional)

You can authenticate now or wait until you run the app:

**Option A: Pre-authenticate (Recommended)**
```bash
cd c:\Lakshya\indeed-crm
venv\Scripts\activate
python setup_gmail.py
```

**Option B: Authenticate during first run**
- Will automatically prompt when you configure email in the UI

## 4. Start the Application

Once credentials are in place:

```bash
cd c:\Lakshya\indeed-crm
start.bat
```

This will open:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## 5. Configure Email

1. Open http://localhost:3000
2. Enter your Gmail address
3. Click "Start Monitoring"
4. Browser will open for Gmail authorization (first time only)
5. Click "Allow"

## 6. Test with Sample Email

Send a test email from another account with:
- Subject containing "job" or "application"
- Resume attached (PDF/DOCX)
- Body with candidate details

Wait ~10 seconds and the candidate will appear in the dashboard!

---

## Current Status:
✅ Python environment ready  
✅ Dependencies installed  
✅ Gemini API configured (gemini-2.0-flash)  
✅ Next.js frontend built  
⏳ **Next: Download Gmail credentials**

---

## Quick Links:
- Google Cloud Console: https://console.cloud.google.com/
- Gemini API Studio: https://makersuite.google.com/
- Project Location: c:\Lakshya\indeed-crm\
