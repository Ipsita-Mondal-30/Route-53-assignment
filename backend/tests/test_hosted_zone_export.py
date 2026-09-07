from __future__ import annotations

import io
import json
import uuid
import zipfile

from fastapi.testclient import TestClient

from app.services.bind_export import txt_logical_value
from app.services.bind_parser import parse_zone
from app.services.dns_record_validation import normalize_owner

_INTERNAL_KEYS = {
    "id",
    "hosted_zone_id",
    "created_at",
    "updated_at",
    "created_by",
    "record_count",
    "comment",
    "priority",
    "weight",
    "port",
    "caa_flag",
    "caa_tag",
}


def _create_zone(
    auth_client: TestClient, prefix: str = "export", comment: str = "export zone"
) -> tuple[str, str]:
    name = f"{prefix}-{uuid.uuid4().hex[:10]}.example.com"
    response = auth_client.post(
        "/hosted-zones",
        json={"name": name, "comment": comment, "type": "Public"},
    )
    assert response.status_code == 201, response.text
    body = response.json()
    return body["id"], body["name"]


def _record_payloads(zone_name: str) -> list[dict[str, object]]:
    origin = zone_name
    return [
        {"type": "A", "name": origin, "ttl": 300, "value": "192.0.2.1"},
        {"type": "AAAA", "name": f"ipv6.{origin}", "ttl": 300, "value": "2001:db8::1"},
        {
            "type": "CNAME",
            "name": f"www.{origin}",
            "ttl": 300,
            "value": origin,
        },
        {
            "type": "MX",
            "name": f"mail.{origin}",
            "ttl": 300,
            "value": f"mail.{origin}",
            "priority": 10,
        },
        {
            "type": "TXT",
            "name": origin,
            "ttl": 300,
            "value": '"v=spf1 include:example.com ~all"',
        },
        {
            "type": "TXT",
            "name": f"quote.{origin}",
            "ttl": 120,
            "value": r'"say \"hello\""',
        },
        {
            "type": "NS",
            "name": origin,
            "ttl": 172800,
            "value": "ns-1.awsdns-00.com.",
        },
        {
            "type": "PTR",
            "name": "4.3.2.1.in-addr.arpa",
            "ttl": 300,
            "value": f"host.{origin}",
        },
        {
            "type": "SRV",
            "name": f"_sip._tcp.{origin}",
            "ttl": 300,
            "value": f"sip.{origin}",
            "priority": 10,
            "weight": 5,
            "port": 5060,
        },
        {
            "type": "CAA",
            "name": origin,
            "ttl": 300,
            "value": "letsencrypt.org",
            "caa_flag": 0,
            "caa_tag": "issue",
        },
    ]


def _seed_records(auth_client: TestClient, zone_id: str, zone_name: str) -> list[dict]:
    created: list[dict] = []
    for payload in _record_payloads(zone_name):
        response = auth_client.post(f"/hosted-zones/{zone_id}/records", json=payload)
        assert response.status_code == 201, response.text
        created.append(response.json())
    return created


def _list_records(auth_client: TestClient, zone_id: str) -> list[dict]:
    response = auth_client.get(
        f"/hosted-zones/{zone_id}/records", params={"page_size": 100}
    )
    assert response.status_code == 200, response.text
    return response.json()["items"]


def _canonical_api(row: dict) -> tuple[object, ...]:
    rtype = str(row["type"]).upper()
    name = normalize_owner(str(row["name"]))
    ttl = int(row["ttl"])
    if rtype == "MX":
        value = f"{row['priority']} {normalize_owner(str(row['value']))}"
    elif rtype == "SRV":
        value = (
            f"{row['priority']} {row['weight']} {row['port']} "
            f"{normalize_owner(str(row['value']))}"
        )
    elif rtype == "CAA":
        value = (
            f"{row['caa_flag']} {row['caa_tag']} "
            f"{txt_logical_value(str(row['value']))}"
        )
    elif rtype == "TXT":
        value = txt_logical_value(str(row["value"]))
    elif rtype in {"CNAME", "NS", "PTR"}:
        value = normalize_owner(str(row["value"]))
    else:
        value = str(row["value"])
    return (name, rtype, ttl, value)


