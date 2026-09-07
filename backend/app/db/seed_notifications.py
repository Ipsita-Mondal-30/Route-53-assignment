"""Remove previously seeded demo notifications. Real events come from zone/record APIs."""

from __future__ import annotations

import logging

from app.db import session as db_session
from app.models.notification import Notification
from app.services.notification_service import purge_seeded_demo_notifications

logger = logging.getLogger(__name__)


def seed_demo_notifications() -> None:
    """Kept for import compatibility; does not insert sample notifications."""
    db = db_session.SessionLocal()
    try:
        Notification.__table__.create(bind=db.get_bind(), checkfirst=True)
        removed = purge_seeded_demo_notifications(db)
        logger.info("Cleared %s seeded demo notification(s)", removed)
    finally:
        db.close()
