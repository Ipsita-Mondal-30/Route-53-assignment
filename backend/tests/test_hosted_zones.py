from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.config import settings
from app.db.seed import seed_demo_user
from app.db.session import SessionLocal
from app.main import app
from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone

client = TestClient(app)


def _login() -> None:
    seed_demo_user()
    response = client.post(
        "/auth/login",
        json={
            "email": settings.demo_user_email,
            "password": settings.demo_user_password,
        },
    )
    assert response.status_code == 200


def _unique_domain(prefix: str = "zone") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}.example.com"


def test_create_hosted_zone() -> None:
    _login()
    name = _unique_domain("create")

    response = client.post(
        "/hosted-zones",
        json={"name": name, "comment": "demo zone", "type": "Public"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == name
    assert body["type"] == "Public"
    assert body["comment"] == "demo zone"
    assert body["record_count"] == 0
    assert body["id"].startswith("Z")
    assert "created_by" in body
    assert "created_at" in body


def test_list_hosted_zones_with_search() -> None:
    _login()
    needle = f"search-{uuid.uuid4().hex[:8]}"
    name = f"{needle}.example.com"
    other = _unique_domain("other")

    assert (
        client.post(
            "/hosted-zones",
            json={"name": name, "comment": "find me"},
        ).status_code
        == 201
    )
    assert (
        client.post(
            "/hosted-zones",
            json={"name": other, "comment": "noise"},
        ).status_code
        == 201
    )

    listed = client.get(
        "/hosted-zones",
        params={"search": needle, "page": 1, "page_size": 20},
    )
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["total"] >= 1
    assert payload["page"] == 1
    assert payload["page_size"] == 20
    assert all(needle in item["name"] for item in payload["items"])


def test_get_hosted_zone_not_found() -> None:
    _login()
    response = client.get("/hosted-zones/ZDOESNOTEXIST01")
    assert response.status_code == 404
    assert response.json() == {"detail": "Hosted zone ZDOESNOTEXIST01 not found"}


def test_update_hosted_zone() -> None:
    _login()
    name = _unique_domain("update")
    created = client.post(
        "/hosted-zones",
        json={"name": name, "comment": "before"},
    )
    assert created.status_code == 201
    zone_id = created.json()["id"]

    updated = client.put(
        f"/hosted-zones/{zone_id}",
        json={"comment": "after"},
    )
    assert updated.status_code == 200
    assert updated.json()["comment"] == "after"
    assert updated.json()["name"] == name


def test_delete_cascades_to_dns_records() -> None:
    _login()
    name = _unique_domain("cascade")
    created = client.post(
        "/hosted-zones",
        json={"name": name, "comment": "will delete"},
    )
    assert created.status_code == 201
    zone_id = created.json()["id"]

    # Stub a DNS record directly so we can assert FK cascade without Phase 4 APIs.
    with SessionLocal() as db:
        record = DnsRecord(
            hosted_zone_id=zone_id,
            name=name,
            type="A",
            ttl=300,
            value="1.2.3.4",
        )
        db.add(record)
        db.commit()
        record_id = record.id

        zone = db.get(HostedZone, zone_id)
        assert zone is not None
        db.refresh(zone)
        assert zone.record_count >= 1

    deleted = client.delete(f"/hosted-zones/{zone_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/hosted-zones/{zone_id}")
    assert missing.status_code == 404

    with SessionLocal() as db:
        assert db.get(HostedZone, zone_id) is None
        assert db.get(DnsRecord, record_id) is None
        leftover = db.scalars(
            select(DnsRecord).where(DnsRecord.hosted_zone_id == zone_id)
        ).all()
        assert leftover == []


def test_create_duplicate_name_returns_409() -> None:
    _login()
    name = _unique_domain("dup")
    first = client.post("/hosted-zones", json={"name": name})
    assert first.status_code == 201
    second = client.post("/hosted-zones", json={"name": name.upper()})
    assert second.status_code == 409
    assert "already exists" in second.json()["detail"]


def test_hosted_zones_require_auth() -> None:
    client.cookies.clear()
    response = client.get("/hosted-zones")
    assert response.status_code == 401
