from fastapi import APIRouter

from app.api.v1 import auth, dns_records, health, hosted_zones

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router)
api_router.include_router(hosted_zones.router)
api_router.include_router(dns_records.router)
