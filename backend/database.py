from __future__ import annotations

from datetime import datetime
from typing import Optional

from beanie import Document, Indexed, init_beanie
from beanie.odm.fields import PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import Field

from config import settings


class User(Document):
    email: Indexed(str, unique=True)
    name: Optional[str] = None
    is_active: bool = True
    last_login: Optional[datetime] = None

    # Multi-user Gmail OAuth tokens (web OAuth flow)
    gmail_access_token: Optional[str] = None
    gmail_refresh_token: Optional[str] = None
    gmail_token_expiry: Optional[datetime] = None
    gmail_scopes: Optional[list[str]] = None

    class Settings:
        name = "users"


class EmailConfig(Document):
    email_address: Indexed(str, unique=True)
    is_active: bool = True
    last_scan: Optional[datetime] = None

    class Settings:
        name = "email_configs"


class Candidate(Document):
    unique_id: Indexed(str, unique=True)
    gmail_message_id: Indexed(str, unique=True)

    batch_id: Optional[str] = None
    recruiter_id: Optional[PydanticObjectId] = None  # User.id as string ObjectId

    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    email_subject: Optional[str] = None
    email_from: Optional[str] = None
    email_to: Optional[str] = None
    email_cc: Optional[str] = None
    email_date: Optional[datetime] = None
    email_body: Optional[str] = None
    email_body_html: Optional[str] = None
    email_signature: Optional[str] = None

    resume_filename: Optional[str] = None
    resume_text: Optional[str] = None
    resume_path: Optional[str] = None

    # Store as raw dict, not JSON string
    cv_data: Optional[dict] = None

    # Store as lists, not JSON strings
    extracted_phones: list[str] = Field(default_factory=list)
    extracted_emails: list[str] = Field(default_factory=list)
    extracted_links: list[str] = Field(default_factory=list)

    notes: Optional[str] = None
    tags: list[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Settings:
        name = "candidates"


_motor_client: Optional[AsyncIOMotorClient] = None


async def init_db() -> None:
    """
    Initialize Motor client + Beanie.
    Must be called once on application startup.
    """
    global _motor_client
    if _motor_client is None:
        _motor_client = AsyncIOMotorClient(settings.MONGODB_URL)

    await init_beanie(
        database=_motor_client[settings.MONGODB_DB_NAME],
        document_models=[User, EmailConfig, Candidate],
    )


async def shutdown_db() -> None:
    global _motor_client
    if _motor_client is not None:
        _motor_client.close()
        _motor_client = None


def to_object_id_str(value: PydanticObjectId | str | None) -> Optional[str]:
    if value is None:
        return None
    return str(value)

