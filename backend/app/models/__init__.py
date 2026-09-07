"""ORM models package.

Import model modules here once they exist so Alembic can discover metadata.
"""

from app.db.base import Base

__all__ = ["Base"]
