"""ORM models package.

Import all model modules so Alembic and metadata discovery see every table.
"""

from app.db.base import Base

# Register DnsRecord <-> HostedZone.record_count sync listeners.
from app.models import events as _events  # noqa: F401
from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone, generate_hosted_zone_id
from app.models.notification import Notification
from app.models.session import Session
from app.models.user import User

__all__ = [
    "Base",
    "DnsRecord",
    "HostedZone",
    "Notification",
    "Session",
    "User",
    "generate_hosted_zone_id",
]
