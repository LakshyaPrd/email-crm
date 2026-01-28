from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # MongoDB
    MONGODB_URL: str
    MONGODB_DB_NAME: str = "indeed_crm"

    # Files
    UPLOAD_DIR: str = "uploads"

    # Gmail OAuth (legacy local token login)
    GMAIL_TOKEN_FILE: str = "token.json"
    GMAIL_CREDENTIALS_FILE: str = "credentials.json"
    # Must be compatible with `google-auth` scopes list usage
    GMAIL_SCOPES: list[str] = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
    ]


settings = Settings()

