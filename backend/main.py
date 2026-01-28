from __future__ import annotations

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from datetime import datetime
from pathlib import Path
import asyncio
from bson import ObjectId

from database import init_db, shutdown_db, Candidate, EmailConfig, User
from beanie.odm.fields import PydanticObjectId
from gmail_service import GmailService
from imap_service import IMAPService
from extractor import DataExtractor
from config import settings
from utils import generate_unique_id, check_duplicate_candidate
from oauth_handler import WebOAuthHandler
from session_manager import SessionManager

app = FastAPI(title="Email-to-Candidate Automation")

# Store current batch_id for tracking
current_batch_id: Optional[str] = None

# Scan progress tracking
scan_progress = {
    "batch_id": None,
    "status": "idle",  # idle, fetching, processing, complete, error
    "total_emails": 0,
    "processed_emails": 0,
    "current_subject": "",
    "candidates_added": 0,
    "skipped": 0,
    "errors": 0,
    "message": ""
}

# Current recruiter ID for tracking who is scanning
current_recruiter_id: Optional[str] = None

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://76.13.17.251:3005",
    "http://crm.76.13.17.251.nip.io:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Dependency
async def current_user_dependency(
    authorization: Optional[str] = Header(None),
) -> User:
    """Extract and verify user from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token provided")
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    # Verify JWT
    payload = SessionManager.verify_session(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    try:
        user = await User.get(PydanticObjectId(payload["user_id"]))
    except Exception:
        user = None
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# Create upload directory
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Pydantic models
class EmailConfigRequest(BaseModel):
    email: str

class ScanRequest(BaseModel):
    search_query: Optional[str] = None
    hours_back: Optional[int] = None
    recruiter_id: Optional[int] = None  # Who is performing the scan

class CVDataUpdate(BaseModel):
    cv_data: dict

class NotesUpdate(BaseModel):
    notes: str

class TagsUpdate(BaseModel):
    tags: List[str]

class LoginRequest(BaseModel):
    # OAuth (Gmail) or IMAP (Outlook/Yahoo) authentication
    method: Optional[str] = 'oauth'  # 'oauth' or 'imap'
    provider: Optional[str] = None  # For IMAP: 'outlook', 'yahoo'
    email: Optional[str] = None  # For IMAP
    password: Optional[str] = None  # For IMAP (app password)

class CandidateResponse(BaseModel):
    id: str
    unique_id: str  # Added 10-char unique ID
    name: str
    email: str
    phone: str | None = None
    email_subject: str
    email_from: str | None = None
    email_to: str | None = None
    email_cc: str | None = None
    email_date: datetime | None = None
    resume_filename: str | None = None
    notes: str | None = None  # Added notes
    tags: List[str] | None = None  # Added tags
    created_at: datetime
    recruiter_id: str | None = None  # Who saved this candidate
    recruiter_name: str | None = None  # Recruiter's name for display
    
    class Config:
        from_attributes = True

class CandidateDetailResponse(BaseModel):
    id: str
    unique_id: str  # Added 10-char unique ID
    name: str
    email: str
    phone: str | None = None
    email_subject: str
    email_from: str | None = None
    email_to: str | None = None
    email_cc: str | None = None
    email_body: str | None = None
    email_body_html: str | None = None
    email_signature: str | None = None
    email_date: datetime | None = None
    resume_filename: str | None = None
    resume_text: str | None = None
    resume_path: str | None = None  # Added for download
    cv_data: dict | None = None
    notes: str | None = None  # Added notes
    tags: List[str] | None = None  # Added tags
    extracted_phones: List[str] | None = None
    extracted_emails: List[str] | None = None
    extracted_links: List[str] | None = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Services
gmail_service = GmailService()
imap_service = IMAPService()
extractor = DataExtractor()

# Store current email service being used
current_email_service = None  # Will be gmail_service or imap_service

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting Email-to-Candidate Automation System...")
    await init_db()
    print("✅ MongoDB/Beanie initialized")


@app.on_event("shutdown")
async def shutdown_event():
    await shutdown_db()


def _serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


async def _recruiter_names_map(recruiter_ids: list[str]) -> dict[str, str]:
    obj_ids: list[ObjectId] = []
    for rid in recruiter_ids:
        try:
            obj_ids.append(ObjectId(rid))
        except Exception:
            continue
    if not obj_ids:
        return {}
    users = await User.find({"_id": {"$in": obj_ids}}).to_list()
    return {str(u.id): (u.name or u.email) for u in users}


async def _candidate_to_dict(candidate: Candidate, recruiter_name: str | None = None) -> dict:
    data = candidate.model_dump()
    data["id"] = str(candidate.id)
    data.pop("_id", None)
    data["recruiter_name"] = recruiter_name
    return data

@app.post("/api/configure-email")
async def configure_email(
    request: EmailConfigRequest,
    background_tasks: BackgroundTasks,
):
    """Configure email monitoring and trigger initial scan"""
    try:
        # Save email config
        config = await EmailConfig.find_one(EmailConfig.email_address == request.email)
        if not config:
            config = EmailConfig(email_address=request.email, is_active=True)
            await config.insert()
        else:
            await config.set({EmailConfig.is_active: True})
        
        # Authenticate with Gmail
        gmail_service.authenticate()
        
        return {
            "success": True,
            "message": f"Email monitoring configured for {request.email}. Ready to scan emails.",
            "email": request.email
        }
    
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration failed: {str(e)}")

@app.post("/api/scan")
async def trigger_scan(
    background_tasks: BackgroundTasks, 
    request: ScanRequest = None,
    current_user: User = Depends(current_user_dependency),
):
    """Manually trigger email scan - uses current user's Gmail tokens"""
    global current_batch_id, current_recruiter_id
    
    print(f"📧 Scan initiated by user: {current_user.email}")
    
    # Verify user has Gmail connected with proper tokens
    if not current_user.gmail_access_token or not current_user.gmail_refresh_token:
        missing = []
        if not current_user.gmail_access_token:
            missing.append("access token")
        if not current_user.gmail_refresh_token:
            missing.append("refresh token")
        
        print(f"❌ User {current_user.email} missing: {', '.join(missing)}")
        raise HTTPException(
            status_code=400,
            detail=f"Gmail not properly connected (missing: {', '.join(missing)}). Please logout and login again with Gmail to grant full access."
        )
    
    search_query = request.search_query if request else None
    hours_back = request.hours_back if request else None
    recruiter_id = str(current_user.id)  # Use current user's ID
    
    # Generate new batch ID for this scan
    current_batch_id = str(uuid.uuid4())[:8]
    current_recruiter_id = recruiter_id
    
    # Pass user id to background task
    background_tasks.add_task(
        scan_emails_task, 
        search_query, 
        hours_back, 
        current_batch_id, 
        recruiter_id,
        recruiter_id,  # recruiter_id
        str(current_user.id),  # user_id
    )
    
    return {
        "success": True, 
        "message": f"Email scan started for {current_user.email}", 
        "search_query": search_query,
        "batch_id": current_batch_id
    }