def _canonical_export(row: dict) -> tuple[object, ...]:
    rtype = str(row["type"]).upper()
    name = normalize_owner(str(row["name"]))
    ttl = int(row["ttl"])
    raw = str(row["value"])
    if rtype == "TXT":
        value = txt_logical_value(raw)
    elif rtype == "CAA":
        flag, tag, rest = raw.split(None, 2)
        value = f"{flag} {tag} {txt_logical_value(rest)}"
    elif rtype == "MX":
        priority, host = raw.split(None, 1)
        value = f"{priority} {normalize_owner(host)}"
    elif rtype == "SRV":
        priority, weight, port, host = raw.split(None, 3)
        value = f"{priority} {weight} {port} {normalize_owner(host)}"
    elif rtype in {"CNAME", "NS", "PTR"}:
        value = normalize_owner(raw)
    else:
        value = raw
    return (name, rtype, ttl, value)


def test_json_export_schema_and_filename(auth_client: TestClient) -> None:
    zone_id, zone_name = _create_zone(auth_client)
    original = _seed_records(auth_client, zone_id, zone_name)

    response = auth_client.get(
        f"/hosted-zones/{zone_id}/export", params={"format": "json"}
    )
    assert response.status_code == 200, response.text
    assert response.headers["x-export-filename"] == f"{zone_name}.json"
    assert f"{zone_name}.json" in response.headers["content-disposition"]

    document = response.json()
    assert document["name"] == f"{zone_name}."
    assert document["zoneId"] == zone_id
    assert document["type"] == "PUBLIC"
    assert document["description"] == "export zone"
    assert document["tags"] == []
    assert set(document.keys()) == {
        "name",
        "zoneId",
        "type",
        "description",
        "records",
        "tags",
    }
    dumped = json.dumps(document)
    for key in _INTERNAL_KEYS:
        assert f'"{key}"' not in dumped

    exported = {_canonical_export(row) for row in document["records"]}
    original_set = {_canonical_api(row) for row in original}
    assert exported == original_set


def test_json_export_parses_and_matches_zone(auth_client: TestClient) -> None:
    zone_id, zone_name = _create_zone(auth_client)
    _seed_records(auth_client, zone_id, zone_name)
    listed = _list_records(auth_client, zone_id)

    response = auth_client.get(
        f"/hosted-zones/{zone_id}/export", params={"format": "json"}
    )
    parsed = json.loads(response.content.decode("utf-8"))
    assert {_canonical_export(row) for row in parsed["records"]} == {
        _canonical_api(row) for row in listed
    }


def test_bind_export_is_valid_and_preserves_rdata(auth_client: TestClient) -> None:
    zone_id, zone_name = _create_zone(auth_client)
    original = _seed_records(auth_client, zone_id, zone_name)

    response = auth_client.get(
        f"/hosted-zones/{zone_id}/export", params={"format": "bind"}
    )
    assert response.status_code == 200, response.text
    assert response.headers["x-export-filename"] == f"{zone_name}.zone"
    text = response.text
    assert f"$ORIGIN {zone_name}." in text
    assert "IN SOA" in text
    assert r'"say \"hello\""' in text
    assert "IN MX 10" in text
    assert "IN SRV 10 5 5060" in text
    assert "IN CAA 0 issue" in text

    parsed = parse_zone(text, zone_origin=f"{zone_name}.")
    types = {row.type for row in parsed}
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
    } <= types

    original_set = {_canonical_api(row) for row in original}
    exported_non_soa = {
        _canonical_export(
            {
                "name": row.name,
                "type": row.type,
                "ttl": row.ttl,
                "value": row.rdata,
            }
        )
        for row in parsed
        if row.type != "SOA"
    }
    assert exported_non_soa == original_set


