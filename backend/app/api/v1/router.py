from fastapi import APIRouter

from app.api.v1 import auth, health, hosted_zones

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router)
api_router.include_router(hosted_zones.router)
