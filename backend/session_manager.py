"""
Session Management for Multi-User Authentication
"""
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict
from database import User

# Secret key for JWT (must be set in .env)
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("❌ JWT_SECRET missing in environment. Add it to your .env file.")

JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


class SessionManager:
    """Manages JWT-based sessions for authenticated users"""

    @staticmethod
    def create_session(user: User) -> str:
        """Create JWT session token for authenticated user"""
        payload = {
            "user_id": str(user.id),
            "email": user.email,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
            "iat": datetime.utcnow(),
        }

        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    @staticmethod
    def verify_session(token: str) -> Optional[Dict]:
        """Verify JWT session token"""
        try:
            return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        except Exception:
            return None

    @staticmethod
    def refresh_session(token: str) -> Optional[str]:
        """Refresh a valid JWT session token"""
        payload = SessionManager.verify_session(token)
        if not payload:
            return None

        new_payload = {
            "user_id": payload["user_id"],
            "email": payload["email"],
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
            "iat": datetime.utcnow(),
        }

        return jwt.encode(new_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
