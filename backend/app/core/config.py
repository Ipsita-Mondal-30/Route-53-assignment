from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

SESSION_COOKIE_NAME = "session_id"


class Settings(BaseSettings):
    """Application settings loaded from environment / `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    database_url: str = Field(
        default="sqlite:///./data/route53.db",
        validation_alias="DATABASE_URL",
    )
    session_secret: str = Field(
        default="change-me-in-production",
        validation_alias="SESSION_SECRET",
    )
    session_expire_minutes: int = Field(
        default=60 * 24,
        validation_alias="SESSION_EXPIRE_MINUTES",
    )
    # Stored as a comma-separated string in env to avoid pydantic-settings
    # JSON-decoding list[str] before our validator runs.
    cors_origins_csv: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias="CORS_ORIGINS",
    )
    environment: Literal["dev", "prod"] = Field(
        default="dev",
        validation_alias="ENVIRONMENT",
    )
    demo_user_email: str = Field(
        default="demo@example.com",
        validation_alias="DEMO_USER_EMAIL",
    )
    demo_user_password: str = Field(
        default="DemoPass123!",
        validation_alias="DEMO_USER_PASSWORD",
    )

    @property
    def cors_origins(self) -> list[str]:
        raw = self.cors_origins_csv.strip()
        if not raw:
            return []
        if raw.startswith("["):
            import json

            parsed = json.loads(raw)
            return [str(item).strip() for item in parsed if str(item).strip()]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    @property
    def is_prod(self) -> bool:
        return self.environment == "prod"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
