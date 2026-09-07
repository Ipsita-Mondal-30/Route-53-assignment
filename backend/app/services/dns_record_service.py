"""DNS record business logic."""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.schemas.dns_record import (
    DnsRecordType,
    DnsRecordWrite,
    record_write_to_columns,
)
from app.services import notification_service
from app.services.hosted_zone_service import HostedZoneNotFound


class DnsRecordNotFound(Exception):
    """Raised when a DNS record id does not exist."""


@dataclass(frozen=True)
class PaginatedDnsRecords:
    items: list[DnsRecord]
    total: int
    page: int
    page_size: int


def get_by_id(db: Session, record_id: str) -> DnsRecord | None:
    return db.get(DnsRecord, record_id)


def create(
    db: Session,
    zone_id: str,
    data: DnsRecordWrite,
    user: User,
) -> DnsRecord:
    zone = db.get(HostedZone, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")

    columns = record_write_to_columns(data)
    record = DnsRecord(hosted_zone_id=zone_id, **columns)
    db.add(record)
    db.flush()
    notification_service.enqueue_activity(
        db,
        user,
        title="DNS record created",
        body=(
            f"[Notification] {record.type} record {record.name} was created "
            f"in hosted zone {zone.name}."
        ),
        href=f"/hosted-zones/{zone.id}",
    )
    db.commit()
    db.refresh(record)
    return record


def list_paginated(
    db: Session,
    zone_id: str,
    *,
    search: str | None = None,
    record_type: DnsRecordType | None = None,
    page: int = 1,
    page_size: int = 20,
) -> PaginatedDnsRecords:
    """Filter / paginate in SQL for a single hosted zone."""
    zone = db.get(HostedZone, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")

    query = select(DnsRecord).where(DnsRecord.hosted_zone_id == zone_id)

    if record_type is not None:
        query = query.where(DnsRecord.type == record_type)

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(DnsRecord.name).like(term),
                func.lower(DnsRecord.value).like(term),
            )
        )

    count_stmt = select(func.count()).select_from(query.subquery())
    total = int(db.scalar(count_stmt) or 0)

    query = query.order_by(
        DnsRecord.name.asc(),
        DnsRecord.type.asc(),
        DnsRecord.id.asc(),
    )
    offset = (page - 1) * page_size
    items = list(db.scalars(query.offset(offset).limit(page_size)).all())

    return PaginatedDnsRecords(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


def list_all(db: Session, zone_id: str) -> list[DnsRecord]:
    """Return every record in a zone, ordered stably for export."""
    zone = db.get(HostedZone, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")

    return list(
        db.scalars(
            select(DnsRecord)
            .where(DnsRecord.hosted_zone_id == zone_id)
            .order_by(
                DnsRecord.name.asc(),
                DnsRecord.type.asc(),
                DnsRecord.id.asc(),
            )
        ).all()
    )


def update(
    db: Session,
    record_id: str,
    data: DnsRecordWrite,
    user: User,
) -> DnsRecord:
    record = get_by_id(db, record_id)
    if record is None:
        raise DnsRecordNotFound(f"DNS record {record_id} not found")

    for key, value in record_write_to_columns(data).items():
        setattr(record, key, value)

    db.add(record)
    zone = db.get(HostedZone, record.hosted_zone_id)
    zone_name = zone.name if zone is not None else record.hosted_zone_id
    notification_service.enqueue_activity(
        db,
        user,
        title="DNS record updated",
        body=(
            f"[Notification] {record.type} record {record.name} was updated "
            f"in hosted zone {zone_name}."
        ),
        href=f"/hosted-zones/{record.hosted_zone_id}",
    )
    db.commit()
    db.refresh(record)
    return record


def delete(db: Session, record_id: str) -> None:
    """Delete a DNS record; HostedZone.record_count is synced by mapper events."""
    record = get_by_id(db, record_id)
    if record is None:
        raise DnsRecordNotFound(f"DNS record {record_id} not found")

    db.delete(record)
    db.commit()
