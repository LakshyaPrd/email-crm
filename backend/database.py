from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import settings

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)  # Gmail address
    name = Column(String, nullable=True)
    
    # OAuth Token Storage (per-user)
    gmail_access_token = Column(Text, nullable=True)  # Encrypted OAuth access token
    gmail_refresh_token = Column(Text, nullable=True)  # Encrypted OAuth refresh token
    gmail_token_expiry = Column(DateTime, nullable=True)  # When token expires
    gmail_scopes = Column(Text, nullable=True)  # JSON array of granted scopes
    
    # Legacy field (deprecated - will remove after migration)
    gmail_token = Column(Text, nullable=True)  # Old encrypted OAuth token
    
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationship
    candidates = relationship("Candidate", back_populates="recruiter")

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(10), unique=True, index=True)  # 10-char unique ID
    gmail_message_id = Column(String, unique=True, index=True)  # Unique Gmail message ID
    batch_id = Column(String, index=True, nullable=True)  # Scan batch/session ID for grouping
    recruiter_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Who scanned this
    
    # Basic info from email
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String, nullable=True)
    
    # Email fields - expanded
    email_subject = Column(String)
    email_from = Column(String, nullable=True)
    email_to = Column(String, nullable=True)
    email_cc = Column(Text, nullable=True)  # CC recipients
    email_body = Column(Text)  # Full email body
    email_body_html = Column(Text, nullable=True)  # HTML version
    email_signature = Column(Text, nullable=True)  # Extracted signature
    email_date = Column(DateTime)
    
    # Resume fields
    resume_path = Column(String, nullable=True)
    resume_filename = Column(String, nullable=True)
    resume_text = Column(Text, nullable=True)  # Raw extracted text from resume
    
    # CV Data - Comprehensive JSON structure (editable by user)
    cv_data = Column(JSON, nullable=True)  # Stores all 8 sections
    
    # Notes and Tags
    notes = Column(Text, nullable=True)  # Recruiter notes
    tags = Column(Text, nullable=True)  # JSON array of tags
    
    # Extracted info from email (phones, emails, links)
    extracted_phones = Column(Text, nullable=True)  # JSON array of phone numbers
    extracted_emails = Column(Text, nullable=True)  # JSON array of emails
    extracted_links = Column(Text, nullable=True)  # JSON array of URLs
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    recruiter = relationship("User", back_populates="candidates")
    
class EmailConfig(Base):
    __tablename__ = "email_config"
    
    id = Column(Integer, primary_key=True, index=True)
    email_address = Column(String, unique=True)
    is_active = Column(Integer, default=1)
    last_scan = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create engine with appropriate connect_args based on database type
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL doesn't need check_same_thread
    engine = create_engine(settings.DATABASE_URL)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
