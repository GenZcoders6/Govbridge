"""
Redis client wrapper with automatic resilient fallback
"""
import redis.asyncio as aioredis
from app.core.config import settings

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=0.6,
                socket_timeout=0.6,
            )
            await client.ping()
            _redis = client
        except Exception:
            try:
                import fakeredis.aioredis
                _redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
            except Exception:
                _redis = client
    return _redis


async def close_redis():
    global _redis
    if _redis:
        try:
            await _redis.aclose()
        except Exception:
            pass
        _redis = None
