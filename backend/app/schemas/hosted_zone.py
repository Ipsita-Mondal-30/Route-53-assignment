from __future__ import annotations

import re
from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Domain-ish: labels of letters/digits/hyphens, at least one dot (e.g. example.com).
_DOMAIN_RE = re.compile(
    r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
    r"(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$"
)


class ZoneType(str, Enum):
    Public = "Public"
    Private = "Private"


def normalize_domain_name(value: str) -> str:
    return value.strip().lower().rstrip(".")


class HostedZoneCreate(BaseModel):
    name: str = Field(min_length=1, max_length=253)
    comment: str | None = Field(default=None, max_length=256)
    type: ZoneType = ZoneType.Public

    @field_validator("name")
    @classmethod
    def validate_domain_name(cls, value: str) -> str:
        domain = normalize_domain_name(value)
        if not domain or len(domain) > 253 or not _DOMAIN_RE.match(domain):
            raise ValueError(
                "Enter a valid domain name, such as example.com."
            )
        return domain

    @field_validator("comment")
    @classmethod
    def empty_comment_to_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class HostedZoneUpdate(BaseModel):
    comment: str | None = Field(default=None, max_length=256)

    @field_validator("comment")
    @classmethod
    def empty_comment_to_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class HostedZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: ZoneType
    comment: str | None
    record_count: int
    created_by: int
    created_at: datetime
    updated_at: datetime


class HostedZoneListOut(BaseModel):
    items: list[HostedZoneOut]
    total: int
    page: int
    page_size: int


SortBy = Literal["name", "type", "record_count", "created_at", "updated_at"]
SortOrder = Literal["asc", "desc"]
