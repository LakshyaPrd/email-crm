# Smart Deduplication - Testing Guide

## System Status
✅ Backend running on http://localhost:8000
✅ Frontend running on http://localhost:3000
✅ Smart deduplication active

## How It Works

### Two-Level Check:
1. **Gmail Message ID**: Prevents reprocessing same email
2. **Email + Position**: Prevents spam applications

## Test Scenarios

### Scenario 1: Prevent Spam (Same Person, Same Job)
**Objective**: Verify system blocks duplicate applications

**Steps**:
1. Send email from `lakshya@gmail.com` with subject: "Application for Full Stack Developer"
2. Send ANOTHER email from `lakshya@gmail.com` with subject: "Applying for Full Stack Developer position"
3. Check dashboard

**Expected Result**: 
- ✅ First email appears
- ❌ Second email skipped (spam detected)
- Console shows: "lakshya@gmail.com already applied for full stack developer - skipping duplicate"

---

### Scenario 2: Allow Multi-Position (Same Person, Different Jobs)
**Objective**: Verify person can apply to multiple positions

**Steps**:
1. Send email from `lakshya@gmail.com` → "Application for Frontend Developer"
2. Send email from `lakshya@gmail.com` → "Application for Backend Developer"
3. Check dashboard

**Expected Result**:
- ✅ Frontend Developer application appears
- ✅ Backend Developer application appears
- Total: 2 candidates

---

### Scenario 3: Allow Mass Hiring (Different People, Same Job)
**Objective**: Verify 1000s can apply for same position

**Steps**:
1. Send email from `person1@gmail.com` → "Application for Python Developer"
2. Send email from `person2@gmail.com` → "Application for Python Developer"
3. Send email from `person3@gmail.com` → "Application for Python Developer"
4. Check dashboard

**Expected Result**:
- ✅ All 3 candidates appear
- Position: All show "Python Developer"

---

## Quick Test Email Template

### Email 1 (First Application - SHOULD SAVE)
**From**: Your personal email
**To**: pradhan2k4@gmail.com
**Subject**: Application for Full Stack Developer Position

**Body**:
```
Dear Hiring Team,

I am Lakshya Pradhan applying for the Full Stack Developer position.

I have 4 years of experience in:
- React, Next.js, TypeScript
- Python, FastAPI
- PostgreSQL, Docker

Please find my resume attached.

Best regards,
Lakshya Pradhan
lakshya@gmail.com
+91-1234567890
```
**Attach**: Any PDF resume

---

### Email 2 (Duplicate - SHOULD SKIP)
**From**: Same email as Email 1
**To**: pradhan2k4@gmail.com
**Subject**: Re-applying for Full Stack Developer

**Body**:
```
Dear Team,

This is my second email for the Full Stack Developer role.

I really want this position!

Thanks,
Lakshya Pradhan
lakshya@gmail.com
```
**Attach**: Same or different PDF resume

**Expected**: This should be SKIPPED (duplicate)

---

### Email 3 (Different Position - SHOULD SAVE)
**From**: Same email as Email 1
**To**: pradhan2k4@gmail.com
**Subject**: Application for Backend Developer Position

**Body**:
```
Dear Team,

I am Lakshya Pradhan applying for the Backend Developer position.

Experience:
- Python, Django, FastAPI
- PostgreSQL, Redis

Best regards,
Lakshya Pradhan
lakshya@gmail.com
```
**Attach**: Any PDF resume

**Expected**: This should be SAVED (different position)

---

## Monitoring Backend Logs

Watch the terminal running the backend to see:

```
📧 Scanning for job application emails...
Found 3 job-related emails
📨 Processing: Application for Full Stack Developer Position
✅ Added candidate: Lakshya Pradhan
⏭️  lakshya@gmail.com already applied for full stack developer - skipping duplicate
📨 Processing: Application for Backend Developer Position
✅ Added candidate: Lakshya Pradhan
✅ Email scan completed
```

---

## Summary

✅ **Blocks**: Same email, same position (10 attempts = only 1 saved)
✅ **Allows**: Same email, different positions (frontend + backend = 2 saved)
✅ **Allows**: Different emails, same position (1000 people = 1000 saved)

Start testing at http://localhost:3000!
