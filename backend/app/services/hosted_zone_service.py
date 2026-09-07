"""Hosted zone business logic."""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneUpdate,
    SortBy,
    SortOrder,
)

_SORTABLE = {
    "name": HostedZone.name,
    "type": HostedZone.type,
    "record_count": HostedZone.record_count,
    "created_at": HostedZone.created_at,
    "updated_at": HostedZone.updated_at,
}


class HostedZoneNotFound(Exception):
    """Raised when a hosted zone id does not exist."""


class HostedZoneConflict(Exception):
    """Raised when a zone name is already taken."""


@dataclass(frozen=True)
class PaginatedHostedZones:
    items: list[HostedZone]
    total: int
    page: int
    page_size: int


def get_by_id(db: Session, zone_id: str) -> HostedZone | None:
    return db.get(HostedZone, zone_id)


def create(db: Session, user: User, data: HostedZoneCreate) -> HostedZone:
    existing = db.scalar(select(HostedZone).where(HostedZone.name == data.name))
    if existing is not None:
        raise HostedZoneConflict(
            f"A hosted zone already exists for {data.name}."
        )

    zone = HostedZone(
        name=data.name,
        type=data.type.value,
        comment=data.comment,
        created_by=user.id,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


def list_paginated(
    db: Session,
    *,
    search: str | None = None,
    sort_by: SortBy = "name",
    sort_order: SortOrder = "asc",
    page: int = 1,
    page_size: int = 20,
) -> PaginatedHostedZones:
    """Filter / sort / paginate in SQL — never load the full table into Python."""
    query = select(HostedZone)

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(HostedZone.name).like(term),
                func.lower(func.coalesce(HostedZone.comment, "")).like(term),
            )
        )

    count_stmt = select(func.count()).select_from(query.subquery())
    total = int(db.scalar(count_stmt) or 0)

    column = _SORTABLE.get(sort_by, HostedZone.name)
    order_expr = column.asc() if sort_order == "asc" else column.desc()
    # Stable secondary sort so pagination is deterministic.
    query = query.order_by(order_expr, HostedZone.id.asc())

    offset = (page - 1) * page_size
    items = list(db.scalars(query.offset(offset).limit(page_size)).all())

    return PaginatedHostedZones(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


def update(
    db: Session,
    zone_id: str,
    data: HostedZoneUpdate,
) -> HostedZone:
    zone = get_by_id(db, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")

    zone.comment = data.comment
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


def delete(db: Session, zone_id: str) -> None:
    """Delete a hosted zone; dns_records cascade via FK / ORM relationship."""
    zone = get_by_id(db, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")

    db.delete(zone)
    db.commit()
