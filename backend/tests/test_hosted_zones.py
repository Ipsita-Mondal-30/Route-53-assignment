from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone


def _unique_domain(prefix: str = "zone") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}.example.com"


def test_create_hosted_zone_happy(auth_client: TestClient) -> None:
    name = _unique_domain("create")
    response = auth_client.post(
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


def test_create_hosted_zone_unauthorized_401(client: TestClient) -> None:
    response = client.post(
        "/hosted-zones",
        json={"name": _unique_domain("unauth"), "type": "Public"},
    )
    assert response.status_code == 401


def test_create_hosted_zone_bad_payload_422(auth_client: TestClient) -> None:
    response = auth_client.post(
        "/hosted-zones",
        json={"name": "not a domain", "type": "Public"},
    )
    assert response.status_code == 422


def test_create_hosted_zone_duplicate_409(auth_client: TestClient) -> None:
    name = _unique_domain("dup")
    assert auth_client.post("/hosted-zones", json={"name": name}).status_code == 201
    second = auth_client.post("/hosted-zones", json={"name": name.upper()})
    assert second.status_code == 409
    assert "already exists" in second.json()["detail"]


def test_list_hosted_zones_happy(auth_client: TestClient) -> None:
    needle = f"search-{uuid.uuid4().hex[:8]}"
    name = f"{needle}.example.com"
    other = _unique_domain("other")
    assert (
        auth_client.post(
            "/hosted-zones",
            json={"name": name, "comment": "find me"},
        ).status_code
        == 201
    )
    assert (
        auth_client.post(
            "/hosted-zones",
            json={"name": other, "comment": "noise"},
        ).status_code
        == 201
    )

    listed = auth_client.get(
        "/hosted-zones",
        params={"search": needle, "page": 1, "page_size": 20},
    )
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["total"] == 1
    assert payload["page"] == 1
    assert payload["page_size"] == 20
    assert all(needle in item["name"] for item in payload["items"])


def test_list_hosted_zones_unauthorized_401(client: TestClient) -> None:
    assert client.get("/hosted-zones").status_code == 401


def test_get_hosted_zone_happy(auth_client: TestClient) -> None:
    name = _unique_domain("get")
    created = auth_client.post("/hosted-zones", json={"name": name})
    zone_id = created.json()["id"]
    response = auth_client.get(f"/hosted-zones/{zone_id}")
    assert response.status_code == 200
    assert response.json()["id"] == zone_id
    assert response.json()["name"] == name


def test_get_hosted_zone_unauthorized_401(client: TestClient) -> None:
    assert client.get("/hosted-zones/ZDOESNOTEXIST01").status_code == 401


def test_get_hosted_zone_not_found_404(auth_client: TestClient) -> None:
    response = auth_client.get("/hosted-zones/ZDOESNOTEXIST01")
    assert response.status_code == 404
    assert response.json() == {"detail": "Hosted zone ZDOESNOTEXIST01 not found"}


def test_update_hosted_zone_happy(auth_client: TestClient) -> None:
    name = _unique_domain("update")
    created = auth_client.post(
        "/hosted-zones",
        json={"name": name, "comment": "before"},
    )
    zone_id = created.json()["id"]
    updated = auth_client.put(f"/hosted-zones/{zone_id}", json={"comment": "after"})
    assert updated.status_code == 200
    assert updated.json()["comment"] == "after"
    assert updated.json()["name"] == name


def test_update_hosted_zone_unauthorized_401(client: TestClient) -> None:
    assert (
        client.put("/hosted-zones/ZDOESNOTEXIST01", json={"comment": "x"}).status_code
        == 401
    )


def test_update_hosted_zone_not_found_404(auth_client: TestClient) -> None:
    response = auth_client.put(
        "/hosted-zones/ZDOESNOTEXIST01",
        json={"comment": "nope"},
    )
    assert response.status_code == 404


def test_update_hosted_zone_bad_payload_422(auth_client: TestClient) -> None:
    name = _unique_domain("upd422")
    zone_id = auth_client.post("/hosted-zones", json={"name": name}).json()["id"]
    response = auth_client.put(
        f"/hosted-zones/{zone_id}",
        json={"comment": "x" * 300},
    )
    assert response.status_code == 422


def test_delete_hosted_zone_happy(auth_client: TestClient) -> None:
    name = _unique_domain("del")
    zone_id = auth_client.post("/hosted-zones", json={"name": name}).json()["id"]
    deleted = auth_client.delete(f"/hosted-zones/{zone_id}")
    assert deleted.status_code == 204
    assert auth_client.get(f"/hosted-zones/{zone_id}").status_code == 404


def test_delete_hosted_zone_unauthorized_401(client: TestClient) -> None:
    assert client.delete("/hosted-zones/ZDOESNOTEXIST01").status_code == 401


def test_delete_hosted_zone_not_found_404(auth_client: TestClient) -> None:
    assert auth_client.delete("/hosted-zones/ZDOESNOTEXIST01").status_code == 404


def test_delete_hosted_zone_cascades_to_dns_records(
    auth_client: TestClient,
    db: Session,
) -> None:
    name = _unique_domain("cascade")
    zone_id = auth_client.post(
        "/hosted-zones",
        json={"name": name, "comment": "will delete"},
    ).json()["id"]

    created = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={"type": "A", "name": name, "ttl": 300, "value": "1.2.3.4"},
    )
    assert created.status_code == 201
    record_id = created.json()["id"]

    deleted = auth_client.delete(f"/hosted-zones/{zone_id}")
    assert deleted.status_code == 204

    assert auth_client.get(f"/hosted-zones/{zone_id}").status_code == 404
    assert db.get(HostedZone, zone_id) is None
    assert db.get(DnsRecord, record_id) is None
    leftover = db.scalars(
        select(DnsRecord).where(DnsRecord.hosted_zone_id == zone_id)
    ).all()
    assert leftover == []
