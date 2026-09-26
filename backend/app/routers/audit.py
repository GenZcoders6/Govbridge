"""
GovBridge Immutable Audit Router
SIH26129 Cryptographic Audit Trail & Governance Transparency

Exposes:
- GET /api/audit (filtered by application, actor, department, action, date, result)
- GET /api/audit/{id} (includes SHA-256 integrity verification)
"""
from typing import List, Optional, Any, Dict
from uuid import UUID
from datetime import datetime, date, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.models import AuditLog, User, UserRole
from app.schemas.schemas import AuditLogRead
from app.security.rbac import get_current_user, require_roles
from app.services.audit_service import AuditService

router = APIRouter()

# Auditors, Integration Admins, and Department Officers can inspect audit trails
require_audit_reader = require_roles(UserRole.AUDITOR, UserRole.INTEGRATION_ADMIN, UserRole.DEPARTMENT_OFFICER)


def format_audit_log(log: AuditLog) -> Dict[str, Any]:
    """Formats an AuditLog model into an API response dict."""
    return {
        "id": log.id,
        "event_id": log.event_id or log.id,
        "timestamp": log.created_at,
        "actor": log.actor or (log.user.email if log.user else "system"),
        "role": log.role or (log.user.role.value if log.user else "SYSTEM"),
        "application": str(log.application_id) if log.application_id else None,
        "application_id": log.application_id,
        "action": log.action,
        "source": log.source,
        "target": log.target,
        "purpose": log.purpose,
        "consent_id": log.consent_id,
        "result": log.result or log.status or "ALLOWED",
        "integrity_hash": log.integrity_hash,
        "department_id": log.department_id,
        "status": log.status or "SUCCESS",
        "details": log.details,
        "created_at": log.created_at,
    }


@router.get("", response_model=List[AuditLogRead], include_in_schema=False)
@router.get("/", response_model=List[AuditLogRead])
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    application: Optional[str] = Query(None, description="Filter by application ID or reference"),
    application_id: Optional[str] = Query(None, description="Filter by application UUID or reference"),
    actor: Optional[str] = Query(None, description="Filter by actor email or identifier"),
    department: Optional[str] = Query(None, description="Filter by department ID or code"),
    department_id: Optional[UUID] = Query(None, description="Filter by department UUID"),
    action: Optional[str] = Query(None, description="Filter by action name"),
    result: Optional[str] = Query(None, description="Filter by result (ALLOWED, DENIED, SUCCESS, FAILURE)"),
    date_val: Optional[date] = Query(None, alias="date", description="Filter by specific date (YYYY-MM-DD)"),
    date_from: Optional[datetime] = Query(None, description="Filter from timestamp"),
    date_to: Optional[datetime] = Query(None, description="Filter to timestamp"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_audit_reader),
):
    """
    GET /api/audit
    Retrieves filtered immutable audit log entries.
    Supported filters:
    - application / application_id
    - actor
    - department / department_id
    - action
    - date / date_from / date_to
    - result (ALLOWED, DENIED, SUCCESS, FAILURE)
    """
    q = select(AuditLog).order_by(desc(AuditLog.created_at))

    # Application filter (supports UUID or reference_number string)
    app_identifier = application_id or application
    if app_identifier:
        from app.models.models import Application
        try:
            target_app_uuid = UUID(app_identifier)
            q = q.where(AuditLog.application_id == target_app_uuid)
        except (ValueError, AttributeError):
            app_res = await db.execute(select(Application).where(Application.reference_number == app_identifier))
            matched_app = app_res.scalar_one_or_none()
            if matched_app:
                q = q.where(AuditLog.application_id == matched_app.id)

    # Actor filter
    if actor:
        q = q.where(AuditLog.actor.ilike(f"%{actor}%"))

    # Department filter
    target_dept_id = department_id
    if not target_dept_id and department:
        try:
            target_dept_id = UUID(department)
        except ValueError:
            pass
    if target_dept_id:
        q = q.where(AuditLog.department_id == target_dept_id)

    # Action filter
    if action:
        q = q.where(AuditLog.action.ilike(f"%{action}%"))

    # Result filter
    if result:
        q = q.where(AuditLog.result.ilike(result) | AuditLog.status.ilike(result))

    # Date filters
    if date_val:
        start_dt = datetime.combine(date_val, datetime.min.time())
        end_dt = datetime.combine(date_val, datetime.max.time())
        q = q.where(AuditLog.created_at >= start_dt, AuditLog.created_at <= end_dt)
    if date_from:
        q = q.where(AuditLog.created_at >= date_from)
    if date_to:
        q = q.where(AuditLog.created_at <= date_to)

    q = q.offset(skip).limit(limit)
    res = await db.execute(q)
    logs = res.scalars().all()

    return [format_audit_log(entry) for entry in logs]


@router.get("/{log_id}")
async def get_audit_log(
    log_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_audit_reader),
):
    """
    GET /api/audit/{id}
    Retrieves a single audit log with cryptographic SHA-256 integrity verification.
    """
    result = await db.execute(
        select(AuditLog).where((AuditLog.id == log_id) | (AuditLog.event_id == log_id))
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log entry not found")

    is_valid = AuditService.verify_record_integrity(log)
    response_data = format_audit_log(log)
    response_data["integrity_verified"] = is_valid
    response_data["integrity_algorithm"] = "SHA-256"

    return response_data


@router.get("/{log_id}/verify")
async def verify_audit_log(
    log_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_audit_reader),
):
    """
    GET /api/audit/{id}/verify
    Explicit SHA-256 integrity verification probe for an audit record.
    """
    result = await db.execute(
        select(AuditLog).where((AuditLog.id == log_id) | (AuditLog.event_id == log_id))
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log entry not found")

    is_valid = AuditService.verify_record_integrity(log)
    calc_hash = AuditService.calculate_record_hash(log)
    stored_hash = getattr(log, "integrity_hash", None) or calc_hash
    return {
        "id": str(log.id),
        "verified": is_valid,
        "algorithm": "SHA-256",
        "stored_hash": stored_hash,
        "calculated_hash": calc_hash,
    }

