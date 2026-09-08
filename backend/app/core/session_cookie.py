"""Session cookie flags for same-origin local dev vs split frontend/API deploys."""

from __future__ import annotations

from typing import Literal
from urllib.parse import urlparse

from fastapi import Request

from app.core.config import settings

SameSite = Literal["lax", "none"]


def _forwarded_proto(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto")
    if proto:
        return proto.split(",")[0].strip().lower()
    return request.url.scheme


def _canonical_host(host: str | None) -> str:
    if not host:
        return ""
    value = host.split(",")[0].strip().split(":")[0].lower()
    if value in {"127.0.0.1", "::1"}:
        return "localhost"
    return value


def _request_host(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-host")
    if forwarded:
        return _canonical_host(forwarded)
    return _canonical_host(request.headers.get("host") or request.url.hostname)


def session_cookie_flags(request: Request) -> tuple[bool, SameSite]:
    """Return ``(secure, samesite)`` for Set-Cookie.

    Vercel (or localhost) + Render is cross-site, so the session cookie must be
    ``SameSite=None; Secure``. Same host (including localhost vs 127.0.0.1)
    keeps ``Lax`` so local HTTP cookies still work.
    """
    origin = request.headers.get("origin", "")
    origin_host = _canonical_host(urlparse(origin).hostname if origin else None)
    api_host = _request_host(request)
    cross_site = bool(origin_host and api_host and origin_host != api_host)

    if cross_site:
        return True, "none"

    secure = settings.is_prod or _forwarded_proto(request) == "https"
    return secure, "lax"
