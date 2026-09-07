from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.hosted_zone import HostedZone


def _create_zone(auth_client: TestClient) -> tuple[str, str]:
    name = f"bind-{uuid.uuid4().hex[:10]}.example.com"
    response = auth_client.post(
        "/hosted-zones",
        json={"name": name, "comment": "bind import"},
    )
    assert response.status_code == 201
    body = response.json()
    return body["id"], body["name"]


def _origin(name: str) -> str:
    return name if name.endswith(".") else f"{name}."


def _sample_zone(origin: str) -> str:
    return f"""
$ORIGIN {_origin(origin)}
$TTL 3600

; comments and blank lines are ignored

@ IN A 192.0.2.1
www IN CNAME {_origin(origin)}
mail IN MX 10 mail.{_origin(origin)}
@ IN TXT "v=spf1 include:{origin} ~all"
ns1 IN NS ns-1.awsdns-00.com.
@ IN SOA ns1.{_origin(origin)} admin.{_origin(origin)} 1 7200 3600 1209600 3600
_sip._tcp IN SRV 10 5 5060 sip.{_origin(origin)}
@ IN CAA 0 issue "letsencrypt.org"
ipv6 IN AAAA 2001:db8::1
4.3.2.1.in-addr.arpa. IN PTR host.{_origin(origin)}
www IN NAPTR 10 10 "u" "E2U+sip" "!^.*$!sip:info@example.com!" .
bad IN A not-an-ip
"""


def test_preview_and_import_sample_zone(
    auth_client: TestClient,
    db: Session,
) -> None:
    zone_id, zone_name = _create_zone(auth_client)
    content = _sample_zone(zone_name)
    preview = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import/preview",
        json={"content": content, "filename": "zone.bind"},
    )
    assert preview.status_code == 200, preview.text
    body = preview.json()
    types = {item["type"] for item in body["records"]}
    assert {
        "A",
        "AAAA",
        "CNAME",
        "MX",
        "TXT",
        "NS",
        "SOA",
        "SRV",
        "CAA",
        "PTR",
        "NAPTR",
    } <= types
    assert body["counts"]["unsupported"] >= 2  # SOA + NAPTR
    assert body["counts"]["invalid"] >= 1
    assert any(item["status"] == "invalid" for item in body["records"])
    assert any(
        item["type"] == "NAPTR" and item["status"] == "unsupported"
        for item in body["records"]
    )

    imported = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import",
        json={"content": content, "filename": "ignored.exe", "duplicate_mode": "skip"},
    )
    assert imported.status_code == 200, imported.text
    result = imported.json()
    assert result["imported"] >= 8
    assert result["failed"] >= 2
    assert all("reason" in row for row in result["failures"])

    listed = auth_client.get(f"/hosted-zones/{zone_id}/records", params={"page_size": 100})
    assert listed.status_code == 200
    records = listed.json()["items"]
    imported_types = {row["type"] for row in records}
    assert "SOA" not in imported_types
    assert "NAPTR" not in imported_types
    assert {"A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA", "PTR"} <= imported_types
    assert all(row["value"] != "not-an-ip" for row in records)

    db.expire_all()
    zone = db.get(HostedZone, zone_id)
    assert zone is not None
    assert zone.record_count == len(records)

    listed_notes = auth_client.get("/notifications")
    titles = [item["title"] for item in listed_notes.json()["items"]]
    assert titles.count("DNS records imported") == 1
    assert "DNS record created" not in titles


def test_skip_and_replace_duplicates(auth_client: TestClient) -> None:
    zone_id, zone_name = _create_zone(auth_client)
    created = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "type": "A",
            "name": f"www.{zone_name}",
            "ttl": 300,
            "value": "192.0.2.10",
        },
    )
    assert created.status_code == 201
    other = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "type": "A",
            "name": f"keep.{zone_name}",
            "ttl": 300,
            "value": "192.0.2.99",
        },
    )
    assert other.status_code == 201
    keep_id = other.json()["id"]

    content = f"""
$ORIGIN {_origin(zone_name)}
www 60 IN A 192.0.2.10
new IN A 192.0.2.20
"""
    preview = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import/preview",
        json={"content": content},
    )
    assert preview.status_code == 200
    counts = preview.json()["counts"]
    assert counts["duplicate"] == 1
    assert counts["valid"] == 1

    skipped = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import",
        json={"content": content, "duplicate_mode": "skip"},
    )
    assert skipped.status_code == 200
    skip_body = skipped.json()
    assert skip_body["imported"] == 1
    assert skip_body["skipped"] == 1

    listed = auth_client.get(f"/hosted-zones/{zone_id}/records", params={"page_size": 100})
    items = listed.json()["items"]
    www = next(row for row in items if row["name"].startswith("www."))
    assert www["ttl"] == 300
    assert any(row["id"] == keep_id for row in items)

    replaced = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import",
        json={"content": content, "duplicate_mode": "replace"},
    )
    assert replaced.status_code == 200
    listed = auth_client.get(f"/hosted-zones/{zone_id}/records", params={"page_size": 100})
    items = listed.json()["items"]
    www = next(row for row in items if row["name"].startswith("www."))
    assert www["ttl"] == 60
    assert any(row["id"] == keep_id and row["value"] == "192.0.2.99" for row in items)


def test_file_internal_duplicates(auth_client: TestClient) -> None:
    zone_id, zone_name = _create_zone(auth_client)
    content = f"""
$ORIGIN {_origin(zone_name)}
www IN A 1.2.3.4
www IN A 1.2.3.4
"""
    preview = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import/preview",
        json={"content": content},
    )
    assert preview.status_code == 200
    body = preview.json()
    assert body["counts"]["valid"] == 1
    assert body["counts"]["duplicate"] == 1


def test_empty_file_400(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import/preview",
        json={"content": "   \n  "},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_malformed_bind_file_400(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import/preview",
        json={"content": "@ IN TXT ( \"unclosed\""},
    )
    assert response.status_code == 400
    assert "parenthesis" in response.json()["detail"].lower()


def test_binary_rejected(auth_client: TestClient) -> None:
    zone_id, _ = _create_zone(auth_client)
    response = auth_client.post(
        f"/hosted-zones/{zone_id}/records/import/preview",
        json={"content": "www IN A 1.2.3.4\u0000"},
    )
    assert response.status_code == 400
    assert "binary" in response.json()["detail"].lower()


def test_import_unauthorized_401(client: TestClient) -> None:
    response = client.post(
        "/hosted-zones/ZDOESNOTEXIST01/records/import/preview",
        json={"content": "www IN A 1.2.3.4"},
    )
    assert response.status_code == 401


def test_import_zone_not_found_404(auth_client: TestClient) -> None:
    response = auth_client.post(
        "/hosted-zones/ZDOESNOTEXIST01/records/import/preview",
        json={"content": "www IN A 1.2.3.4"},
    )
    assert response.status_code == 404
