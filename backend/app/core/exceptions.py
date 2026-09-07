"""Domain / application exceptions and FastAPI exception handlers.

Service layers raise these (or the service-local aliases that subclass /
mirror them). Handlers here map them to ``{"detail": "..."}`` responses so
route handlers do not need to wrap every call in ``HTTPException``.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base class for expected domain failures with a stable HTTP mapping."""

    status_code: int = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED


class RateLimitError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS


def _error_response(status_code: int, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": detail})


def register_exception_handlers(app: FastAPI) -> None:
    """Attach domain + catch-all exception handlers to the application."""
    # Import service exception types here so handlers work without relocating
    # class definitions out of services (business logic stays untouched).
    from app.services.auth_service import AuthError
    from app.services.dns_record_service import DnsRecordNotFound
    from app.services.hosted_zone_service import HostedZoneConflict, HostedZoneNotFound

    @app.exception_handler(HostedZoneNotFound)
    async def hosted_zone_not_found_handler(
        _request: Request,
        exc: HostedZoneNotFound,
    ) -> JSONResponse:
        return _error_response(status.HTTP_404_NOT_FOUND, str(exc))

    @app.exception_handler(HostedZoneConflict)
    async def hosted_zone_conflict_handler(
        _request: Request,
        exc: HostedZoneConflict,
    ) -> JSONResponse:
        return _error_response(status.HTTP_409_CONFLICT, str(exc))

    @app.exception_handler(DnsRecordNotFound)
    async def dns_record_not_found_handler(
        _request: Request,
        exc: DnsRecordNotFound,
    ) -> JSONResponse:
        return _error_response(status.HTTP_404_NOT_FOUND, str(exc))

    @app.exception_handler(AuthError)
    async def auth_error_handler(
        _request: Request,
        exc: AuthError,
    ) -> JSONResponse:
        return _error_response(status.HTTP_401_UNAUTHORIZED, str(exc))

    @app.exception_handler(AppError)
    async def app_error_handler(
        _request: Request,
        exc: AppError,
    ) -> JSONResponse:
        return _error_response(exc.status_code, exc.detail)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        # Always log the full traceback server-side; never leak it to clients
        # in production (and keep the client body generic in all environments).
        logger.exception(
            "Unhandled exception on %s %s",
            request.method,
            request.url.path,
            exc_info=exc,
        )
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Internal server error",
        )
