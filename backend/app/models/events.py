"""Keep HostedZone.record_count in sync when DnsRecord rows change.

We use SQLAlchemy mapper event listeners (after_insert / after_delete) rather than
a service-layer hook so the counter stays correct for *any* persistence path
(ORM session, future repositories, Alembic data scripts that use the ORM, etc.)
without requiring every caller to remember to bump the count. Events run once
per row mutation and issue a cheap ``record_count ± 1`` UPDATE — we never run
``COUNT(*)`` on read.

Bulk SQL that bypasses the ORM (``session.execute(delete(DnsRecord)...)``)
will not fire these listeners; those call sites must adjust the counter
explicitly if used later.
"""

from __future__ import annotations

from sqlalchemy import event, update
from sqlalchemy.orm import Mapper

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone


@event.listens_for(DnsRecord, "after_insert")
def _increment_hosted_zone_record_count(
    mapper: Mapper,
    connection: object,
    target: DnsRecord,
) -> None:
    connection.execute(  # type: ignore[attr-defined]
        update(HostedZone)
        .where(HostedZone.id == target.hosted_zone_id)
        .values(record_count=HostedZone.record_count + 1)
    )


@event.listens_for(DnsRecord, "after_delete")
def _decrement_hosted_zone_record_count(
    mapper: Mapper,
    connection: object,
    target: DnsRecord,
) -> None:
    connection.execute(  # type: ignore[attr-defined]
        update(HostedZone)
        .where(HostedZone.id == target.hosted_zone_id)
        .values(record_count=HostedZone.record_count - 1)
    )
