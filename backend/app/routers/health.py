"""
Health check router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.core.redis_client import get_redis

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_ok = False
    redis_ok = False
    db_error = None
    redis_error = None

    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_error = str(e)

    try:
        r = await get_redis()
        await r.ping()
        redis_ok = True
    except Exception as e:
        redis_error = str(e)

    status = "healthy" if (db_ok and redis_ok) else "degraded" if db_ok else "unhealthy"
    return {
        "status": status,
        "service": "GovBridge API",
        "version": "1.0.0",
        "backend": "ok",
        "components": {
            "backend": "ok",
            "database": "ok" if db_ok else "error",
            "redis": "ok" if redis_ok else "error",
        },
        "details": {
            "database": "connected" if db_ok else f"unavailable ({db_error})",
            "redis": "connected" if redis_ok else f"unavailable ({redis_error})",
        },
    }
