from __future__ import annotations

from fastapi.testclient import TestClient
from starlette.requests import Request

from app.core.config import Settings, settings
from app.core.session_cookie import session_cookie_flags
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


def test_signup_creates_user_and_session(client: TestClient) -> None:
    email = "new-user@example.com"
    password = "SignupPass123!"
    response = client.post("/auth/signup", json={"email": email, "password": password})
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == email
    assert "session_id" in response.cookies

    me = client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_signup_duplicate_email_409(
    client: TestClient,
    demo_credentials: dict[str, str],
) -> None:
    seed_demo_user()
    response = client.post(
        "/auth/signup",
        json={
            "email": demo_credentials["email"],
            "password": "AnotherPass123!",
        },
    )
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


def test_signup_short_password_422(client: TestClient) -> None:
    response = client.post(
        "/auth/signup",
        json={"email": "shortpass@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_signup_then_login(
    client: TestClient,
) -> None:
    email = "roundtrip@example.com"
    password = "RoundTrip123!"
    created = client.post("/auth/signup", json={"email": email, "password": password})
    assert created.status_code == 201

    client.post("/auth/logout")
    login = client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    assert login.json()["email"] == email


def test_cors_origins_strip_trailing_slash() -> None:
    parsed = Settings(
        CORS_ORIGINS="https://route-53-assignment.vercel.app/,http://localhost:3001/"
    )
    assert parsed.cors_origins == [
        "https://route-53-assignment.vercel.app",
        "http://localhost:3001",
    ]


def _cookie_request(**headers: str) -> Request:
    header_list = [
        (key.lower().encode("latin-1"), value.encode("latin-1"))
        for key, value in headers.items()
    ]
    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "scheme": "http",
        "path": "/auth/login",
        "raw_path": b"/auth/login",
        "query_string": b"",
        "headers": header_list,
        "client": ("127.0.0.1", 123),
        "server": ("testserver", 80),
    }
    return Request(scope)


def test_session_cookie_lax_for_localhost() -> None:
    request = _cookie_request(
        origin="http://localhost:3001",
        host="localhost:8000",
    )
    assert session_cookie_flags(request) == (False, "lax")


def test_session_cookie_none_secure_for_split_hosts() -> None:
    request = _cookie_request(
        origin="https://route-53-assignment.vercel.app",
        host="route-53-assignment.onrender.com",
        **{"x-forwarded-proto": "https"},
    )
    assert session_cookie_flags(request) == (True, "none")


def test_cross_site_login_sets_samesite_none(
    client: TestClient,
    demo_credentials: dict[str, str],
) -> None:
    seed_demo_user()
    response = client.post(
        "/auth/login",
        json=demo_credentials,
        headers={
            "Origin": "https://route-53-assignment.vercel.app",
            "Host": "route-53-assignment.onrender.com",
            "X-Forwarded-Proto": "https",
        },
    )
    assert response.status_code == 200
    set_cookie = response.headers.get("set-cookie", "").lower()
    assert "samesite=none" in set_cookie
    assert "secure" in set_cookie
