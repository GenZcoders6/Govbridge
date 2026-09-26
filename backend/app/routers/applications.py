"""
Applications Router
"""
import uuid
import random
import string
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.core.database import get_db
from app.models import Application, ApplicationStep, ApplicationStatus, Workflow, WorkflowStep, User
from app.schemas.schemas import ApplicationRead, ApplicationCreate, ApplicationStepRead
from app.security import get_current_user, require_officer
from app.services.event_bus import EventBus, EventType
from app.services.audit_service import AuditService

router = APIRouter()


def _generate_ref() -> str:
    return "GVB-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.get("", response_model=List[ApplicationRead], include_in_schema=False)
@router.get("/", response_model=List[ApplicationRead])
async def list_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    status: Optional[ApplicationStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Application)
    # Citizens only see their own
    if current_user.role.value == "CITIZEN":
        q = q.where(Application.citizen_id == current_user.id)
    if status:
        q = q.where(Application.status == status)
    q = q.order_by(desc(Application.created_at)).offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("", response_model=ApplicationRead, status_code=201, include_in_schema=False)
@router.post("/", response_model=ApplicationRead, status_code=201)
async def create_application(
    body: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.value not in ("CITIZEN", "INTEGRATION_ADMIN"):
        raise HTTPException(
            status_code=403,
            detail="Only citizens can submit service applications",
        )

    workflow = None
    if body.workflow_id:
        wf_result = await db.execute(select(Workflow).where(Workflow.id == body.workflow_id))
        workflow = wf_result.scalar_one_or_none()

    if not workflow:
        # Search canonical workflow or matching name
        wf_res = await db.execute(
            select(Workflow).where(
                (Workflow.code == "UNIFIED_SKILL_BENEFIT") |
                (Workflow.code == "UNIFIED_SKILL_EMPLOYMENT_BENEFIT")
            )
        )
        workflow = wf_res.scalars().first()
        if not workflow:
            wf_res = await db.execute(select(Workflow).where(Workflow.is_active == True))
            workflow = wf_res.scalars().first()

    if not workflow:
        from app.services.workflow_engine import WorkflowEngine
        workflow = await WorkflowEngine.get_or_create_demo_workflow(db)

    # Consolidate form data
    form_data = dict(body.form_data or {})
    if body.full_name and "full_name" not in form_data:
        form_data["full_name"] = body.full_name
    if body.mobile and "mobile" not in form_data:
        form_data["mobile"] = body.mobile
    if body.master_citizen_id and "master_citizen_id" not in form_data:
        form_data["master_citizen_id"] = body.master_citizen_id
        form_data["citizen_uid"] = body.master_citizen_id

    title = body.title or f"{body.service or workflow.name} - {form_data.get('full_name', 'Citizen')}"

    app = Application(
        reference_number=_generate_ref(),
        citizen_id=current_user.id,
        workflow_id=workflow.id,
        department_id=workflow.department_id,
        title=title,
        form_data=form_data,
        status=ApplicationStatus.SUBMITTED,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(app)
    await db.flush()

    # Create application steps
    from app.services.workflow_engine import WorkflowEngine
    await WorkflowEngine.initialize_application_steps(app.id, db)

    # Publish Redis Event
    await EventBus.publish(
        EventType.APPLICATION_CREATED,
        {
            "application_id": str(app.id),
            "reference_number": app.reference_number,
            "title": app.title,
            "citizen_uid": form_data.get("citizen_uid") or form_data.get("master_citizen_id"),
        },
        application_id=app.id,
        db=db,
    )

    # Log immutable audit record with SHA-256 hash
    await AuditService.log_operation(
        db=db,
        actor=current_user.email,
        role=current_user.role.value,
        action="APPLICATION_SUBMITTED",
        result="ALLOWED",
        application_id=app.id,
        source="citizen_portal",
        target="govbridge_orchestrator",
        purpose="Unified Benefit Application Creation",
        details=f"Application {app.reference_number} created by citizen for {app.title}",
        commit=False,
    )

    await db.commit()
    await db.refresh(app)
    return app


def _parse_uuid(val: str) -> Optional[UUID]:
    try:
        return UUID(val)
    except (ValueError, AttributeError, TypeError):
        return None


async def _resolve_app(app_id: str, db: AsyncSession) -> Optional[Application]:
    uid = _parse_uuid(app_id)
    if uid:
        res = await db.execute(select(Application).where(Application.id == uid))
        app = res.scalar_one_or_none()
        if app:
            return app
    res = await db.execute(select(Application).where(Application.reference_number == app_id))
    return res.scalar_one_or_none()


@router.get("/{app_id}", response_model=ApplicationRead)
async def get_application(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = await _resolve_app(app_id, db)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if current_user.role.value == "CITIZEN" and app.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return app


@router.get("/{app_id}/steps", response_model=List[ApplicationStepRead])
async def get_application_steps(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = await _resolve_app(app_id, db)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    result = await db.execute(
        select(ApplicationStep)
        .where(ApplicationStep.application_id == app.id)
        .order_by(ApplicationStep.step_order)
    )
    return result.scalars().all()


@router.patch("/{app_id}/status")
async def update_application_status(
    app_id: str,
    new_status: ApplicationStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_officer),
):
    app = await _resolve_app(app_id, db)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = new_status
    if new_status in (ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.COMPLETED):
        app.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Status updated", "status": new_status}


@router.get("/{app_id}/timeline")
async def get_application_timeline(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/applications/{id}/timeline
    Returns the complete workflow verification timeline for an application.
    """
    from app.routers.workflows import _build_timeline
    app = await _resolve_app(app_id, db)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if current_user.role.value == "CITIZEN" and app.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    st_res = await db.execute(
        select(ApplicationStep)
        .where(ApplicationStep.application_id == app.id)
        .order_by(ApplicationStep.step_order)
    )
    steps = st_res.scalars().all()
    return _build_timeline(app, list(steps))


@router.get("/{app_id}/consents")
async def get_application_consents(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/applications/{id}/consents
    Returns all citizen consent records linked to this application.
    """
    from app.models.models import Consent
    from app.routers.consents import format_consent_response

    app = await _resolve_app(app_id, db)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if current_user.role.value == "CITIZEN" and app.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    q = select(Consent).where(Consent.application_id == app.id).order_by(desc(Consent.created_at))
    c_res = await db.execute(q)
    consents = c_res.scalars().all()
    return [format_consent_response(c) for c in consents]


