# Email-to-Candidate Automation - Demo System

A streamlined system that automatically scans Gmail for job application emails, extracts candidate information using AI, and displays them in a beautiful dashboard.

## 🚀 Features

- **Gmail Integration**: Automatically monitors Gmail for job-related emails
- **AI-Powered Extraction**: Uses Google Gemini to extract candidate data from emails and resumes
- **Smart Filtering**: Only processes job-related emails, ignoring personal messages
- **Resume Handling**: Automatically downloads and parses PDF/DOCX resumes
- **Real-time Dashboard**: Beautiful UI with auto-updating candidate table
- **Relevancy Scoring**: AI rates each candidate's relevancy (0-10)
- **Resume Preview**: View resumes directly in the browser
- **Downloadable Resumes**: One-click resume downloads

## 📋 Prerequisites

1. **Python 3.9+**
2. **Google Cloud Project** with Gmail API enabled
3. **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd c:\Lakshya\indeed-crm
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**
4. Create **OAuth 2.0 Client ID** credentials
   - Application type: Desktop app
5. Download credentials and save as `credentials.json` in the project root

### 3. Set Up Environment Variables

```bash
# Copy example file
copy .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 5. Open the Frontend

Simply open `frontend/index.html` in your browser, or use a local server:

```bash
# Using Python
cd frontend
python -m http.server 3000
```

Then visit `http://localhost:3000`

## 📧 Demo Workflow

1. **Configure Email**: Enter your Gmail address in the dashboard
2. **First-time Auth**: Browser will open for Gmail OAuth (one-time only)
3. **Send Test Email**: From another account, send a job application email with:
   - Subject mentioning "job", "application", or "position"
   - Resume attachment (PDF or DOCX)
   - Email body with candidate details
4. **Auto-Update**: Dashboard will automatically detect and display the candidate

## 📊 Extracted Data

The system extracts:
- **Name**: Candidate's full name
- **Email**: Contact email
- **Position**: Role they're applying for
- **Experience**: Years of experience
- **Relevancy Score**: AI-calculated score (0-10)
- **Skills**: List of technical/professional skills
- **Resume**: Downloadable PDF/DOCX with preview

## 🏗️ Project Structure

```
indeed-crm/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # SQLAlchemy models
│   ├── gmail_service.py     # Gmail API integration
│   └── extractor.py         # AI-powered data extraction
├── frontend/
│   ├── index.html           # Main UI
│   ├── css/
│   │   └── style.css        # Modern dark theme
│   └── js/
│       └── app.js           # Frontend logic
├── uploads/
│   └── resumes/             # Stored resumes
├── .env                     # Environment variables
├── credentials.json         # Gmail OAuth credentials
└── requirements.txt         # Python dependencies
```

## 🔧 API Endpoints

- `POST /api/configure-email` - Set up email monitoring
- `GET /api/candidates` - Fetch all candidates
- `GET /api/resume/{id}` - Download resume
- `POST /api/scan` - Manually trigger email scan
- `GET /api/health` - Health check

## 🎨 UI Features

- **Dark Theme**: Modern, eye-catching design
- **Real-time Updates**: Auto-polling every 10 seconds
- **Responsive**: Works on desktop and mobile
- **Smooth Animations**: Professional transitions
- **Resume Preview**: In-browser PDF viewer
- **Skills Pills**: Visual skill display

## 🐛 Troubleshooting

**Gmail Authentication Failed**
- Ensure `credentials.json` is in the project root
- Check Gmail API is enabled in Google Cloud Console

**No Emails Detected**
- Make sure emails contain job-related keywords
- Check emails have attachments (resumes)
- Verify sent in last 7 days (configurable)

**Gemini API Errors**
- Verify `GEMINI_API_KEY` in `.env` file
- Check API key is valid and has quota

**Backend Not Starting**
- Install all dependencies: `pip install -r requirements.txt`
- Check port 8000 is not in use

## 📝 Notes

- Database: SQLite (lightweight, file-based)
- Scanning: Last 7 days of emails by default
- Polling: Frontend checks every 10 seconds
- File Storage: Local directory `uploads/resumes/`

## 🚀 Next Steps

For production deployment:
1. Deploy backend to AWS (EC2/ECS)
2. Use RDS PostgreSQL instead of SQLite
3. Store resumes in S3
4. Add authentication
5. Implement webhooks for real-time updates
6. Add email notifications
7. Integrate with CRM APIs

## 📄 License

This is a demo project for client evaluation.
