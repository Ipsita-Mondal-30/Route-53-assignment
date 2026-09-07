from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.rate_limit import login_rate_limiter
from app.main import app


def test_request_id_header_generated(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")


def test_request_id_header_echoed(client: TestClient) -> None:
    response = client.get("/health", headers={"X-Request-ID": "test-req-123"})
    assert response.headers.get("X-Request-ID") == "test-req-123"


def test_unhandled_error_returns_generic_500() -> None:
    """Stack traces must not leak to the client."""

    @app.get("/__test_boom")
    def _boom() -> None:
        raise RuntimeError("secret internal detail")

    quiet = TestClient(app, raise_server_exceptions=False)
    response = quiet.get("/__test_boom")
    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}
    assert "secret" not in response.text


def test_login_rate_limit(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    login_rate_limiter.reset()
    monkeypatch.setattr(login_rate_limiter, "max_requests", 3)
    monkeypatch.setattr(login_rate_limiter, "window_seconds", 60.0)

    payload = {"email": "nobody@example.com", "password": "wrong"}
    statuses = [
        client.post("/auth/login", json=payload).status_code for _ in range(4)
    ]
    assert statuses[:3] == [401, 401, 401]
    assert statuses[3] == 429
    detail = client.post("/auth/login", json=payload).json()["detail"]
    assert "Too many login attempts" in detail
    login_rate_limiter.reset()
