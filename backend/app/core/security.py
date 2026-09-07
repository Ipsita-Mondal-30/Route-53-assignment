"""Password hashing and session token helpers.

Auth routes are not implemented yet — these utilities are ready for later phases.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Return a bcrypt hash for the given plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def generate_session_token() -> str:
    """Generate a cryptographically secure opaque session token."""
    return secrets.token_urlsafe(32)


def session_expiry(now: datetime | None = None) -> datetime:
    """Return the UTC expiry timestamp for a new session."""
    base = now or datetime.now(UTC)
    return base + timedelta(minutes=settings.session_expire_minutes)


def sign_value(value: str) -> str:
    """HMAC-sign a value with SESSION_SECRET (for cookie/session integrity)."""
    digest = hmac.new(
        settings.session_secret.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{value}.{digest}"


def verify_signed_value(signed: str) -> str | None:
    """Return the original value if the HMAC signature is valid, else None."""
    if "." not in signed:
        return None
    value, _, signature = signed.rpartition(".")
    expected = hmac.new(
        settings.session_secret.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return None
    return value
