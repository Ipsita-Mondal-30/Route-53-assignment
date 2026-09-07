from __future__ import annotations

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.hosted_zone import HostedZone

RECORD_PAYLOADS: list[dict[str, object]] = [
    {"type": "A", "name": "a.example.com", "ttl": 300, "value": "1.2.3.4"},
    {
        "type": "AAAA",
        "name": "aaaa.example.com",
        "ttl": 300,
        "value": "2001:db8::1",
    },
    {
        "type": "CNAME",
        "name": "www.example.com",
        "ttl": 300,
        "value": "example.com",
    },
    {
        "type": "TXT",
        "name": "txt.example.com",
        "ttl": 300,
        "value": '"v=spf1 include:_spf.example.com ~all"',
    },
    {
        "type": "NS",
        "name": "example.com",
        "ttl": 172800,
        "value": "ns-1.awsdns-00.com.",
    },
    {
        "type": "PTR",
        "name": "4.3.2.1.in-addr.arpa",
        "ttl": 300,
        "value": "host.example.com.",
    },
    {
        "type": "MX",
        "name": "example.com",
        "ttl": 300,
        "value": "mail.example.com",
        "priority": 10,
    },
    {
        "type": "SRV",
        "name": "_sip._tcp.example.com",
        "ttl": 300,
        "value": "sipserver.example.com",
        "priority": 10,
        "weight": 5,
        "port": 5060,
    },
    {
        "type": "CAA",
        "name": "example.com",
        "ttl": 300,
        "value": "letsencrypt.org",
        "caa_flag": 0,
        "caa_tag": "issue",
    },
]


def _create_zone(auth_client: TestClient) -> tuple[str, str]:
    name = f"dns-{uuid.uuid4().hex[:10]}.example.com"
    response = auth_client.post(
        "/hosted-zones",
        json={"name": name, "comment": "dns records test"},
    )
    assert response.status_code == 201
    body = response.json()
    return body["id"], body["name"]


@pytest.mark.parametrize(
    "payload",
    RECORD_PAYLOADS,
    ids=[str(p["type"]) for p in RECORD_PAYLOADS],
)
def test_create_each_record_type(
    auth_client: TestClient,
    db: Session,
    payload: dict[str, object],
) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(f"/hosted-zones/{zone_id}/records", json=payload)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["type"] == payload["type"]
    assert body["hosted_zone_id"] == zone_id
    assert body["name"] == payload["name"]
    assert body["value"] == payload["value"]

    db.expire_all()
    zone = db.get(HostedZone, zone_id)
    assert zone is not None
    assert zone.record_count >= 1


def test_create_record_unauthorized_401(client: TestClient) -> None:
    response = client.post(
        "/hosted-zones/ZDOESNOTEXIST01/records",
        json={"type": "A", "name": "a.example.com", "ttl": 300, "value": "1.1.1.1"},
    )
    assert response.status_code == 401


def test_create_record_zone_not_found_404(auth_client: TestClient) -> None:
    response = auth_client.post(
        "/hosted-zones/ZDOESNOTEXIST01/records",
        json={"type": "A", "name": "a.example.com", "ttl": 300, "value": "1.1.1.1"},
    )
    assert response.status_code == 404


def test_create_record_bad_payload_422(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={"type": "A", "name": "a.example.com"},
    )
    assert response.status_code == 422


def test_reject_mx_without_priority(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "type": "MX",
            "name": "example.com",
            "ttl": 300,
            "value": "mail.example.com",
        },
    )
    assert response.status_code == 422
    assert any("priority" in str(item).lower() for item in response.json()["detail"])


def test_reject_srv_without_port(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "type": "SRV",
            "name": "_sip._tcp.example.com",
            "ttl": 300,
            "value": "sipserver.example.com",
            "priority": 10,
            "weight": 5,
        },
    )
    assert response.status_code == 422
    assert any("port" in str(item).lower() for item in response.json()["detail"])


def test_reject_caa_with_invalid_tag(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "type": "CAA",
            "name": "example.com",
            "ttl": 300,
            "value": "letsencrypt.org",
            "caa_flag": 0,
            "caa_tag": "not-a-real-tag",
        },
    )
    assert response.status_code == 422
    assert any("caa_tag" in str(item).lower() for item in response.json()["detail"])


def test_reject_extra_field_on_a_record(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "type": "A",
            "name": "a.example.com",
            "ttl": 300,
            "value": "1.2.3.4",
            "priority": 10,
        },
    )
    assert response.status_code == 422


