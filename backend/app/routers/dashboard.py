"""
Dashboard Router — Aggregated stats for the main dashboard
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.models import (
    Application, ApplicationStatus, Connector, ConnectorStatus,
    ConnectorHealth, Workflow, Event, Consent, ConsentStatus, User
)
from app.schemas.schemas import ApplicationRead, ConnectorHealthRead
from app.security import get_current_user

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Application counts
    total_apps = await db.scalar(select(func.count(Application.id)))
    pending_apps = await db.scalar(
        select(func.count(Application.id)).where(
            Application.status.in_([ApplicationStatus.SUBMITTED, ApplicationStatus.IN_REVIEW])
        )
    )
    approved_apps = await db.scalar(
        select(func.count(Application.id)).where(Application.status == ApplicationStatus.APPROVED)
    )

    # Connector stats
    total_connectors = await db.scalar(select(func.count(Connector.id)))
    active_connectors = await db.scalar(
        select(func.count(Connector.id)).where(Connector.status == ConnectorStatus.ACTIVE)
    )

    # Workflow stats
    active_workflows = await db.scalar(
        select(func.count(Workflow.id)).where(Workflow.is_active == True)
    )

    # Citizen count
    total_citizens = await db.scalar(
        select(func.count(User.id)).where(User.role == "CITIZEN")
    )

    # Events today
    events_today = await db.scalar(
        select(func.count(Event.id)).where(Event.created_at >= today)
    )

    # Pending consents
    pending_consents = await db.scalar(
        select(func.count(Consent.id)).where(Consent.status == ConsentStatus.PENDING)
    )

    # Recent applications
    recent_result = await db.execute(
        select(Application).order_by(desc(Application.created_at)).limit(5)
    )
    recent_apps = recent_result.scalars().all()

    # Latest connector health
    health_result = await db.execute(
        select(ConnectorHealth).order_by(desc(ConnectorHealth.checked_at)).limit(10)
    )
    connector_health = health_result.scalars().all()

    return {
        "total_applications": total_apps or 0,
        "pending_applications": pending_apps or 0,
        "approved_applications": approved_apps or 0,
        "active_connectors": active_connectors or 0,
        "total_connectors": total_connectors or 0,
        "active_workflows": active_workflows or 0,
        "total_citizens": total_citizens or 0,
        "events_today": events_today or 0,
        "pending_consents": pending_consents or 0,
        "recent_applications": [ApplicationRead.model_validate(a) for a in recent_apps],
        "connector_health": [ConnectorHealthRead.model_validate(h) for h in connector_health],
    }
