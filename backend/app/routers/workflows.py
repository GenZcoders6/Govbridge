"""
Workflows Router — Workflow Orchestration, Retries, and Step Progression
SIH26129 Cross-Department Workflow Engine
"""
import random
import string
from typing import List, Optional, Any, Dict
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models import Workflow, WorkflowStep, Application, ApplicationStep, ApplicationStatus, SystemException, User
from app.schemas.schemas import WorkflowRead
from app.security import get_current_user, require_officer
from app.services.workflow_engine import WorkflowEngine, WORKFLOW_STEPS_DEFINITION

router = APIRouter()


def _generate_ref() -> str:
    return "GVB-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


class WorkflowStartRequest(BaseModel):
    application_id: Optional[UUID] = None
    citizen_uid: str = "DEMO001"
    simulate_failure_connector: Optional[str] = None
    max_retries: int = 3
    form_data: Optional[Dict[str, Any]] = None


class ManualReviewRequest(BaseModel):
    application_id: Optional[UUID] = None
    step_name: Optional[str] = "Department Review"
    action: str = "APPROVE"  # APPROVE, REJECT
    notes: Optional[str] = None


class CompleteStepRequest(BaseModel):
    application_id: Optional[UUID] = None
    step_name: Optional[str] = None
    step_order: Optional[int] = None
    result_data: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None


class TimelineStep(BaseModel):
    step_order: int
    name: str
    status: str
    icon: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    connector: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)


class WorkflowTimelineResponse(BaseModel):
    application_id: UUID
    reference_number: str
    title: str
    status: str
    current_step: int
    total_steps: int
    timeline: List[TimelineStep]
    timeline_summary: str


def _build_timeline(application: Application, steps: List[ApplicationStep]) -> WorkflowTimelineResponse:
    step_map = {s.step_order: s for s in steps}
    timeline_items: List[TimelineStep] = []
    summary_lines = []

    for order, name, _, connector_code in WORKFLOW_STEPS_DEFINITION:
        step_rec = step_map.get(order)
        if step_rec:
            st = step_rec.status
            started_at = step_rec.started_at
            completed_at = step_rec.completed_at
            details = step_rec.result_data or {}
        else:
            st = "PENDING"
            started_at = None
            completed_at = None
            details = {}

        if st == "COMPLETED":
            icon = "✓"
        elif st == "IN_PROGRESS":
            icon = "●"
        elif st in ("FAILED", "ERROR"):
            icon = "✗"
        elif st in ("QUEUED", "MANUAL_REVIEW"):
            icon = "⏸"
        else:
            icon = "○"

        timeline_items.append(
            TimelineStep(
                step_order=order,
                name=name,
                status=st,
                icon=icon,
                started_at=started_at,
                completed_at=completed_at,
                connector=connector_code,
                details=details,
            )
        )
        summary_lines.append(f"{name} {icon}")

    return WorkflowTimelineResponse(
        application_id=application.id,
        reference_number=application.reference_number,
        title=application.title or "Unified Skill & Employment Benefit Application",
        status=application.status.value if hasattr(application.status, "value") else str(application.status),
        current_step=application.current_step,
        total_steps=len(WORKFLOW_STEPS_DEFINITION),
        timeline=timeline_items,
        timeline_summary="\n".join(summary_lines),
    )


@router.get("", response_model=List[WorkflowRead], include_in_schema=False)
@router.get("/", response_model=List[WorkflowRead])
async def list_workflows(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Workflow).where(Workflow.is_active == True))
    return result.scalars().all()


def _parse_uuid(val: str) -> Optional[UUID]:
    try:
        return UUID(val)
    except (ValueError, AttributeError, TypeError):
        return None


async def _resolve_application_by_id_or_ref(identifier: str, db: AsyncSession) -> Optional[Application]:
    uid = _parse_uuid(identifier)
    if uid:
        app_res = await db.execute(select(Application).where(Application.id == uid))
        app = app_res.scalar_one_or_none()
        if app:
            return app
    app_res = await db.execute(select(Application).where(Application.reference_number == identifier))
    return app_res.scalar_one_or_none()


