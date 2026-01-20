# CLIENT DEMO SCRIPT - 10 Minutes

## PREPARATION (**Before Client Arrives**)
- [ ] Both servers running (backend + frontend)
- [ ] Browser open to http://localhost:3000
- [ ] Have 2-3 test emails ready (sent from different accounts)
- [ ] Clear any old data (optional: delete `candidates.db`)
- [ ] Test clicking on candidate to see detail view

---

## DEMO FLOW

### 0. Opening (30 seconds)
**SAY**:  
"Thank you for joining! Today I'll show you an AI-powered email-to-candidate automation system that transforms how you process job applications through Gmail."

---

### 1. The Problem (30 seconds)
**SAY**:  
"Currently, when job applications arrive via email, recruiters manually:
- Read each email
- Download resumes
- Copy information to spreadsheets
- Risk missing applications in spam
- Spend hours on data entry

This system automates all of that."

---

### 2. Email Configuration (2 minutes)

**DO**: Enter Gmail address (your demo account)

**SAY**: "First, we configure which Gmail account to monitor. I'll use my demo account pradhan2k4@gmail.com"

**DO**: Click "Start Monitoring"

**SAY**: "The system authenticates with Gmail using OAuth - completely secure, no passwords stored. It's asking for permission to read emails."

**DO**: Complete OAuth (should auto-open browser)

**SAY**: "And we're connected! Notice the confirmation message."

---

### 3. Historical Scanning (1 minute)

**DO**: Wait a few seconds, refresh if needed

**SAY**: "Here's something powerful - the system doesn't just monitor new emails. It scans your ENTIRE Gmail history for job-related applications. See? It found applications from [mention date of oldest email]."

**POINT OUT**:
- Number of candidates badge
- Auto-refresh happening every 10 seconds

---

### 4. Intelligent Table View (2 minutes)

**SAY**: "Let me show you what the AI extracted automatically..."

**POINT TO TABLE** and explain each column:
- **Name & Email**: "Extracted from email signature and resume"
- **Position**: "The AI understands what role they're applying for"
- **Experience**: "Years of experience, parsed from resume"
- **Relevancy Score**: "AI calculates how good a fit they are - this candidate scored X/10"
- **Skills**: "Automatically tags skills from both email and resume"
- **Resume**: "Preview and download buttons for quick access"

---

### 5. **STAR FEATURE** - Detailed View (3 minutes) 🌟

**SAY**: "Now, here's where it gets really interesting. Click on any candidate..."

**DO**: Click on a candidate row

**SAY**: "This split-screen view shows something unique:"

**POINT TO LEFT SIDE**:
"On the left, everything from the EMAIL:
- The email address they sent from
- Subject line
- When they applied
- Skills mentioned in their email body
- Their relevancy score"

**POINT TO RIGHT SIDE**:
"On the right, everything from their CV/RESUME:
- A preview of the actual resume
- You can download it with one click
- The AI extracted all this information FROM the resume PDF"

**SAY**: "Why is this important? Sometimes people send emails from one address but their resume has a different one. Or they mention different skills in the email vs the resume. This view catches those mismatches immediately."

**DO**: Close modal, click on another candidate

**SAY**: "Every candidate gets the same treatment. It's consistent, fast, and nothing falls through the cracks."

---

### 6. Smart Deduplication (1 minute)

**SAY**: "The system is also intelligent about duplicates. If someone sends 10 emails for the same position - which happens! - it only captures them once. But if they apply for different positions, like Frontend and Backend Developer, it tracks both separately."

**POINT OUT**:
"And you can see it handles mass hiring - 100 people applying for the same Developer role? All 100 are captured, not just one."

---

### 7. Resume Management (30 seconds)

**DO**: Click preview button on a candidate in the table

**SAY**: "Quick resume preview without leaving the page. And one-click download if you want to save it."

**DO**: Close preview

---

### 8. Real-time Updates (30 seconds)

**SAY**: "The table updates automatically every 10 seconds. If a new application arrives, you'll see it appear without refreshing. There's also a manual refresh button if you want to force an update."

**DO**: Click refresh button

---

### 9. Scaling & Production (1 minute)

**SAY**: "This is a working demo, but it's built on a production-ready architecture. The backend uses:
- FastAPI for high-performance API
- Gmail API with secure OAuth
- Google Gemini AI for intelligent extraction
- Modern Next.js frontend

For your production deployment, we've designed a full enterprise architecture with:
- Event-driven processing
- Queue-based workers for scaling to thousands of emails
- Multi-layer deduplication
- Complete audit trail for compliance
- Manual review queue for uncertain matches"

---

### 10. Closing (30 seconds)

**SAY**: "So in summary, this system:
✓ Monitors Gmail automatically
✓ Scans ALL historical emails, not just new ones
✓ Uses AI to extract candidate data intelligently
✓ Prevents duplicate entries
✓ Gives you split-view to catch mismatches
✓ Scales to handle mass hiring
✓ Ready for production deployment

Are there any specific features or scenarios you'd like me to demonstrate?"

---

## HANDLING QUESTIONS

### "Can it handle 1000s of applications?"
"Absolutely. The current demo shows the core functionality. For production, we have an event-driven architecture with queue workers that can process thousands of emails concurrently. I can show you the architecture diagram if you'd like."

### "What about data security?"
"All authentication uses OAuth - no passwords stored. The system only reads emails, never sends or deletes. For production, we can deploy to your own AWS/GCP infrastructure so all data stays in your control."

### "Can it integrate with our CRM?"
"Yes! The SOW includes CRM integration via secure APIs. We can push candidate data directly to Salesforce, HubSpot, or any custom CRM."

### "What if the AI makes a mistake?"
"Great question. In production, we have a manual review queue for low-confidence extractions. Recruiters can approve/reject before data goes to the CRM. The AI confidence scores let you set thresholds."

### "How much does this cost to run?"
"The main costs are:
- Gmail API: Free for up to 1 billion requests/day
- Gemini AI: ~$0.0001 per extraction
- Hosting: Depends on your cloud provider
For 10,000 applications/month, you're looking at under $50 in AI costs."

---

## BACKUP PLANS

### If email configuration fails:
"Let me show you with the demo data already loaded. In production, the OAuth flow is seamless."

### If no emails show up:
"I'll trigger a manual refresh. The system scans every 10 seconds automatically, but I can force it now."

### If resume preview doesn't load:
"The download still works perfectly. Preview requires proper MIME type headers, which is environment-specific."

### If detail modal has issues:
"Let me show you the resume preview instead. Both features give you quick access to candidate information."

---

## POST-DEMO

1. **Get feedback**: "What did you think? Any features you'd like to see added?"
2. **Next steps**: "Would you like me to prepare a production deployment plan?"
3. **Timeline**: "We can have the full enterprise system deployed in 10 business days."
4. **Documentation**: "I'll send you the complete technical documentation and SOW."

---

## SUCCESS METRICS

Demo is successful if client:
- [ ] Understands the automation value
- [ ] Is impressed by AI extraction quality
- [ ] Sees the split email/CV view as unique
- [ ] Asks about production deployment
- [ ] Wants to proceed to next phase

---

**REMEMBER**: Be confident, smooth, and show enthusiasm! This is a powerful system - make them see that.
