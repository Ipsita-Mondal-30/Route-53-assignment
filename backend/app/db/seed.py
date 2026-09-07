"""Seed the demo user used for mocked assignment auth (no signup flow)."""

from __future__ import annotations

import logging

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)


def seed_demo_user() -> User:
    """Create or update the demo user from DEMO_USER_EMAIL / DEMO_USER_PASSWORD."""
    email = settings.demo_user_email.lower().strip()
    password = settings.demo_user_password

    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.email == email))
        password_hash = hash_password(password)
        if user is None:
            user = User(email=email, password_hash=password_hash)
            db.add(user)
            logger.info("Created demo user %s", email)
        else:
            user.password_hash = password_hash
            logger.info("Updated demo user password for %s", email)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    user = seed_demo_user()
    print(f"Demo user ready: {user.email} (id={user.id})")


if __name__ == "__main__":
    main()
