"""
Session Management for Multi-User Authentication
"""
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict
from database import User

# Secret key for JWT (should be in environment variable)
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_HOURS = 24

class SessionManager:
    """Manages JWT-based sessions for authenticated users"""
    
    @staticmethod
    def create_session(user: User) -> str:
        """
        Create JWT session token for user
        
        Args:
            user: User object from database
            
        Returns:
            JWT token string
        """
        payload = {
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return token
    
    @staticmethod
    def verify_session(token: str) -> Optional[Dict]:
        """
        Verify JWT session token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload if valid, None if invalid/expired
        """
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None  # Token expired
        except jwt.InvalidTokenError:
            return None  # Invalid token
    
    @staticmethod
    def refresh_session(token: str) -> Optional[str]:
        """
        Refresh an about-to-expire session token
        
        Args:
            token: Current JWT token
            
        Returns:
            New JWT token if valid, None if invalid
        """
        payload = SessionManager.verify_session(token)
        if not payload:
            return None
        
        # Create new token with extended expiry
        new_payload = {
            'user_id': payload['user_id'],
            'email': payload['email'],
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
            'iat': datetime.utcnow()
        }
        
        new_token = jwt.encode(new_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return new_token
