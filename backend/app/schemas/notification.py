from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer

NotificationSource = Literal["user_configured", "aws_managed"]
NotificationTab = Literal["recent", "user_configured", "aws_managed"]


def _utc_iso(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source: NotificationSource
    category: str
    title: str
    body: str
    href: str | None = None
    read_at: datetime | None = None
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return _utc_iso(value)

    @field_serializer("read_at")
    def serialize_read_at(self, value: datetime | None) -> str | None:
        return None if value is None else _utc_iso(value)

NotificationSource = Literal["user_configured", "aws_managed"]
NotificationTab = Literal["recent", "user_configured", "aws_managed"]


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source: NotificationSource
    category: str
    title: str
    body: str
    href: str | None = None
    read_at: datetime | None = None
    created_at: datetime


class NotificationListOut(BaseModel):
    items: list[NotificationOut]
    unread_count: int = Field(ge=0)


class NotificationCreate(BaseModel):
    source: NotificationSource
    category: str = Field(min_length=1, max_length=128)
    title: str = Field(min_length=1, max_length=512)
    body: str = Field(min_length=1, max_length=4000)
    href: str | None = Field(default=None, max_length=1024)
