from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationTab

_schema_ready = False


def ensure_schema(db: Session) -> None:
    global _schema_ready
    if _schema_ready:
        return
    Notification.__table__.create(bind=db.get_bind(), checkfirst=True)
    _schema_ready = True


def enqueue_activity(
    db: Session,
    user: User,
    *,
    title: str,
    body: str,
    href: str | None = None,
) -> None:
    """Queue a user-configured console notification; caller commits."""
    ensure_schema(db)
    db.add(
        Notification(
            user_id=user.id,
            source="user_configured",
            category="Amazon Route 53",
            title=title,
            body=body,
            href=href,
            created_at=datetime.now(UTC),
        )
    )


def purge_seeded_demo_notifications(db: Session) -> int:
    """Remove previously seeded AWS Health Event rows (no longer used)."""
    ensure_schema(db)
    result = db.execute(
        delete(Notification).where(Notification.category == "AWS Health Event")
    )
    db.commit()
    return int(result.rowcount or 0)


def list_for_user(
    db: Session,
    user: User,
    tab: NotificationTab = "recent",
) -> tuple[list[Notification], int]:
    ensure_schema(db)

    filters = [Notification.user_id == user.id]
    if tab == "user_configured":
        filters.append(Notification.source == "user_configured")
    elif tab == "aws_managed":
        filters.append(Notification.source == "aws_managed")

    items = list(
        db.scalars(
            select(Notification)
            .where(*filters)
            .order_by(Notification.created_at.desc())
        ).all()
    )
    unread = db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.user_id == user.id,
            Notification.read_at.is_(None),
        )
    )
    return items, int(unread or 0)


def create_for_user(
    db: Session, user: User, payload: NotificationCreate
) -> Notification:
    ensure_schema(db)
    item = Notification(
        user_id=user.id,
        source=payload.source,
        category=payload.category,
        title=payload.title,
        body=payload.body,
        href=payload.href,
        created_at=datetime.now(UTC),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def mark_read(db: Session, user: User, notification_id: str) -> Notification | None:
    item = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        )
    )
    if item is None:
        return None
    if item.read_at is None:
        item.read_at = datetime.now(UTC)
        db.commit()
        db.refresh(item)
    return item


def mark_all_read(db: Session, user: User) -> int:
    items = list(
        db.scalars(
            select(Notification).where(
                Notification.user_id == user.id,
                Notification.read_at.is_(None),
            )
        ).all()
    )
    now = datetime.now(UTC)
    for item in items:
        item.read_at = now
    db.commit()
    return len(items)
