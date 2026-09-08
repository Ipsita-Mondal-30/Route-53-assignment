from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.db import session as db_session

router = APIRouter()


@router.api_route("/", methods=["GET", "HEAD"], response_model=None)
def root() -> JSONResponse:
    """Render (and other hosts) probe ``HEAD /``; keep this cheap and unauthenticated."""
    return JSONResponse(status_code=200, content={"status": "ok"})


@router.get("/health", response_model=None)
def health() -> JSONResponse:
    """Liveness + DB readiness — no authentication required.

    Returns 200 when the database answers ``SELECT 1``, otherwise 503.
    """
    try:
        with db_session.engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "unreachable"},
        )
    return JSONResponse(
        status_code=200,
        content={"status": "ok", "database": "ok"},
    )
