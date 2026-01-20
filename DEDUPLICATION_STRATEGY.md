# Smart Deduplication Strategy

## Current Strategy (Updated)

The system now uses **TWO-LEVEL deduplication** to prevent spam while allowing legitimate applications:

### Level 1: Gmail Message ID ✅
**Purpose**: Don't reprocess the same email twice
```python
existing_message = db.query(Candidate).filter(
    Candidate.gmail_message_id == email_data['id']
).first()
```
- Checks if this exact Gmail message was already processed
- Prevents system from processing the same email multiple times

### Level 2: Email + Position Combination ✅
**Purpose**: Prevent spam applications (same person for same role)
```python
existing_application = db.query(Candidate).filter(
    Candidate.email == candidate_email,
    Candidate.position == candidate_position
).first()
```
- Checks if this email address already applied for this specific position
- Emails are normalized (lowercase, trimmed)
- Positions are normalized (lowercase, trimmed)

---

## Examples:

### ✅ ALLOWED: Different People, Same Position
- john@gmail.com → "Full Stack Developer" → **Saved**
- sarah@gmail.com → "Full Stack Developer" → **Saved**
- 1000 different emails → "Full Stack Developer" → **All saved**

### ✅ ALLOWED: Same Person, Different Positions
- john@gmail.com → "Frontend Developer" → **Saved**
- john@gmail.com → "Backend Developer" → **Saved**
- john@gmail.com → "Full Stack Developer" → **Saved**

### ❌ BLOCKED: Same Person, Same Position (Spam)
- john@gmail.com → "Full Stack Developer" → **Saved** ✅
- john@gmail.com → "Full Stack Developer" (2nd email) → **Skipped** ❌
- john@gmail.com → "Full Stack Developer" (3rd email) → **Skipped** ❌
- ...10 emails later...
- john@gmail.com → "Full Stack Developer" (10th email) → **Skipped** ❌

**Result**: Only the FIRST application from john@gmail.com for "Full Stack Developer" is saved.

---

## Benefits:

1. **Prevents Spam**: Same person can't flood system with 10 emails for same role
2. **Allows Legitimate Multi-Role**: Person can apply to multiple different positions
3. **Handles Team Hiring**: 1000 different people can apply for same position
4. **No False Positives**: Uses actual extracted email/position, not subject line

---

## Edge Cases Handled:

### Case 1: Person Uses Different Emails for Same Position
- john@gmail.com → "Developer" → Saved
- john.doe@yahoo.com → "Developer" → Saved
**Result**: Treated as 2 different people (correct behavior)

### Case 2: Similar Position Names
- "Full Stack Developer" vs "Full-Stack Developer"
**Result**: Treated as different positions (lowercase comparison but not fuzzy)

### Case 3: Email Extraction Fails
- If AI can't extract email from resume/signature
- Falls back to "Not specified"
- Won't block other legitimate candidates

---

## Status: ✅ Implemented
- Code updated with 2-level deduplication
- Cleans up orphaned resume files when skipping duplicates
- Ready to test after backend restart
