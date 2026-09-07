from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate,
    NotificationListOut,
    NotificationOut,
    NotificationTab,
)
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListOut)
def list_notifications(
    tab: NotificationTab = Query(default="recent"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationListOut:
    items, unread = notification_service.list_for_user(db, current_user, tab)
    return NotificationListOut(items=items, unread_count=unread)


@router.post(
    "",
    response_model=NotificationOut,
    status_code=status.HTTP_201_CREATED,
)
def create_notification(
    body: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationOut:
    return notification_service.create_for_user(db, current_user, body)


@router.post(
    "/read-all",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    notification_service.mark_all_read(db, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{notification_id}/read", response_model=NotificationOut)
def read_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationOut:
    item = notification_service.mark_read(db, current_user, notification_id)
    if item is None:
        raise NotFoundError(f"Notification {notification_id} not found")
    return item