@router.get("/{id}")
async def get_workflow_or_execution(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/workflows/{id}
    Retrieves workflow definition or active execution status if ID matches an Application.
    """
    # 1. Check if ID matches an Application (UUID or reference_number)
    application = await _resolve_application_by_id_or_ref(id, db)
    if application:
        st_res = await db.execute(
            select(ApplicationStep)
            .where(ApplicationStep.application_id == application.id)
            .order_by(ApplicationStep.step_order)
        )
        steps = st_res.scalars().all()
        return _build_timeline(application, list(steps))

    # 2. Check if ID matches a Workflow definition
    uid = _parse_uuid(id)
    if uid:
        wf_res = await db.execute(select(Workflow).where(Workflow.id == uid))
        wf = wf_res.scalar_one_or_none()
        if wf:
            return WorkflowRead.model_validate(wf)

    raise HTTPException(status_code=404, detail="Workflow or application not found")


@router.post("/{id}/start")
async def start_workflow(
    id: str,
    body: Optional[WorkflowStartRequest] = Body(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/workflows/{id}/start
    Starts a cross-department workflow execution.
    `{id}` can be an Application ID or a Workflow ID.
    Supports optional failure simulation via `simulate_failure_connector`.
    """
    req = body or WorkflowStartRequest()
    app_id: Optional[UUID] = None

    # 1. Check if id is an existing Application (UUID or reference_number)
    application = await _resolve_application_by_id_or_ref(id, db)

    if application:
        app_id = application.id
        if req.citizen_uid and not (application.form_data or {}).get("citizen_uid"):
            application.form_data = {**(application.form_data or {}), "citizen_uid": req.citizen_uid}
            await db.commit()
    else:
        # Check if id is a Workflow
        uid = _parse_uuid(id)
        wf = None
        if uid:
            wf_res = await db.execute(select(Workflow).where(Workflow.id == uid))
            wf = wf_res.scalar_one_or_none()
        if not wf:
            # Create default demo workflow if needed
            wf = await WorkflowEngine.get_or_create_demo_workflow(db)

        # Create new application for this workflow run
        new_app = Application(
            reference_number=_generate_ref(),
            citizen_id=current_user.id,
            workflow_id=wf.id,
            department_id=wf.department_id,
            title="Unified Skill & Employment Benefit Application",
            form_data={"citizen_uid": req.citizen_uid, **(req.form_data or {})},
            status=ApplicationStatus.SUBMITTED,
            submitted_at=datetime.now(timezone.utc),
        )
        db.add(new_app)
        await db.flush()
        app_id = new_app.id

    # Execute workflow engine
    result = await WorkflowEngine.run_workflow(
        application_id=app_id,
        db=db,
        simulate_failure_connector=req.simulate_failure_connector,
        max_retries=req.max_retries,
    )
    return result


@router.post("/{id}/retry")
async def retry_workflow(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/workflows/{id}/retry
    Recovers a queued or paused workflow step, resolving exceptions and resuming pipeline.
    """
    # Resolve application
    application = await _resolve_application_by_id_or_ref(id, db)
    if not application:
        # Check if queued task exists in exceptions
        exc_res = await db.execute(
            select(SystemException)
            .where(SystemException.status.in_(["QUEUED", "OPEN", "MANUAL_REVIEW"]))
            .order_by(desc(SystemException.created_at))
        )
        exc = exc_res.scalar_one_or_none()
        if exc and exc.application_id:
            application = await db.get(Application, exc.application_id)

    if not application:
        raise HTTPException(status_code=404, detail="No recoverable application found")

    result = await WorkflowEngine.retry_queued_workflow(application.id, db)
    return result


@router.post("/{id}/manual-review")
async def manual_review_workflow(
    id: str,
    body: Optional[ManualReviewRequest] = Body(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_officer),
):
    """
    POST /api/workflows/{id}/manual-review
    Allows an officer to resolve a manual review requirement or approve a paused workflow.
    """
    req = body or ManualReviewRequest()
    target_ident = str(req.application_id) if req.application_id else id

    application = await _resolve_application_by_id_or_ref(target_ident, db)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Mark any open/queued exceptions as RESOLVED
    await db.execute(
        select(SystemException)
        .where(SystemException.application_id == application.id)
        .where(SystemException.status.in_(["QUEUED", "OPEN", "MANUAL_REVIEW"]))
    )

    # Complete the review step
    steps_res = await db.execute(
        select(ApplicationStep)
        .where(ApplicationStep.application_id == application.id)
        .where(ApplicationStep.name.ilike(f"%{req.step_name or 'Review'}%"))
    )
    step = steps_res.scalar_one_or_none()
    if step:
        step.status = "COMPLETED" if req.action.upper() == "APPROVE" else "REJECTED"
        step.completed_at = datetime.now(timezone.utc)
        step.performed_by_id = current_user.id
        step.result_data = {
            "action": req.action,
            "officer": current_user.full_name,
            "notes": req.notes or "Approved via manual officer review",
        }

    # If approved, advance to completed
    if req.action.upper() == "APPROVE":
        application.status = ApplicationStatus.COMPLETED
        application.resolved_at = datetime.now(timezone.utc)
    else:
        application.status = ApplicationStatus.REJECTED
        application.rejection_reason = req.notes or "Rejected during manual review"

    await db.commit()
    return {
        "status": application.status.value,
        "application_id": str(application.id),
        "action": req.action,
        "step_name": step.name if step else req.step_name,
    }


@router.post("/{id}/complete-step")
async def complete_step(
    id: UUID,
    body: CompleteStepRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_officer),
):
    """
    POST /api/workflows/{id}/complete-step
    Explicitly marks a step as completed and advances the workflow state.
    """
    app_id = body.application_id or id
    app_res = await db.execute(select(Application).where(Application.id == app_id))
    application = app_res.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    q = select(ApplicationStep).where(ApplicationStep.application_id == application.id)
    if body.step_order is not None:
        q = q.where(ApplicationStep.step_order == body.step_order)
    elif body.step_name:
        q = q.where(ApplicationStep.name == body.step_name)
    else:
        q = q.where(ApplicationStep.status != "COMPLETED").order_by(ApplicationStep.step_order)

    res = await db.execute(q)
    step = res.scalar_one_or_none()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    step.status = "COMPLETED"
    step.completed_at = datetime.now(timezone.utc)
    step.performed_by_id = current_user.id
    step.result_data = {**(step.result_data or {}), **body.result_data, "notes": body.notes}

    application.current_step = max(application.current_step, step.step_order)
    await db.commit()

    return {
        "success": True,
        "application_id": str(application.id),
        "completed_step": step.name,
        "step_order": step.step_order,
    }


@router.get("/{id}/timeline", response_model=WorkflowTimelineResponse)
async def get_timeline(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/workflows/{id}/timeline
    Returns complete chronological verification timeline with checkmarks & progress symbols.
    """
    app_res = await db.execute(select(Application).where(Application.id == id))
    application = app_res.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    st_res = await db.execute(
        select(ApplicationStep)
        .where(ApplicationStep.application_id == application.id)
        .order_by(ApplicationStep.step_order)
    )
    steps = st_res.scalars().all()
    return _build_timeline(application, list(steps))
