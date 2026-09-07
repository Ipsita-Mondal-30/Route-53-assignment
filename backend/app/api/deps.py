"""Shared FastAPI dependencies."""

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import SESSION_COOKIE_NAME, Settings, get_settings
from app.db.session import get_db
from app.models.user import User
from app.services import auth_service

__all__ = [
    "Settings",
    "get_settings",
    "get_db",
    "get_settings_dep",
    "get_current_user",
]


def get_settings_dep() -> Settings:
    """Inject cached application settings."""
    return get_settings()


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Require a valid, non-expired session cookie and return the User.

    Use this dependency on every protected route going forward.
    """
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user = auth_service.get_user_for_session(db, session_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
    return user