def test_list_records_happy(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    needle = f"findme-{uuid.uuid4().hex[:8]}"
    creates = [
        {
            "type": "A",
            "name": f"{needle}.example.com",
            "ttl": 60,
            "value": "9.9.9.9",
        },
        {
            "type": "A",
            "name": "other-a.example.com",
            "ttl": 60,
            "value": "8.8.8.8",
        },
        {
            "type": "TXT",
            "name": f"{needle}-txt.example.com",
            "ttl": 60,
            "value": '"hello"',
        },
        {
            "type": "MX",
            "name": "mail.example.com",
            "ttl": 60,
            "value": "mx.example.com",
            "priority": 10,
        },
    ]
    for payload in creates:
        assert (
            auth_client.post(
                f"/hosted-zones/{zone_id}/records",
                json=payload,
            ).status_code
            == 201
        )

    by_search = auth_client.get(
        f"/hosted-zones/{zone_id}/records",
        params={"search": needle, "page": 1, "page_size": 20},
    )
    assert by_search.status_code == 200
    assert by_search.json()["total"] == 2

    by_type = auth_client.get(
        f"/hosted-zones/{zone_id}/records",
        params={"type": "A", "page": 1, "page_size": 20},
    )
    assert by_type.status_code == 200
    assert by_type.json()["total"] == 2

    page1 = auth_client.get(
        f"/hosted-zones/{zone_id}/records",
        params={"page": 1, "page_size": 2},
    )
    page2 = auth_client.get(
        f"/hosted-zones/{zone_id}/records",
        params={"page": 2, "page_size": 2},
    )
    assert page1.json()["total"] == 4
    assert len(page1.json()["items"]) == 2
    assert len(page2.json()["items"]) == 2
    assert {i["id"] for i in page1.json()["items"]}.isdisjoint(
        {i["id"] for i in page2.json()["items"]}
    )


def test_list_records_unauthorized_401(client: TestClient) -> None:
    assert client.get("/hosted-zones/ZDOESNOTEXIST01/records").status_code == 401


def test_list_records_zone_not_found_404(auth_client: TestClient) -> None:
    assert auth_client.get("/hosted-zones/ZDOESNOTEXIST01/records").status_code == 404


def test_get_record_happy(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    created = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={"type": "A", "name": "host.example.com", "ttl": 300, "value": "1.1.1.1"},
    )
    record_id = created.json()["id"]
    response = auth_client.get(f"/records/{record_id}")
    assert response.status_code == 200
    assert response.json()["id"] == record_id


def test_get_record_unauthorized_401(client: TestClient) -> None:
    assert client.get("/records/does-not-exist").status_code == 401


def test_get_record_not_found_404(auth_client: TestClient) -> None:
    response = auth_client.get("/records/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_update_record_happy(auth_client: TestClient, db: Session) -> None:
    zone_id, _ = _create_zone(auth_client)
    created = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={"type": "A", "name": "host.example.com", "ttl": 300, "value": "1.1.1.1"},
    )
    record_id = created.json()["id"]
    updated = auth_client.put(
        f"/records/{record_id}",
        json={"type": "A", "name": "host.example.com", "ttl": 60, "value": "2.2.2.2"},
    )
    assert updated.status_code == 200
    assert updated.json()["ttl"] == 60
    assert updated.json()["value"] == "2.2.2.2"


def test_update_record_unauthorized_401(client: TestClient) -> None:
    assert (
        client.put(
            "/records/does-not-exist",
            json={
                "type": "A",
                "name": "host.example.com",
                "ttl": 60,
                "value": "2.2.2.2",
            },
        ).status_code
        == 401
    )


def test_update_record_not_found_404(auth_client: TestClient) -> None:
    response = auth_client.put(
        "/records/00000000-0000-0000-0000-000000000000",
        json={
            "type": "A",
            "name": "host.example.com",
            "ttl": 60,
            "value": "2.2.2.2",
        },
    )
    assert response.status_code == 404


def test_update_record_bad_payload_422(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    record_id = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={"type": "A", "name": "host.example.com", "ttl": 300, "value": "1.1.1.1"},
    ).json()["id"]
    response = auth_client.put(
        f"/records/{record_id}",
        json={"type": "A", "name": "host.example.com", "ttl": 60},
    )
    assert response.status_code == 422


def test_delete_record_happy(auth_client: TestClient, db: Session) -> None:
    zone_id, _ = _create_zone(auth_client)
    record_id = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={"type": "A", "name": "host.example.com", "ttl": 300, "value": "1.1.1.1"},
    ).json()["id"]

    db.expire_all()
    before = db.get(HostedZone, zone_id)
    assert before is not None
    count_before = before.record_count

    deleted = auth_client.delete(f"/records/{record_id}")
    assert deleted.status_code == 204
    assert auth_client.get(f"/records/{record_id}").status_code == 404

    db.expire_all()
    after = db.get(HostedZone, zone_id)
    assert after is not None
    assert after.record_count == count_before - 1


def test_delete_record_unauthorized_401(client: TestClient) -> None:
    assert client.delete("/records/does-not-exist").status_code == 401


def test_delete_record_not_found_404(auth_client: TestClient) -> None:
    assert (
        auth_client.delete("/records/00000000-0000-0000-0000-000000000000").status_code
        == 404
    )
