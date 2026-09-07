from __future__ import annotations

from fastapi.testclient import TestClient

from app.core.config import settings
from app.db.seed import seed_demo_user


def test_login_success(client: TestClient, demo_credentials: dict[str, str]) -> None:
    seed_demo_user()
    response = client.post("/auth/login", json=demo_credentials)
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == settings.demo_user_email
    assert "session_id" in response.cookies


def test_login_invalid_credentials_401(
    client: TestClient,
    demo_credentials: dict[str, str],
) -> None:
    seed_demo_user()
    response = client.post(
        "/auth/login",
        json={"email": demo_credentials["email"], "password": "wrong-password"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_login_bad_payload_422(client: TestClient) -> None:
    response = client.post("/auth/login", json={"email": "not-an-email"})
    assert response.status_code == 422


def test_me_happy_path(auth_client: TestClient) -> None:
    response = auth_client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == settings.demo_user_email


def test_me_unauthorized_401(client: TestClient) -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_logout_happy_path(auth_client: TestClient) -> None:
    logout = auth_client.post("/auth/logout")
    assert logout.status_code == 204
    me = auth_client.get("/auth/me")
    assert me.status_code == 401


def test_logout_unauthorized_401(client: TestClient) -> None:
    response = client.post("/auth/logout")
    assert response.status_code == 401


def test_login_me_logout_flow(
    client: TestClient,
    demo_credentials: dict[str, str],
) -> None:
    seed_demo_user()

    login = client.post("/auth/login", json=demo_credentials)
    assert login.status_code == 200

    me = client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == settings.demo_user_email

    logout = client.post("/auth/logout")
    assert logout.status_code == 204

    me_after = client.get("/auth/me")
    assert me_after.status_code == 401
