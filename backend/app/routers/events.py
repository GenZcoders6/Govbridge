"""
Events Router — Event Stream & Audit Ingestion
SIH26129 Interoperability Foundation

Exposes:
- GET /api/events with filtering by application, event type, status, and date
- GET /api/events/{id}
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models import Event, EventSeverity, User
from app.schemas.schemas import EventRead
from app.security import get_current_user

router = APIRouter()


@router.get("", response_model=List[EventRead], include_in_schema=False)
@router.get("/", response_model=List[EventRead])
async def list_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    application: Optional[UUID] = Query(None, description="Filter by Application ID"),
    application_id: Optional[UUID] = Query(None, description="Alias for application filter"),
    event_type: Optional[str] = Query(None, description="Filter by event type (e.g. WORKFLOW_STARTED, IDENTITY_VERIFIED)"),
    status: Optional[bool] = Query(None, description="Filter by is_processed status (true/false)"),
    is_processed: Optional[bool] = Query(None, description="Alias for status"),
    start_date: Optional[datetime] = Query(None, description="Filter events created at or after timestamp"),
    end_date: Optional[datetime] = Query(None, description="Filter events created at or before timestamp"),
    severity: Optional[EventSeverity] = Query(None, description="Filter by event severity"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/events
    Returns event stream with filtering by application, event type, status, and date.
    """
    q = select(Event).order_by(desc(Event.created_at))

    app_id = application or application_id
    if app_id:
        q = q.where(Event.application_id == app_id)
    if event_type:
        q = q.where(Event.event_type == event_type)

    proc_status = status if status is not None else is_processed
    if proc_status is not None:
        q = q.where(Event.is_processed == proc_status)

    if start_date:
        q = q.where(Event.created_at >= start_date)
    if end_date:
        q = q.where(Event.created_at <= end_date)
    if severity:
        q = q.where(Event.severity == severity)

    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{event_id}", response_model=EventRead)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/events/{id}
    Retrieves full event details, payload, and processing timestamp.
    """
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
