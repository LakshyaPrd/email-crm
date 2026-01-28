from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Optional

from database import Candidate


def generate_unique_id(subject: str, email_date: datetime, candidate_email: str) -> str:
    """
    Generate a stable 10-character identifier for a candidate email.
    """
    base = f"{(subject or '').strip()}|{email_date.isoformat()}|{(candidate_email or '').strip().lower()}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()[:10]


async def check_duplicate_candidate(gmail_message_id: str) -> Optional[Candidate]:
    """
    Returns an existing Candidate if gmail_message_id already exists.
    """
    if not gmail_message_id:
        return None
    return await Candidate.find_one(Candidate.gmail_message_id == gmail_message_id)

