from fastapi.testclient import TestClient

from app.core.config import settings
from app.db.seed import seed_demo_user
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_me_logout_flow() -> None:
    seed_demo_user()

    bad = client.post(
        "/auth/login",
        json={"email": settings.demo_user_email, "password": "wrong"},
    )
    assert bad.status_code == 401

    login = client.post(
        "/auth/login",
        json={
            "email": settings.demo_user_email,
            "password": settings.demo_user_password,
        },
    )
    assert login.status_code == 200
    body = login.json()
    assert body["email"] == settings.demo_user_email
    assert "session_id" in login.cookies

    me = client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == settings.demo_user_email

    logout = client.post("/auth/logout")
    assert logout.status_code == 204

    me_after = client.get("/auth/me")
    assert me_after.status_code == 401
