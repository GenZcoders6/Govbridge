from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models import SystemException, User
from app.schemas.schemas import SystemExceptionRead
from app.security import get_current_user, require_officer
from app.services.workflow_engine import WorkflowEngine

router = APIRouter()


@router.get("", response_model=List[SystemExceptionRead], include_in_schema=False)
@router.get("/", response_model=List[SystemExceptionRead])
async def list_exceptions(
    status: Optional[str] = Query(None, description="Filter by status (OPEN, RETRYING, QUEUED, MANUAL_REVIEW, RESOLVED)"),
    application_id: Optional[UUID] = Query(None, description="Filter by application ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/exceptions
    Retrieves interoperability exceptions, failed connector retries, and queued manual review items.
    """
    q = select(SystemException).order_by(desc(SystemException.created_at))
    if status:
        q = q.where(SystemException.status == status.upper())
    if application_id:
        q = q.where(SystemException.application_id == application_id)
    q = q.offset(skip).limit(limit)
    res = await db.execute(q)
    items = res.scalars().all()

    # Populate exception_id property
    results = []
    for item in items:
        read_obj = SystemExceptionRead.model_validate(item)
        read_obj.exception_id = item.id
        results.append(read_obj)
    return results


@router.get("/{exception_id}", response_model=SystemExceptionRead)
async def get_exception(
    exception_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/exceptions/{id}
    Retrieves full stack trace, payload, retry count, and resolution notes for a specific exception.
    """
    res = await db.execute(select(SystemException).where(SystemException.id == exception_id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Exception not found")
    read_obj = SystemExceptionRead.model_validate(item)
    read_obj.exception_id = item.id
    return read_obj


@router.post("/{exception_id}/retry")
async def retry_exception(
    exception_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_officer),
):
    """
    POST /api/exceptions/{id}/retry
    Retries a failed operation and resumes workflow orchestration.
    """
    res = await db.execute(select(SystemException).where(SystemException.id == exception_id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Exception not found")

    item.status = "RESOLVED"
    item.resolved_at = datetime.now(timezone.utc)
    item.resolution_notes = "Retried and resolved via Exceptions Console"
    await db.commit()

    if item.application_id:
        try:
            await WorkflowEngine.retry_queued_workflow(application_id=item.application_id, db=db)
        except Exception:
            pass

    return {
        "status": "RESOLVED",
        "message": f"Exception {exception_id} retried and marked as RESOLVED.",
        "exception_id": str(exception_id),
    }


@router.post("/{exception_id}/manual-review")
async def review_exception(
    exception_id: UUID,
    body: Optional[Dict[str, Any]] = Body(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_officer),
):
    """
    POST /api/exceptions/{id}/manual-review
    Submits manual human-in-the-loop review decision for an exception.
    """
    res = await db.execute(select(SystemException).where(SystemException.id == exception_id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Exception not found")

    action = (body or {}).get("action", "APPROVE")
    notes = (body or {}).get("notes", "Manually reviewed and approved via Exceptions Console")

    item.status = "RESOLVED"
    item.resolved_at = datetime.now(timezone.utc)
    item.resolution_notes = f"Manual Review: {action}. Notes: {notes}"
    await db.commit()

    if item.application_id:
        try:
            await WorkflowEngine.manual_review_step(
                application_id=item.application_id,
                action=action,
                notes=notes,
                db=db,
            )
        except Exception:
            pass

    return {
        "status": "RESOLVED",
        "message": f"Exception {exception_id} review decision '{action}' recorded.",
        "exception_id": str(exception_id),
    }
