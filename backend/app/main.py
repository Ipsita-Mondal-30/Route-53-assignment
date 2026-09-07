from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from logging import getLogger

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import engine

logger = getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    if settings.environment == "dev":
        try:
            from app.db.seed import seed_demo_user

            seed_demo_user()
        except Exception:
            logger.exception("Failed to seed demo user on startup")
    yield
    engine.dispose()


def create_app() -> FastAPI:
    application = FastAPI(
        title="Route 53 Clone API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.environment == "dev" else None,
        redoc_url="/redoc" if settings.environment == "dev" else None,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router)

    return application


app = create_app()
