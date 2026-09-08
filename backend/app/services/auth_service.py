"""Authentication business logic (session-based, not JWT)."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.core.security import (
    generate_session_token,
    hash_password,
    session_expiry,
    verify_password,
)
from app.models.session import Session as AuthSession
from app.models.user import User


class AuthError(Exception):
    """Raised when credentials are invalid."""


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower().strip()))


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise AuthError("Invalid email or password")
    return user


def register_user(db: Session, email: str, password: str) -> User:
    """Create a new user. Emails are stored lowercased and must be unique."""
    normalized = email.lower().strip()
    if get_user_by_email(db, normalized) is not None:
        raise ConflictError("An account with this email already exists.")

    user = User(email=normalized, password_hash=hash_password(password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("An account with this email already exists.") from exc
    db.refresh(user)
    return user


def create_session(db: Session, user: User) -> AuthSession:
    token = generate_session_token()
    auth_session = AuthSession(
        id=token,
        user_id=user.id,
        expires_at=session_expiry(),
    )
    db.add(auth_session)
    db.commit()
    db.refresh(auth_session)
    return auth_session


def delete_session(db: Session, session_id: str) -> None:
    auth_session = db.get(AuthSession, session_id)
    if auth_session is not None:
        db.delete(auth_session)
        db.commit()


def get_user_for_session(db: Session, session_id: str) -> User | None:
    """Resolve a user from a session cookie value.

    Expired sessions are deleted lazily on lookup (no scheduled job yet).
    TODO: optionally add a periodic cleanup job for orphaned expired rows.
    """
    auth_session = db.get(AuthSession, session_id)
    if auth_session is None:
        return None

    expires_at = auth_session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)

    if expires_at <= datetime.now(UTC):
        db.delete(auth_session)
        db.commit()
        return None

    user = db.get(User, auth_session.user_id)
    return user
