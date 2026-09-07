"""Shared FastAPI dependencies."""

from app.core.config import Settings, get_settings
from app.db.session import get_db

__all__ = ["Settings", "get_settings", "get_db"]


def get_settings_dep() -> Settings:
    """Inject cached application settings."""
    return get_settings()
