"""Shared pytest fixtures: isolated SQLite DB, TestClient, authenticated client."""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

# Import models so Base.metadata is fully populated before create_all.
import app.models  # noqa: F401
from app.core.config import settings
from app.core.rate_limit import login_rate_limiter
from app.db.base import Base
from app.db.seed import seed_demo_user


@pytest.fixture(scope="session")
def test_engine(
    tmp_path_factory: pytest.TempPathFactory,
) -> Generator[Engine, None, None]:
    """Fresh temp-file SQLite database for the whole test session."""
    db_path: Path = tmp_path_factory.mktemp("data") / "test.db"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )

    @event.listens_for(engine, "connect")
    def _fk_pragma(dbapi_connection: object, _connection_record: object) -> None:
        cursor = dbapi_connection.cursor()  # type: ignore[attr-defined]
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)

    # Point the application at the test engine / session factory.
    import app.db.session as session_module
    import app.main as main_module

    testing_session_local = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
        class_=Session,
        expire_on_commit=False,
    )
    session_module.engine = engine
    session_module.SessionLocal = testing_session_local
    main_module.engine = engine

    yield engine

    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="session")
def TestingSessionLocal(test_engine: Engine) -> sessionmaker[Session]:
    import app.db.session as session_module

    return session_module.SessionLocal


@pytest.fixture(scope="session")
def app(test_engine: Engine, TestingSessionLocal: sessionmaker[Session]):
    """FastAPI app with get_db overridden to use the test session factory."""
    from app.db.session import get_db
    from app.main import app as fastapi_app

    def _override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = _override_get_db
    yield fastapi_app
    fastapi_app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def _clean_db(test_engine: Engine) -> Generator[None, None, None]:
    """Truncate all tables before each test for isolation."""
    with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
    login_rate_limiter.reset()
    yield


@pytest.fixture
def db(TestingSessionLocal: sessionmaker[Session]) -> Generator[Session, None, None]:
    """Direct DB session for assertions outside the HTTP layer."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(app) -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_client(client: TestClient) -> TestClient:
    """Seed the demo user, log in, and return a client with the session cookie."""
    seed_demo_user()
    response = client.post(
        "/auth/login",
        json={
            "email": settings.demo_user_email,
            "password": settings.demo_user_password,
        },
    )
    assert response.status_code == 200, response.text
    assert "session_id" in response.cookies
    return client


@pytest.fixture
def demo_credentials() -> dict[str, str]:
    return {
        "email": settings.demo_user_email,
        "password": settings.demo_user_password,
    }
