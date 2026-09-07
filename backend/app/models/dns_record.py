from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.hosted_zone import HostedZone

_DNS_TYPES = ("A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA")
_CAA_TAGS = ("issue", "issuewild", "iodef")


class DnsRecord(Base):
    __tablename__ = "dns_records"
    __table_args__ = (
        CheckConstraint(
            f"type IN ({', '.join(repr(t) for t in _DNS_TYPES)})",
            name="ck_dns_records_type",
        ),
        CheckConstraint(
            "caa_tag IS NULL OR caa_tag IN ('issue', 'issuewild', 'iodef')",
            name="ck_dns_records_caa_tag",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    hosted_zone_id: Mapped[str] = mapped_column(
        String(14),
        ForeignKey("hosted_zones.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(253), index=True, nullable=False)
    type: Mapped[str] = mapped_column(String(8), nullable=False)
    ttl: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=300,
        server_default="300",
    )
    value: Mapped[str] = mapped_column(String(4096), nullable=False)

    # Optional fields for specific record types
    priority: Mapped[int | None] = mapped_column(Integer, nullable=True)  # MX, SRV
    weight: Mapped[int | None] = mapped_column(Integer, nullable=True)  # SRV
    port: Mapped[int | None] = mapped_column(Integer, nullable=True)  # SRV
    caa_flag: Mapped[int | None] = mapped_column(Integer, nullable=True)  # CAA
    caa_tag: Mapped[str | None] = mapped_column(String(16), nullable=True)  # CAA

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    hosted_zone: Mapped[HostedZone] = relationship(back_populates="records")
