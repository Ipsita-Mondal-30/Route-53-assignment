from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def _ensure_sqlite_data_dir(database_url: str) -> None:
    if not database_url.startswith("sqlite"):
        return

    db_path = database_url.removeprefix("sqlite:///")
    if db_path.startswith("./") or not db_path.startswith("/"):
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)


_ensure_sqlite_data_dir(settings.database_url)

connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