@app.get("/api/scan-progress")
async def get_scan_progress():
    """Get real-time scan progress"""
    return scan_progress

class DeleteCandidatesRequest(BaseModel):
    """Request to delete selected candidates from database"""
    candidate_ids: List[str]

@app.post("/api/delete-candidates")
async def delete_selected_candidates(
    request: DeleteCandidatesRequest,
):
    """Delete selected candidates from database"""
    obj_ids: list[ObjectId] = []
    for candidate_id in request.candidate_ids:
        try:
            obj_ids.append(ObjectId(str(candidate_id)))
        except Exception:
            continue

    deleted_count = 0
    if obj_ids:
        res = await Candidate.find({"_id": {"$in": obj_ids}}).delete()
        deleted_count = int(getattr(res, "deleted_count", 0) or 0)
    
    return {
        "success": True,
        "deleted": deleted_count,
        "message": f"Deleted {deleted_count} candidates from database"
    }

@app.get("/api/candidates")
async def get_candidates(
    skip: int = 0,
    limit: int = 100,
    search: str = Query(None),
    cv_freshness: str = Query(None),
    experience_years: str = Query(None),
    education_degree: str = Query(None),
    residence_location: str = Query(None),
    gender: str = Query(None),
    # New Filters
    filter_position: str = Query(None),
    filter_skills: str = Query(None),
    filter_companies: str = Query(None),
    # Old Filters (Keep for backward compatibility)
    salary_min: int = Query(None),
    salary_max: int = Query(None),
    career_level: str = Query(None),
    target_job_location: str = Query(None),
    employment_type: str = Query(None),
    notice_period: int = Query(None),
    degree: str = Query(None),
    major: str = Query(None),
    grade: str = Query(None),
    institution: str = Query(None),
    has_contact_info: bool = Query(False),
    has_mobile_confirmed: bool = Query(False),
    has_photo: bool = Query(False),
    has_experience: bool = Query(False)
):
    import re
    base_query: dict = {}
    candidates = await Candidate.find(base_query).sort(-Candidate.created_at).skip(skip).limit(limit).to_list()
    
    filtered_candidates = []
    
    for c in candidates:
        # Basic Search (Name, Email, Phone)
        if search:
            search_lower = search.lower()
            if not (search_lower in (c.name or "").lower() or 
                    search_lower in (c.email or "").lower() or 
                    search_lower in (c.phone or "").lower() or
                    search_lower in (c.email_subject or "").lower()):
                continue
        
        cv_data = c.cv_data or {}
                
        personal = cv_data.get('personal_info', {})
        professional = cv_data.get('professional_info', {})
        
        # New Filters
        if filter_skills:
            candidate_skills = [s.lower() for s in cv_data.get('skills', [])]
            search_skills = [s.strip().lower() for s in filter_skills.split(',')]
            # Check if ANY of the search skills are present (partial match)
            if not any(any(s in cs for cs in candidate_skills) for s in search_skills):
                continue

        if filter_position:
            # Check work history for job titles
            work_history = cv_data.get('work_history', [])
            position_match = False
            for work in work_history:
                if filter_position.lower() in work.get('job_title', '').lower():
                    position_match = True
                    break
            if not position_match:
                continue

        if filter_companies:
            # Check work history for companies
            work_history = cv_data.get('work_history', [])
            company_match = False
            for work in work_history:
                if filter_companies.lower() in work.get('company', '').lower():
                    company_match = True
                    break
            if not company_match:
                continue

        # CV Freshness
        if cv_freshness and cv_freshness != 'all':
            email_date = c.email_date
            if email_date:
                try:
                    # Simple check if email_date is populated (logic to parse date can be complex, skipping strict date check for now unless needed)
                    # For now just checking if recent:
                    # TODO: strict date parsing from "Wed, 01 Jan 2025" etc. 
                    pass
                except:
                    pass

        # Experience Years
        if experience_years:
            exp_str = professional.get('years_experience', '0')
            try:
                years = int(re.search(r'\d+', str(exp_str)).group()) if re.search(r'\d+', str(exp_str)) else 0
            except:
                years = 0
                
            if experience_years == '0-1' and not (0 <= years <= 1): continue
            if experience_years == '1-3' and not (1 < years <= 3): continue
            if experience_years == '3-5' and not (3 < years <= 5): continue
            if experience_years == '5-10' and not (5 < years <= 10): continue
            if experience_years == '10+' and not (years > 10): continue

        # Education Degree
        if education_degree:
            edu_list = cv_data.get('education', [])
            if not any(education_degree.lower() in e.get('degree', '').lower() for e in edu_list):
                continue

        # Location
        if residence_location:
            loc = personal.get('location', '')
            if residence_location.lower() not in loc.lower():
                continue

        # Gender (inferred - strict check might not be possible without explicit field in new parser)
        # if gender: ... (skipped as parser doesn't strictly extract gender currently, but kept placeholder)

        filtered_candidates.append(c)
    
    # Build result with recruiter names (batch fetch)
    recruiter_ids = [c.recruiter_id for c in filtered_candidates if c.recruiter_id]
    recruiter_map = await _recruiter_names_map(recruiter_ids)

    result = []
    for c in filtered_candidates:
        cv_data_parsed = c.cv_data

        # Prioritize extracted name
        display_name = c.name
        if cv_data_parsed and isinstance(cv_data_parsed, dict):
             extracted_name = cv_data_parsed.get('personal_info', {}).get('name')
             if extracted_name and len(extracted_name) > 2:
                 display_name = extracted_name

        d = await _candidate_to_dict(c, recruiter_map.get(c.recruiter_id) if c.recruiter_id else None)
        d["name"] = display_name
        result.append(d)
    
    return result

