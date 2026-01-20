# 🚀 Quick Start Guide - Next.js Version

## Prerequisites Checklist
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Gmail account for monitoring
- [ ] Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Google Cloud project with Gmail API enabled

---

## Step 1: Initial Setup (5 minutes)

### 1.1 Backend Setup
```bash
cd c:\Lakshya\indeed-crm
setup.bat
```

This will:
- Create virtual environment
- Install all Python dependencies
- Create `.env` file

### 1.2 Configure API Key

**Edit `.env` in the root folder** and add your Gemini API key:
```
GEMINI_API_KEY=AIzaSy...your_key_here
```

> ⚠️ **Important**: The `.env` file should be in `c:\Lakshya\indeed-crm\.env` (ROOT folder, not backend)

### 1.3 Get Gmail Credentials

**Go to**: https://console.cloud.google.com/

**Steps**:
1. Create new project: "Email Automation"
2. Enable **Gmail API** (search in APIs & Services)
3. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
4. Application type: **Desktop app**
5. Name: "Email Scanner"
6. Download JSON and save as `credentials.json` in project root

### 1.4 Frontend Setup
```bash
cd frontend-next
npm install
```

---

## Step 2: Start the System (Quick!)

### Option 1: Start Everything (Easiest)
```bash
start.bat
```

This will open:
- Backend API at http://localhost:8000
- Frontend at http://localhost:3000

### Option 2: Start Manually

**Terminal 1 - Backend**:
```bash
run.bat
```

**Terminal 2 - Frontend**:
```bash
cd frontend-next
npm run dev
```

---

## Step 3: Configure Email (First Time)

1. Open **http://localhost:3000** in your browser
2. Enter your Gmail address
3. Click **"Start Monitoring"**
4. Browser opens → Sign in to Gmail → Click **"Allow"**
5. Done! ✅

---

## Step 4: Test with Sample Email

### From Another Email Account

**To**: your_gmail@gmail.com

**Subject**: Application for Senior Full Stack Developer

**Body**:
```
Dear Hiring Team,

I am Sarah Johnson, applying for the Senior Full Stack Developer position.

I bring 5 years of experience in modern web development with expertise in:
- React, Next.js, TypeScript
- Python, FastAPI, Django
- PostgreSQL, MongoDB
- AWS, Docker, Kubernetes
- Tailwind CSS, Material UI

I'm passionate about building scalable applications and have led multiple projects from conception to deployment.

Please find my detailed resume attached.

Best regards,
Sarah Johnson
sarah.johnson@example.com
+1-555-0123
```

**Attachment**: Any PDF/DOCX resume

### Wait 10 Seconds
Dashboard automatically updates with the new candidate!

---

## 📊 What You'll See

Beautiful dark-themed table with gradient accents showing:

| Name | Position | Experience | Relevancy | Skills | Resume |
|------|----------|------------|-----------|--------|--------|
| Sarah Johnson | Senior Full Stack Developer | 5 years | **8.5**/10 | React, Next.js, TypeScript, +4 | 👁️ 📥 |

- **Gradient Headers**: Modern purple-to-pink gradient
- **Skill Pills**: Color-coded badges
- **Progress Bars**: Visual relevancy scores
- **Smooth Animations**: Fade-in effects
- **Responsive**: Works on all screen sizes

---

## 🎨 Next.js + Tailwind Features

### Tech Stack
- ⚛️ **Next.js 15** with App Router
- 📘 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🌊 **Gradient Design** system
- ✨ **Smooth Animations** (fade, slide, pulse)

### UI Highlights
1. **Premium Dark Theme**: Slate grays with indigo/purple accents
2. **Gradient Buttons**: Hover effects with scale transforms
3. **Auto-Polling**: 10-second updates without refresh
4. **Modal Preview**: Full-screen resume viewer
5. **Loading States**: Spinner animations
6. **Empty States**: Beautiful placeholder graphics

---

## 🔧 Troubleshooting

### ".env file not found" in backend
→ Make sure `.env` is in `c:\Lakshya\indeed-crm\.env` (root folder)

### "credentials.json not found"
→ Download OAuth credentials from Google Cloud Console

### "GEMINI_API_KEY not set"
→ Edit `.env` in root folder and add your API key

### Port 3000 or 8000 in use
→ Stop other applications or kill processes

### Frontend not connecting to backend
→ Verify backend is running at http://localhost:8000/api/health

---

## 📁 Project Structure

```
indeed-crm/
├── .env                        # API keys (ROOT FOLDER)
├── credentials.json            # Gmail OAuth
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── gmail_service.py        # Gmail integration
│   ├── extractor.py            # AI extraction
│   └── ...
├── frontend-next/              # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # App layout
│   │   └── globals.css        # Tailwind + custom styles
│   ├── components/
│   │   ├── Header.tsx         # Header with status
│   │   ├── EmailConfig.tsx    # Configuration form
│   │   ├── CandidatesTable.tsx # Data table
│   │   └── ResumeModal.tsx    # Preview modal
│   └── .env.local             # API URL (auto-created)
├── setup.bat                   # Initial setup
├── run.bat                     # Backend only
└── start.bat                   # Start everything
```

---

## 💡 Demo Tips

### Before Client Demo
1. **Test First**: Send a test email 5 minutes before 2. **Open App**: Have http://localhost:3000 ready
3. **Show Process**: Send email live, watch it appear
4. **Highlight**:
   - Beautiful gradient UI
   - Instant AI extraction
   - Resume preview modal
   - Real-time updates (no refresh)

### Talking Points
- "Built with Next.js and Tailwind for modern UX"
- "AI-powered extraction using Google Gemini"
- "Automatically filters only job-related emails"
- "Production-ready architecture for scaling"

---

## 🚀 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

---

## Next Steps

1. ✅ Set up `.env` with API keys
2. ✅ Download Gmail credentials
3. ✅ Run `start.bat`
4. ✅ Configure email
5. ✅ Send test email
6. 🎉 Show client!

---

**Questions?**  
- Check `README.md` for detailed docs
- Review `walkthrough.md` for architecture
