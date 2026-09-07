"""Simple in-memory rate limiter (no external dependency).

Suitable for a single-process deployment. For multi-worker / multi-host
production, swap this for Redis-backed limiting.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from app.core.config import settings


class InMemoryRateLimiter:
    """Sliding-window counter keyed by an arbitrary string (e.g. client IP)."""

    def __init__(self, *, max_requests: int, window_seconds: float) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            bucket = self._hits[key]
            cutoff = now - self.window_seconds
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= self.max_requests:
                return False
            bucket.append(now)
            return True

    def reset(self) -> None:
        """Clear all buckets (useful in tests)."""
        with self._lock:
            self._hits.clear()


# Blunt brute-force protection for /auth/login (per client IP).
login_rate_limiter = InMemoryRateLimiter(
    max_requests=settings.login_rate_limit,
    window_seconds=float(settings.login_rate_window_seconds),
)