def test_bind_export_import_round_trip(auth_client: TestClient) -> None:
    source_id, source_name = _create_zone(auth_client, prefix="src")
    original = _seed_records(auth_client, source_id, source_name)

    exported = auth_client.get(
        f"/hosted-zones/{source_id}/export", params={"format": "bind"}
    )
    assert exported.status_code == 200, exported.text

    dest_id, _dest_name = _create_zone(auth_client, prefix="dst")
    imported = auth_client.post(
        f"/hosted-zones/{dest_id}/records/import",
        json={"content": exported.text, "filename": "round-trip.zone"},
    )
    assert imported.status_code == 200, imported.text
    result = imported.json()
    assert result["imported"] == len(original)
    assert all(row["type"] == "SOA" for row in result["failures"])

    dest_records = _list_records(auth_client, dest_id)
    assert {_canonical_api(row) for row in dest_records} == {
        _canonical_api(row) for row in original
    }


def test_bulk_json_and_bind_zip(auth_client: TestClient) -> None:
    first_id, first_name = _create_zone(auth_client, prefix="bulk-a")
    second_id, second_name = _create_zone(auth_client, prefix="bulk-b")
    _seed_records(auth_client, first_id, first_name)
    auth_client.post(
        f"/hosted-zones/{second_id}/records",
        json={"type": "A", "name": second_name, "ttl": 60, "value": "192.0.2.9"},
    )

    json_response = auth_client.post(
        "/hosted-zones/export",
        json={"zone_ids": [first_id, second_id], "format": "json"},
    )
    assert json_response.status_code == 200, json_response.text
    assert json_response.headers["x-export-filename"] == "hosted-zones.json"
    bundle = json_response.json()
    assert {zone["zoneId"] for zone in bundle["zones"]} == {first_id, second_id}

    json_one = auth_client.post(
        "/hosted-zones/export",
        json={"zone_ids": [first_id], "format": "json"},
    )
    assert json_one.status_code == 200
    assert json_one.headers["x-export-filename"] == f"{first_name}.json"
    assert json_one.json()["zoneId"] == first_id

    bind_one = auth_client.post(
        "/hosted-zones/export",
        json={"zone_ids": [first_id], "format": "bind"},
    )
    assert bind_one.status_code == 200
    assert bind_one.headers["x-export-filename"] == f"{first_name}.zone"

    bind_zip = auth_client.post(
        "/hosted-zones/export",
        json={"zone_ids": [first_id, second_id], "format": "bind"},
    )
    assert bind_zip.status_code == 200, bind_zip.text
    assert bind_zip.headers["x-export-filename"] == "hosted-zones.zip"
    archive = zipfile.ZipFile(io.BytesIO(bind_zip.content))
    names = set(archive.namelist())
    assert f"{first_name}.zone" in names
    assert f"{second_name}.zone" in names


def test_export_unauthorized_401(client: TestClient) -> None:
    response = client.get("/hosted-zones/ZDOESNOTEXIST01/export")
    assert response.status_code == 401


def test_export_zone_not_found_404(auth_client: TestClient) -> None:
    response = auth_client.get("/hosted-zones/ZDOESNOTEXIST01/export")
    assert response.status_code == 404


def test_empty_zone_bind_and_private_json(auth_client: TestClient) -> None:
    name = f"empty-{uuid.uuid4().hex[:10]}.example.com"
    created = auth_client.post(
        "/hosted-zones",
        json={"name": name, "comment": None, "type": "Private"},
    )
    assert created.status_code == 201
    zone_id = created.json()["id"]

    bind = auth_client.get(
        f"/hosted-zones/{zone_id}/export", params={"format": "bind"}
    )
    assert bind.status_code == 200
    text = bind.text
    parsed = parse_zone(text, zone_origin=f"{name}.")
    assert [row.type for row in parsed] == ["SOA"]

    json_response = auth_client.get(
        f"/hosted-zones/{zone_id}/export", params={"format": "json"}
    )
    document = json_response.json()
    assert document["type"] == "PRIVATE"
    assert document["description"] == ""
    assert document["records"] == []
