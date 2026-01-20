import hashlib
import base64
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.database import Candidate

def generate_unique_id(email_subject: str, email_date: datetime, sender_email: str) -> str:
    """
    Generate a 10-character unique ID for a candidate
    Based on: email subject + date + sender email
    Uses MD5 hash → Base32 encoding → Take first 10 chars
    """
    # Combine unique identifiers
    unique_string = f"{email_subject.lower().strip()}{email_date.isoformat()}{sender_email.lower()}"
    
    # Create MD5 hash
    hash_obj = hashlib.md5(unique_string.encode('utf-8'))
    hash_bytes = hash_obj.digest()
    
    # Encode to base32 (alphanumeric, URL-safe)
    base32_encoded = base64.b32encode(hash_bytes).decode('utf-8')
    
    # Take first 10 characters (uppercase letters and numbers)
    unique_id = base32_encoded[:10]
    
    return unique_id

def check_duplicate_candidate(db: Session, gmail_message_id: str) -> Optional[Candidate]:
    """
    Check if a candidate already exists by Gmail message ID
    Returns existing candidate if found, None otherwise
    """
    existing = db.query(Candidate).filter(
        Candidate.gmail_message_id == gmail_message_id
    ).first()
    
    return existing

def check_duplicate_by_email_subject(db: Session, email_subject: str, email_date: datetime, sender_email: str) -> Optional[Candidate]:
    """
    Check if a candidate already exists by unique_id
    """
    unique_id = generate_unique_id(email_subject, email_date, sender_email)
    existing = db.query(Candidate).filter(
        Candidate.unique_id == unique_id
    ).first()
    
    return existing
