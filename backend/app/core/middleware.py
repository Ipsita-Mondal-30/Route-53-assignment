"""HTTP middlewares (request id, etc.)."""

from __future__ import annotations

import uuid

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.logging import REQUEST_ID_HEADER, request_id_ctx


class RequestIdMiddleware:
    """Assign a UUID per request, attach to logs, echo as X-Request-ID.

    Implemented as pure ASGI middleware (not BaseHTTPMiddleware) so FastAPI
    exception handlers can still turn errors into responses under TestClient.
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = {
            k.decode("latin-1").lower(): v.decode("latin-1")
            for k, v in scope.get("headers", [])
        }
        incoming = headers.get(REQUEST_ID_HEADER.lower())
        if incoming and incoming.strip():
            request_id = incoming.strip()
        else:
            request_id = str(uuid.uuid4())

        token = request_id_ctx.set(request_id)

        async def send_with_request_id(message: Message) -> None:
            if message["type"] == "http.response.start":
                raw_headers = list(message.get("headers", []))
                raw_headers.append(
                    (
                        REQUEST_ID_HEADER.lower().encode("latin-1"),
                        request_id.encode("latin-1"),
                    )
                )
                message = {**message, "headers": raw_headers}
            await send(message)

        try:
            await self.app(scope, receive, send_with_request_id)
        finally:
            request_id_ctx.reset(token)