@app.get("/api/batches")
async def get_batches():
    """Get all unique batch IDs with counts"""
    pipeline = [
        {"$match": {"batch_id": {"$ne": None}}},
        {"$group": {"_id": "$batch_id", "count": {"$sum": 1}, "created_at": {"$max": "$created_at"}}},
        {"$sort": {"created_at": -1}},
    ]
    cursor = Candidate.get_motor_collection().aggregate(pipeline)
    batches = await cursor.to_list(length=None)
    return [{"batch_id": b["_id"], "count": b["count"], "created_at": b.get("created_at")} for b in batches]

@app.get("/api/candidates/{candidate_id}", response_model=CandidateDetailResponse)
async def get_candidate_detail(candidate_id: str):
    """Get full candidate details including email body and CV data"""
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        candidate = None
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return CandidateDetailResponse(**(await _candidate_to_dict(candidate)))

@app.get("/api/candidates/{candidate_id}/email-html")
async def get_candidate_email_html(candidate_id: str):
    """Get the HTML email body for display in new tab"""
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        candidate = None
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Return HTML email if available, otherwise format plain text as HTML
    if candidate.email_body_html:
        html_content = candidate.email_body_html
    else:
        # Convert plain text to basic HTML
        body_text = candidate.email_body or "No email body available"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{candidate.email_subject or 'Email'}</title>
            <style>
                body {{ font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }}
                .header {{ background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }}
                .header h2 {{ margin: 0 0 10px 0; }}
                .header p {{ margin: 5px 0; color: #666; }}
                .body {{ white-space: pre-wrap; line-height: 1.6; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>{candidate.email_subject or 'No Subject'}</h2>
                <p><strong>From:</strong> {candidate.email_from or 'Unknown'}</p>
                <p><strong>To:</strong> {candidate.email_to or 'Unknown'}</p>
                {f'<p><strong>CC:</strong> {candidate.email_cc}</p>' if candidate.email_cc else ''}
                <p><strong>Date:</strong> {candidate.email_date.strftime('%Y-%m-%d %H:%M') if candidate.email_date else 'Unknown'}</p>
            </div>
            <div class="body">{body_text}</div>
        </body>
        </html>
        """
    
    return HTMLResponse(content=html_content)

@app.put("/api/candidates/{candidate_id}/cv-data")
async def update_candidate_cv_data(
    candidate_id: str, 
    update: CVDataUpdate,
):
    """Update candidate CV data (editable form)"""
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        candidate = None
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    await candidate.set({Candidate.cv_data: update.cv_data, Candidate.updated_at: datetime.utcnow()})
    
    return {"success": True, "message": "CV data updated successfully"}

@app.put("/api/candidates/{candidate_id}/notes")
async def update_candidate_notes(
    candidate_id: str,
    update: NotesUpdate,
):
    """Update candidate notes"""
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        candidate = None
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    await candidate.set({Candidate.notes: update.notes, Candidate.updated_at: datetime.utcnow()})
    
    return {"success": True, "message": "Notes updated successfully"}

@app.put("/api/candidates/{candidate_id}/tags")
async def update_candidate_tags(
    candidate_id: str,
    update: TagsUpdate,
):
    """Update candidate tags"""
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        candidate = None
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    await candidate.set({Candidate.tags: update.tags, Candidate.updated_at: datetime.utcnow()})
    
    return {"success": True, "message": "Tags updated successfully", "tags": update.tags}

@app.post("/api/auth/login")
async def login(request: LoginRequest = LoginRequest()):
    """
    Hybrid login: OAuth for Gmail, IMAP for Outlook/Yahoo
    Returns user info if authenticated
    """
    global current_email_service
    
    try:
        email = None
        
        # IMAP Authentication (Outlook/Yahoo)
        if request.method == 'imap' and request.email and request.password:
            print(f"🔐 IMAP login attempt for {request.email}")
            
            # Connect via IMAP
            imap_service.connect(request.email, request.password, request.provider)
            current_email_service = imap_service
            
            # Get user profile
            user_info = imap_service.get_user_profile()
            email = user_info.get('emailAddress', request.email)
            
        # OAuth Authentication (Gmail - default)
        else:
            print("🔐 OAuth login attempt (Gmail)")
            
            # For web-based OAuth, check if token already exists and is valid
            if os.path.exists(settings.GMAIL_TOKEN_FILE):
                try:
                    gmail_service.authenticate()
                    current_email_service = gmail_service
                    user_info = gmail_service.get_user_profile()
                    email = user_info.get('emailAddress', '')
                except Exception as e:
                    print(f"❌ Token authentication failed: {e}")
                    # Delete old token and require re-auth
                    if os.path.exists(settings.GMAIL_TOKEN_FILE):
                        os.remove(settings.GMAIL_TOKEN_FILE)
                    raise HTTPException(
                        status_code=401,
                        detail="Please connect Gmail again - authentication expired"
                    )
            else:
                # No token exists - need to authenticate
                try:
                    gmail_service.authenticate()
                    current_email_service = gmail_service
                    user_info = gmail_service.get_user_profile()
                    email = user_info.get('emailAddress', '')
                except Exception as e:
                    print(f"❌ Gmail authentication failed: {e}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Gmail authentication failed: {str(e)}"
                    )
        
        if not email:
            raise ValueError("Could not retrieve email address")
        
        # Check if user exists, create if not
        user = await User.find_one(User.email == email)
        if not user:
            user = User(
                email=email,
                name=email.split('@')[0],  # Use email prefix as name
                is_active=True
            )
            await user.insert()
        
        await user.set({User.last_login: datetime.utcnow()})
        
        return {
            "success": True,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
            },
            "method": request.method or 'oauth',
            "message": "Login successful"
        }
    
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

@app.post("/api/auth/logout")
async def logout():
    """Logout (clear session and force account selection on next login)"""
    global current_email_service
    
    # Disconnect from email service
    if current_email_service:
        if hasattr(current_email_service, 'disconnect'):
            current_email_service.disconnect()
        current_email_service = None
    
    # Delete token.json to force account selection on next login
    if os.path.exists(settings.GMAIL_TOKEN_FILE):
        try:
            os.remove(settings.GMAIL_TOKEN_FILE)
            print("✅ Deleted token.json - next login will prompt for account selection")
        except Exception as e:
            print(f"⚠️ Could not delete token.json: {e}")
    
    return {" success": True, "message": "Logged out successfully. Next login will prompt for account selection."}

# ============================
# NEW: Web OAuth Endpoints for Multi-User Support
# ============================

# Store OAuth states temporarily (in production, use Redis or database)
oauth_states = {}

@app.get("/api/auth/google/login")
async def google_oauth_login():
    """
    Initiate OAuth flow - returns Google OAuth URL for user to visit
    """
    try:
        oauth_handler = WebOAuthHandler()
        auth_data = oauth_handler.generate_auth_url()
        
        # Store state for verification (in production, use Redis with expiry)
        oauth_states[auth_data['state']] = {
            'created_at': datetime.utcnow().isoformat(),
            'used': False
        }
        
        return {
            "success": True,
            "auth_url": auth_data['auth_url'],
            "message": "Redirect user to auth_url"
        }
    except Exception as e:
        print(f"❌ Error generating OAuth URL: {e}")
        raise HTTPException(status_code=500, detail=f"OAuth initialization failed: {str(e)}")

@app.get("/api/auth/google/callback")
async def google_oauth_callback(
    code: str = Query(..., description="Authorization code from Google"),
    state: str = Query(..., description="State for CSRF protection"),
):
    """
    OAuth callback - exchanges code for tokens and creates session
    """
    try:
        # Verify state
        if state not in oauth_states or oauth_states[state].get('used'):
            raise HTTPException(status_code=400, detail="Invalid or expired state")
        
        # Mark state as used
        oauth_states[state]['used'] = True
        
        # Exchange code for tokens
        oauth_handler = WebOAuthHandler()
        token_data = oauth_handler.handle_callback(code, state, state)
        
        # Get or create user
        user = await User.find_one(User.email == token_data["email"])
        if not user:
            user = User(
                email=token_data['email'],
                name=token_data['email'].split('@')[0],
                is_active=True
            )
            await user.insert()
        
        # Store tokens in user record
        await user.set(
            {
                User.gmail_access_token: token_data["access_token"],
                User.gmail_refresh_token: token_data["refresh_token"],
                User.gmail_token_expiry: datetime.fromisoformat(token_data["token_expiry"])
                if token_data.get("token_expiry")
                else None,
                User.gmail_scopes: token_data["scopes"],
                User.last_login: datetime.utcnow(),
            }
        )
        
        # Create session
        session_token = SessionManager.create_session(user)
        
        # Return HTML that closes window or redirects
        return HTMLResponse(f"""
        <html>
        <head><title>Login Successful</title></head>
        <body>
            <script>
                // Store session token
                const sessionData = {{
                    token: '{session_token}',
                    user: {{
                        id: '{str(user.id)}',
                        email: '{user.email}',
                        name: '{user.name}'
                    }}
                }};
                
                console.log('OAuth callback loaded', sessionData);
                console.log('window.opener exists:', !!window.opener);
                
                // Try to send to parent window (popup scenario)
                if (window.opener && !window.opener.closed) {{
                    console.log('Sending message to opener...');
                    window.opener.postMessage({{
                        type: 'OAUTH_SUCCESS',
                        data: sessionData
                    }}, '*');  // Use '*' for localhost development
                    console.log('Message sent, closing window...');
                    setTimeout(() => {{
                        window.close();
                        console.log('Close attempted');
                    }}, 1000);
                }} else {{
                    console.log('No opener, using redirect fallback');
                    // Redirect scenario
                    localStorage.setItem('crm_session', JSON.stringify(sessionData));
                    window.location.href = 'http://localhost:3000/';
                }}
            </script>
            <h2>✅ Login Successful!</h2>
            <p>Redirecting...</p>
            <p><small>If window doesn't close, <a href="javascript:window.close()">click here</a></small></p>
        </body>
        </html>
        """)
        
    except Exception as e:
        print(f"❌ OAuth callback error: {e}")
        return HTMLResponse(f"""
        <html>
        <head><title>Login Failed</title></head>
        <body>
            <h2>❌ Login Failed</h2>
            <p>{str(e)}</p>
            <script>
                if (window.opener) {{
                    window.opener.postMessage({{
                        type: 'OAUTH_ERROR',
                        error: '{str(e)}'
                    }}, window.location.origin);
                    window.close();
                }} else {{
                    setTimeout(() => window.location.href = '/', 3000);
                }}
            </script>
        </body>
        </html>
        """, status_code=401)

@app.get("/api/auth/me")
async def auth_me(
    authorization: Optional[str] = Query(None, alias="session_token"),
):
    """
    Get current authenticated user from session token
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No session token provided")
    
    # Verify session
    payload = SessionManager.verify_session(authorization)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Get user from database
    try:
        user = await User.get(PydanticObjectId(payload["user_id"]))
    except Exception:
        user = None
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "user": _serialize_user(user),
    }

# ============================
# END: New OAuth Endpoints
# ============================

@app.post("/api/auth/disconnect")
async def disconnect_email():
    """Disconnect from email but keep user session"""
    global current_email_service
    
    # Disconnect from email service
    if current_email_service:
        if hasattr(current_email_service, 'disconnect'):
            current_email_service.disconnect()
        current_email_service = None
    
    return {"success": True, "message": "Email disconnected"}

@app.post("/api/reset-session")
async def reset_session():
    """Reset scan session without logging out"""
    global scan_progress, current_batch_id
    
    # Reset scan progress
    scan_progress = {
        "batch_id": None,
        "status": "idle",
        "total_emails": 0,
        "processed_emails": 0,
        "current_subject": "",
        "candidates_added": 0,
        "skipped": 0,
        "errors": 0,
        "message": ""
    }
    current_batch_id = None
    
    return {"success": True, "message": "Session reset successfully"}

@app.get("/api/resume/{candidate_id}")
async def download_resume(candidate_id: str):
    """Download candidate resume"""
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        candidate = None
    if not candidate or not candidate.resume_path:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not os.path.exists(candidate.resume_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    return FileResponse(
        candidate.resume_path,
        filename=candidate.resume_filename,
        media_type='application/octet-stream'
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "email-to-candidate-automation"}

@app.get("/api/status")
async def get_status():
    """Get current configuration status"""
    config = await EmailConfig.find_one(EmailConfig.is_active == True)
    candidate_count = await Candidate.count()
    
    return {
        "configured": config is not None,
        "email": config.email_address if config else None,
        "last_scan": config.last_scan.isoformat() if config and config.last_scan else None,
        "candidate_count": candidate_count
    }

@app.post("/api/live-scan")
async def live_scan(
    background_tasks: BackgroundTasks,
):
    """Quick scan for new emails in the last 5 minutes (for live mode)"""
    global current_batch_id
    
    # Use a special live batch ID
    live_batch_id = f"live-{str(uuid.uuid4())[:4]}"
    
    # Scan only last 5 minutes of emails
    background_tasks.add_task(scan_emails_task, "in:inbox", 1, live_batch_id, None, None)
    
    return {
        "success": True,
        "message": "Live scan started",
        "batch_id": live_batch_id
    }

@app.get("/api/latest-candidates")
async def get_latest_candidates(
    since_id: Optional[str] = Query(None, description="Get candidates with _id greater than this"),
    limit: int = Query(20, description="Max number of results"),
):
    """Get latest candidates for live updates"""
    find_query: dict = {}
    if since_id:
        try:
            find_query["_id"] = {"$gt": ObjectId(since_id)}
        except Exception:
            find_query = {}

    candidates = await Candidate.find(find_query).sort(-Candidate.id).limit(limit).to_list()
    
    return {
        "candidates": [await _candidate_to_dict(c) for c in candidates],
        "latest_id": str(candidates[0].id) if candidates else since_id,
        "count": len(candidates)
    }


# Background task
async def scan_emails_task(
    search_query: str = None,
    hours_back: int = None,
    batch_id: str = None,
    recruiter_id: str | None = None,
    user_id: str | None = None,
):
    """Scan emails using current user's Gmail tokens and save to database"""
    global scan_progress, current_recruiter_id, current_email_service
    
    try:
        # Import here to avoid circular dependency
        from googleapiclient.discovery import build
        
        # Create user-specific Gmail service
        user = None
        if user_id:
            try:
                user = await User.get(PydanticObjectId(user_id))
            except Exception:
                user = None

        if user and user.gmail_access_token and user.gmail_refresh_token:
            print(f"📧 Creating Gmail service for {user.email}")
            oauth_handler = WebOAuthHandler()
            
            try:
                # Get user's credentials
                creds = oauth_handler.get_credentials_from_tokens(
                    access_token=user.gmail_access_token,
                    refresh_token=user.gmail_refresh_token,
                    token_expiry=user.gmail_token_expiry
                )
                
                # Check if token was refreshed
                if creds.token != user.gmail_access_token:
                    await user.set({User.gmail_access_token: creds.token, User.gmail_token_expiry: creds.expiry})
                    print(f"✅ Refreshed token for {user.email}")
                
                # Create GmailService with user's credentials
                user_gmail_service = GmailService()
                user_gmail_service.creds = creds
                user_gmail_service.service = build('gmail', 'v1', credentials=creds)
                email_service = user_gmail_service
                current_email_service = user_gmail_service
                print(f"✅ Gmail service created for {user.email}")
                
            except Exception as e:
                print(f"❌ Failed to create Gmail service: {e}")
                scan_progress = {
                    "batch_id": batch_id,
                    "status": "error",
                    "message": f"Gmail authentication failed: {str(e)}"
                }
                return
        else:
            # Fallback to global email service (legacy)
            email_service = current_email_service or gmail_service
        
        # Store recruiter_id for tracking
        current_recruiter_id = recruiter_id
        scan_progress = {
            "batch_id": batch_id,
            "status": "fetching",
            "total_emails": 0,
            "processed_emails": 0,
            "current_subject": f"Connecting to {user.email if user else 'Gmail'}...",
            "candidates_added": 0,
            "skipped": 0,
            "errors": 0,
            "message": f"Fetching emails from {user.email if user else 'Gmail'}..."
        }
        
        print(f"📧 Scanning for emails... (Batch: {batch_id})")
        print(f"🔍 Search Query: '{search_query or 'None (using default job filter)'}'")
        
        # Get emails based on search query or default to job-related
        if search_query:
            emails = email_service.get_emails(search_query=search_query, hours_back=hours_back)
        else:
            # No query provided - use a basic job-related search
            default_query = "(job OR application OR resume OR cv OR hiring)"
            print(f"   Using default query: {default_query}")
            emails = email_service.get_emails(search_query=default_query, hours_back=hours_back)
        
        total = len(emails)
        scan_progress["total_emails"] = total
        scan_progress["status"] = "processing"
        scan_progress["message"] = f"Found {total} emails. Processing..."
        print(f"Found {total} emails")
        
        for idx, email_data in enumerate(emails):
            try:
                # Update progress
                scan_progress["processed_emails"] = idx + 1
                scan_progress["current_subject"] = email_data.get('subject', 'No subject')[:50]
                scan_progress["message"] = f"Processing {idx + 1}/{total}: {email_data.get('subject', '')[:30]}..."
                
                # Check if this email was already processed (by Gmail message ID)
                existing_message = await check_duplicate_candidate(email_data["id"])
                
                if existing_message:
                    scan_progress["skipped"] += 1
                    print(f"⏭️  Skipping duplicate email ID: {email_data['id'][:20]}... (Unique ID: {existing_message.unique_id})")
                    continue
                
                print(f"📨 Processing: {email_data['subject']}")
                
                # Extract info from email
                email_extracted = extractor.extract_from_email(
                    email_data.get('body', ''),
                    email_data.get('signature', '')
                )
                
                # Download attachment and extract data
                resume_text = ""
                resume_path = None
                resume_filename = None
                cv_data = None
                spreadsheet_data = None
                
                attachments_list = email_data.get('attachments', [])
                print(f"   📎 Attachments found: {len(attachments_list)}")
                for att in attachments_list:
                    print(f"      - {att.get('filename', 'unknown')}")
                
                for attachment in attachments_list:
                    filename = attachment['filename'].lower()
                    original_filename = attachment['filename']
                    
                    # Check for supported file types
                    is_resume = filename.endswith(('.pdf', '.doc', '.docx'))
                    is_spreadsheet = filename.endswith(('.csv', '.xlsx', '.xls'))
                    is_image = filename.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'))
                    
                    print(f"   📄 Processing: {original_filename} (resume={is_resume}, spreadsheet={is_spreadsheet}, image={is_image})")
                    
                    if is_resume or is_spreadsheet or is_image:
                        # Download attachment
                        print(f"   ⬇️  Downloading attachment...")
                        file_data = email_service.download_attachment(
                            email_data['id'],
                            attachment['attachmentId']
                        )
                        
                        if file_data:
                            print(f"   ✅ Downloaded {len(file_data)} bytes")
                            # Save file
                            resume_filename = attachment['filename']
                            safe_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{resume_filename}"
                            resume_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
                            
                            with open(resume_path, 'wb') as f:
                                f.write(file_data)
                            
                            # Extract text based on file type
                            print(f"   📄 Extracting text from {filename}...")
                            if filename.endswith('.pdf'):
                                resume_text = extractor.extract_text_from_pdf(resume_path)
                            elif filename.endswith(('.doc', '.docx')):
                                resume_text = extractor.extract_text_from_docx(resume_path)
                            elif filename.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif')):
                                print(f"   🖼️  Running OCR on image...")
                                resume_text = extractor.extract_text_from_image(resume_path)
                                print(f"   ✅ OCR extracted {len(resume_text)} characters")
                            
                            # Always extract as RESUME (no document type detection)
                            if resume_text:
                                print(f"   🔍 Parsing resume data...")
                                cv_data = extractor.extract_from_resume(resume_text)
                                print(f"   ✅ Extracted: {cv_data.get('personal_info', {}).get('full_name', 'Unknown')}")
                            else:
                                print(f"   ⚠️ No text extracted from file")
                                cv_data = None
                            
                            break  # Use first attachment found
                
                # Parse sender email for candidate email
                from_email = email_data.get('from', '')
                # Extract email from "Name <email@domain.com>" format
                import re
                email_match = re.search(r'<([^>]+)>', from_email)
                candidate_email = email_match.group(1) if email_match else from_email
                
                # Try to get name from CV data, email extraction, or sender
                candidate_name = ""
                if cv_data and cv_data.get('personal_info', {}).get('full_name'):
                    candidate_name = cv_data['personal_info']['full_name']
                elif email_extracted.get('name'):
                    candidate_name = email_extracted['name']
                else:
                    # Extract name from "Name <email>" format
                    name_match = re.match(r'^([^<]+)', from_email)
                    candidate_name = name_match.group(1).strip() if name_match else "Unknown"
                
                # Get phone from CV data or email extraction
                candidate_phone = ""
                if cv_data and cv_data.get('contact_details', {}).get('mobile_numbers'):
                    candidate_phone = ', '.join(cv_data['contact_details']['mobile_numbers'])
                elif email_extracted.get('phones'):
                    candidate_phone = ', '.join(email_extracted['phones'])
                
                # Generate unique 10-character ID
                email_date = email_data.get('date', datetime.now())
                if isinstance(email_date, str):
                    email_date = datetime.now()
                
                unique_id = generate_unique_id(
                    email_data.get('subject', 'no-subject'),
                    email_date,
                    candidate_email
                )
                print(f"   🆔 Generated unique ID: {unique_id}")
                
                # Save candidate directly to database
                candidate = Candidate(
                    unique_id=unique_id,
                    gmail_message_id=email_data['id'],
                    batch_id=batch_id,
                    recruiter_id=recruiter_id,
                    name=candidate_name,
                    email=candidate_email,
                    phone=candidate_phone,
                    email_subject=email_data.get('subject', ''),
                    email_from=email_data.get('from', ''),
                    email_to=email_data.get('to', ''),
                    email_cc=email_data.get('cc', ''),
                    email_body=email_data.get('body', ''),
                    email_body_html=email_data.get('body_html', ''),
                    email_signature=email_data.get('signature', ''),
                    email_date=datetime.now(),
                    resume_path=resume_path,
                    resume_filename=resume_filename,
                    resume_text=resume_text,
                    cv_data=cv_data,
                    extracted_phones=email_extracted.get('phones', []) or [],
                    extracted_emails=email_extracted.get('emails', []) or [],
                    extracted_links=email_extracted.get('other_links', []) or [],
                    tags=['Scanned'],  # Auto-tag as scanned
                )
                
                await candidate.insert()
                scan_progress["candidates_added"] += 1
                print(f"✅ Saved candidate to DB: {candidate_name} (ID: {unique_id})")
            
            except Exception as e:
                scan_progress["errors"] += 1
                print(f"❌ Error processing email: {str(e)}")
                continue
        
        # Update last scan time
        config = await EmailConfig.find_one()
        if config:
            await config.set({EmailConfig.last_scan: datetime.now()})
        
        # Mark scan as complete
        scan_progress["status"] = "complete"
        scan_progress["message"] = f"Scan complete! {scan_progress['candidates_added']} candidates saved to database."
        print("✅ Email scan completed - all candidates saved to database")
    
    except Exception as e:
        scan_progress["status"] = "error"
        scan_progress["message"] = f"Error: {str(e)}"
        print(f"❌ Scan error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
