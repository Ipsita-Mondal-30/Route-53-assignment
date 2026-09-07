"""OpenAPI / Swagger metadata for interactive docs at ``/docs``."""

from __future__ import annotations

API_TITLE = "Route 53 Clone API"
API_VERSION = "1.0.0"
API_DESCRIPTION = """
Session-authenticated DNS management API that mirrors a subset of Amazon Route 53.

## Authentication

1. `POST /auth/login` with `{ "email", "password" }` — sets an **httpOnly**
   `session_id` cookie (`Secure` in production, `SameSite=Lax`).
2. Send that cookie on subsequent requests (`credentials: include` from browsers).
3. `POST /auth/logout` deletes the server-side session and clears the cookie.

There is no JWT and no public signup — use the seeded demo user for local/demo
environments.

## Errors

All errors use FastAPI's standard shape: `{ "detail": "..." }` (or a validation
error list for `422`).
"""

OPENAPI_TAGS: list[dict[str, str]] = [
    {
        "name": "health",
        "description": "Liveness and database readiness probes (no auth).",
    },
    {
        "name": "auth",
        "description": (
            "Session-based login, logout, and current-user introspection. "
            "Login is rate-limited per client IP."
        ),
    },
    {
        "name": "hosted-zones",
        "description": (
            "CRUD for hosted zones (public/private DNS containers). "
            "List supports search, sort, and pagination. "
            "Deleting a zone cascades to its DNS records."
        ),
    },
    {
        "name": "records",
        "description": (
            "CRUD for DNS records nested under a hosted zone. "
            "Payloads are validated per record type (A, AAAA, CNAME, TXT, NS, "
            "PTR, MX, SRV, CAA) via a discriminated union."
        ),
    },
]
