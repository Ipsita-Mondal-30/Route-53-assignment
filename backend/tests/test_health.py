from __future__ import annotations

from fastapi.testclient import TestClient


def test_root_ok(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_head_ok(client: TestClient) -> None:
    response = client.head("/")
    assert response.status_code == 200


def test_health_ok(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}
    assert "X-Request-ID" in response.headers
