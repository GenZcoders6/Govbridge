"""
GovBridge Backend — Application Entry Point
"""
from contextlib import asynccontextmanager
import structlog

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis_client import get_redis
from app.routers import (
    auth,
    users,
    departments,
    connectors,
    applications,
    workflows,
    identity,
    consents,
    audit,
    events,
    health,
    dashboard,
    exchange,
    exceptions,
)

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("govbridge.startup", env=settings.APP_ENV)
    # Create all tables (dev convenience — use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed demo data
    from app.utils.seed import seed_demo_data
    await seed_demo_data()
    log.info("govbridge.ready")
    yield
    log.info("govbridge.shutdown")


from fastapi.responses import RedirectResponse

app = FastAPI(
    title="GovBridge API",
    description="Government Interoperability & Service Orchestration Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


@app.get("/api/docs", include_in_schema=False)
async def api_docs_redirect():
    return RedirectResponse(url="/docs")


@app.get("/api/redoc", include_in_schema=False)
async def api_redoc_redirect():
    return RedirectResponse(url="/redoc")


# ── Middleware ────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(departments.router, prefix="/api/departments", tags=["departments"])
app.include_router(connectors.router, prefix="/api/connectors", tags=["connectors"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(identity.router, prefix="/api/identity", tags=["identity"])
app.include_router(consents.router, prefix="/api/consents", tags=["consents"])
app.include_router(consents.router, prefix="/api/consent", tags=["consents"], include_in_schema=False)
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(exchange.router, prefix="/api/exchange", tags=["exchange"])
app.include_router(exceptions.router, prefix="/api/exceptions", tags=["exceptions"])

