from fastapi.testclient import TestClient


def test_notifications_require_auth(client: TestClient) -> None:
    response = client.get("/notifications")
    assert response.status_code == 401


def test_list_starts_empty(auth_client: TestClient) -> None:
    listed = auth_client.get("/notifications")
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["items"] == []
    assert payload["unread_count"] == 0


def test_zone_and_record_activity_creates_notifications(
    auth_client: TestClient,
) -> None:
    created_zone = auth_client.post(
        "/hosted-zones",
        json={"name": "notify-zone.example.com", "type": "Public"},
    )
    assert created_zone.status_code == 201
    zone_id = created_zone.json()["id"]

    updated_zone = auth_client.put(
        f"/hosted-zones/{zone_id}",
        json={"comment": "after edit"},
    )
    assert updated_zone.status_code == 200

    created_record = auth_client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "type": "A",
            "name": "www.notify-zone.example.com",
            "ttl": 300,
            "value": "203.0.113.10",
        },
    )
    assert created_record.status_code == 201
    record_id = created_record.json()["id"]

    updated_record = auth_client.put(
        f"/records/{record_id}",
        json={
            "type": "A",
            "name": "www.notify-zone.example.com",
            "ttl": 60,
            "value": "203.0.113.11",
        },
    )
    assert updated_record.status_code == 200

    listed = auth_client.get("/notifications")
    assert listed.status_code == 200
    payload = listed.json()
    bodies = [item["body"] for item in payload["items"]]
    titles = [item["title"] for item in payload["items"]]
    assert payload["unread_count"] >= 4
    assert "Hosted zone created" in titles
    assert "Hosted zone updated" in titles
    assert "DNS record created" in titles
    assert "DNS record updated" in titles
    assert any("notify-zone.example.com" in body for body in bodies)
    assert all(item["source"] == "user_configured" for item in payload["items"])
    assert all(item["category"] == "Amazon Route 53" for item in payload["items"])

    configured = auth_client.get(
        "/notifications", params={"tab": "user_configured"}
    )
    assert configured.status_code == 200
    assert len(configured.json()["items"]) >= 4

    managed = auth_client.get("/notifications", params={"tab": "aws_managed"})
    assert managed.status_code == 200
    assert managed.json()["items"] == []

    first_id = payload["items"][0]["id"]
    read = auth_client.post(f"/notifications/{first_id}/read")
    assert read.status_code == 200
    assert read.json()["read_at"] is not None

    created = auth_client.post(
        "/notifications",
        json={
            "source": "user_configured",
            "category": "Route 53",
            "title": "Manual",
            "body": "Posted from the API.",
        },
    )
    assert created.status_code == 201

    cleared = auth_client.post("/notifications/read-all")
    assert cleared.status_code == 204
    after = auth_client.get("/notifications")
    assert after.json()["unread_count"] == 0


def test_read_missing_notification(auth_client: TestClient) -> None:
    response = auth_client.post(
        "/notifications/00000000-0000-0000-0000-000000000000/read"
    )
    assert response.status_code == 404
