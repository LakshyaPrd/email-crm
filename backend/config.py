from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./candidates.db"
    
    # Gmail API
    GMAIL_CREDENTIALS_FILE: str = "credentials.json"
    GMAIL_TOKEN_FILE: str = "token.json"
    GMAIL_SCOPES: list = ['https://www.googleapis.com/auth/gmail.readonly']
    
    # Storage
    UPLOAD_DIR: str = "./uploads/resumes"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Scanning
    SCAN_INTERVAL: int = 60  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env file

settings = Settings()
