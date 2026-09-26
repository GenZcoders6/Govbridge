"""
Connectors Router — Connector Registry & Health
SIH26129 Interoperability Foundation
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models import Connector, ConnectorHealth, ConnectorStatus, User
from app.schemas.schemas import ConnectorRead, ConnectorCreate, ConnectorHealthRead
from app.security import get_current_user, require_admin, require_officer
from app.integrations.factory import ConnectorFactory

router = APIRouter()


async def _enrich_connector_read(connector: Connector, db: AsyncSession) -> ConnectorRead:
    """Enrich connector model with computed/latest fields for API responses"""
    # Fetch most recent health check
    res = await db.execute(
        select(ConnectorHealth)
        .where(ConnectorHealth.connector_id == connector.id)
        .order_by(desc(ConnectorHealth.checked_at))
        .limit(1)
    )
    last_health = res.scalar_one_or_none()

    # Determine user-friendly system type
    system_type = None
    if connector.tags:
        system_type = str(connector.tags[0]).title() + " Registry"
    else:
        system_type = connector.name

    retry_policy = (connector.config or {}).get("retry_policy", {"max_retries": 3, "backoff_factor": 1.5})

    return ConnectorRead(
        id=connector.id,
        name=connector.name,
        code=connector.code,
        description=connector.description,
        department_id=connector.department_id,
        system_type=system_type,
        protocol=connector.protocol,
        authentication=connector.auth_type or "none",
        auth_type=connector.auth_type or "none",
        base_url=connector.base_url,
        status=connector.status,
        is_mock=connector.is_mock,
        tags=connector.tags or [],
        timeout=connector.timeout_seconds,
        timeout_seconds=connector.timeout_seconds,
        last_health_check=last_health.checked_at if last_health else None,
        retry_policy=retry_policy,
        created_at=connector.created_at,
        updated_at=connector.updated_at,
    )


@router.get("", response_model=List[ConnectorRead], include_in_schema=False)
@router.get("/", response_model=List[ConnectorRead])
async def list_connectors(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/connectors
    Returns all registered external government connectors with status, protocol, timeout, and retry policy.
    """
    result = await db.execute(select(Connector))
    connectors = result.scalars().all()
    enriched = []
    for c in connectors:
        enriched.append(await _enrich_connector_read(c, db))
    return enriched


@router.get("/health", response_model=List[ConnectorHealthRead])
@router.get("/health/summary", response_model=List[ConnectorHealthRead], include_in_schema=False)
async def get_connectors_health(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/connectors/health
    Returns latest health check statuses for all registered connectors.
    """
    result = await db.execute(
        select(ConnectorHealth).order_by(desc(ConnectorHealth.checked_at)).limit(50)
    )
    return result.scalars().all()


@router.get("/{connector_id}", response_model=ConnectorRead)
async def get_connector(
    connector_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/connectors/{id}
    Retrieves full connector configuration, protocol, timeout, and health metadata.
    """
    result = await db.execute(select(Connector).where(Connector.id == connector_id))
    connector = result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return await _enrich_connector_read(connector, db)


@router.post("", response_model=ConnectorRead, status_code=201, include_in_schema=False)
@router.post("/", response_model=ConnectorRead, status_code=201)
async def create_connector(
    body: ConnectorCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    connector = Connector(**body.model_dump())
    db.add(connector)
    await db.commit()
    await db.refresh(connector)
    return await _enrich_connector_read(connector, db)


@router.post("/{connector_id}/health-check", response_model=ConnectorHealthRead)
@router.post("/{connector_id}/ping", response_model=ConnectorHealthRead, include_in_schema=False)
async def execute_health_check(
    connector_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_officer),
):
    """
    POST /api/connectors/{id}/health-check
    Triggers a live health probe through the appropriate connector adapter.
    Updates connector status and persists health log.
    """
    result = await db.execute(select(Connector).where(Connector.id == connector_id))
    connector = result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")

    adapter = ConnectorFactory.get_connector(connector)
    health_resp = await adapter.health_check()

    if health_resp.success:
        new_status = ConnectorStatus.ACTIVE
    elif health_resp.status_code and health_resp.status_code < 500:
        new_status = ConnectorStatus.DEGRADED
    else:
        new_status = ConnectorStatus.ERROR

    health_record = ConnectorHealth(
        connector_id=connector_id,
        status=new_status,
        latency_ms=health_resp.latency_ms or 0,
        error_message=health_resp.error,
        checked_at=datetime.now(timezone.utc),
    )
    connector.status = new_status
    db.add(health_record)
    await db.commit()
    await db.refresh(health_record)
    return health_record


@router.get("/{connector_id}/health", response_model=List[ConnectorHealthRead])
async def connector_health_history(
    connector_id: UUID,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ConnectorHealth)
        .where(ConnectorHealth.connector_id == connector_id)
        .order_by(desc(ConnectorHealth.checked_at))
        .limit(limit)
    )
    return result.scalars().all()
