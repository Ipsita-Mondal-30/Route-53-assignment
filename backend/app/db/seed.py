"""Seed demo user + sample hosted zones / DNS records for a non-empty first login."""

from __future__ import annotations

import logging
import os

from sqlalchemy import func, select

from app.core.config import settings
from app.core.security import hash_password
from app.db import session as db_session
from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone
from app.models.user import User

logger = logging.getLogger(__name__)

# Sample zones are created once when the database has zero hosted zones.
_DEMO_ZONE_SPECS: list[dict] = [
    {
        "name": "demo.example.com",
        "type": "Public",
        "comment": "Primary public demo zone",
        "records": [
            {
                "type": "A",
                "name": "demo.example.com",
                "ttl": 300,
                "value": "203.0.113.10",
            },
            {
                "type": "AAAA",
                "name": "demo.example.com",
                "ttl": 300,
                "value": "2001:db8::10",
            },
            {
                "type": "CNAME",
                "name": "www.demo.example.com",
                "ttl": 300,
                "value": "demo.example.com",
            },
            {
                "type": "TXT",
                "name": "demo.example.com",
                "ttl": 300,
                "value": '"v=spf1 include:_spf.demo.example.com ~all"',
            },
            {
                "type": "MX",
                "name": "demo.example.com",
                "ttl": 300,
                "value": "mail.demo.example.com",
                "priority": 10,
            },
            {
                "type": "NS",
                "name": "demo.example.com",
                "ttl": 172800,
                "value": "ns-1.awsdns-00.com.",
            },
        ],
    },
    {
        "name": "api.demo.example.com",
        "type": "Public",
        "comment": "API subdomain zone",
        "records": [
            {
                "type": "A",
                "name": "api.demo.example.com",
                "ttl": 60,
                "value": "203.0.113.50",
            },
            {
                "type": "SRV",
                "name": "_sip._tcp.api.demo.example.com",
                "ttl": 300,
                "value": "sip.api.demo.example.com",
                "priority": 10,
                "weight": 5,
                "port": 5060,
            },
            {
                "type": "CAA",
                "name": "api.demo.example.com",
                "ttl": 300,
                "value": "letsencrypt.org",
                "caa_flag": 0,
                "caa_tag": "issue",
            },
        ],
    },
    {
        "name": "corp.internal",
        "type": "Private",
        "comment": "Private VPC-style demo zone",
        "records": [
            {
                "type": "A",
                "name": "db.corp.internal",
                "ttl": 300,
                "value": "10.0.1.20",
            },
            {
                "type": "PTR",
                "name": "20.1.0.10.in-addr.arpa",
                "ttl": 300,
                "value": "db.corp.internal.",
            },
            {
                "type": "TXT",
                "name": "_sshfp.corp.internal",
                "ttl": 300,
                "value": '"SSHFP demo record"',
            },
        ],
    },
]


def seed_demo_user() -> User:
    """Create or update the demo user from DEMO_USER_EMAIL / DEMO_USER_PASSWORD."""
    email = settings.demo_user_email.lower().strip()
    password = settings.demo_user_password

    # Look up SessionLocal at call time so tests can swap the engine.
    db = db_session.SessionLocal()
    try:
        user = db.scalar(select(User).where(User.email == email))
        password_hash = hash_password(password)
        if user is None:
            user = User(email=email, password_hash=password_hash)
            db.add(user)
            logger.info("Created demo user %s", email)
        else:
            user.password_hash = password_hash
            logger.info("Updated demo user password for %s", email)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def seed_demo_dns(user: User) -> None:
    """Create sample hosted zones and records covering all 9 DNS types.

    Idempotent: skips when any hosted zone already exists.
    Set ``SEED_SAMPLE_DNS=0`` to skip (used by the pytest suite for speed).
    """
    if os.environ.get("SEED_SAMPLE_DNS", "1").strip() in {"0", "false", "False"}:
        logger.info("Skipping sample DNS seed (SEED_SAMPLE_DNS disabled)")
        return

    db = db_session.SessionLocal()
    try:
        existing = db.scalar(select(func.count()).select_from(HostedZone)) or 0
        if existing > 0:
            logger.info("Hosted zones already present (%s); skipping DNS seed", existing)
            return

        for zone_spec in _DEMO_ZONE_SPECS:
            zone = HostedZone(
                name=zone_spec["name"],
                type=zone_spec["type"],
                comment=zone_spec.get("comment"),
                created_by=user.id,
            )
            db.add(zone)
            db.flush()

            for record_spec in zone_spec["records"]:
                db.add(
                    DnsRecord(
                        hosted_zone_id=zone.id,
                        name=str(record_spec["name"]),
                        type=str(record_spec["type"]),
                        ttl=int(record_spec.get("ttl", 300)),
                        value=str(record_spec["value"]),
                        priority=record_spec.get("priority"),
                        weight=record_spec.get("weight"),
                        port=record_spec.get("port"),
                        caa_flag=record_spec.get("caa_flag"),
                        caa_tag=record_spec.get("caa_tag"),
                    )
                )

        db.commit()
        logger.info(
            "Seeded %s demo hosted zones with sample DNS records",
            len(_DEMO_ZONE_SPECS),
        )
    finally:
        db.close()


def seed_all() -> User:
    """Seed demo user and sample DNS data (when enabled)."""
    user = seed_demo_user()
    seed_demo_dns(user)
    return user


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    user = seed_all()
    print(f"Demo data ready for {user.email} (id={user.id})")


if __name__ == "__main__":
    main()
