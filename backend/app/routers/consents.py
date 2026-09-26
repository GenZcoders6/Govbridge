"""
GovBridge Consent Router
SIH26129 DPDP Consent & Governance Management

Implements:
- POST /api/consent (or /api/consents)
- GET /api/consent/{id}
- GET /api/applications/{id}/consents
- POST /api/consent/{id}/revoke
With statuses: ACTIVE, REVOKED, EXPIRED
"""
from typing import List, Optional, Any, Dict
from uuid import UUID
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.models import Consent, ConsentStatus, User, UserRole, Application
from app.schemas.schemas import ConsentRead, ConsentCreate
from app.security import get_current_user
from app.services.audit_service import AuditService
from app.services.event_bus import EventBus, EventType

router = APIRouter()


def format_consent_response(consent: Consent) -> Dict[str, Any]:
    """Formats a Consent model with proper DPDP fields and computed expiration."""
    now_utc = datetime.now(timezone.utc)
    raw_status = consent.status.value if hasattr(consent.status, "value") else str(consent.status)

    # Compute expiration dynamically
    if raw_status != "REVOKED" and consent.expires_at:
        exp_time = consent.expires_at.replace(tzinfo=timezone.utc if consent.expires_at.tzinfo is None else None)
        if exp_time < now_utc:
            status_val = "EXPIRED"
        elif raw_status in ("GRANTED", "ACTIVE"):
            status_val = "ACTIVE"
        else:
            status_val = raw_status
    elif raw_status in ("GRANTED", "ACTIVE"):
        status_val = "ACTIVE"
    else:
        status_val = raw_status

    fields = consent.requested_data or consent.data_categories or []
    if isinstance(fields, str):
        fields = [f.strip() for f in fields.split(",") if f.strip()]

    return {
        "id": consent.id,
        "consent_id": consent.id,
        "citizen_id": consent.citizen_id,
        "application_id": consent.application_id,
        "purpose": consent.purpose,
        "requested_data": fields,
        "data_categories": fields,
        "status": status_val,
        "granted_at": consent.granted_at,
        "expires_at": consent.expires_at,
        "revoked_at": consent.revoked_at,
        "created_at": consent.created_at,
    }


@router.get("", response_model=List[ConsentRead], include_in_schema=False)
@router.get("/", response_model=List[ConsentRead])
async def list_consents(
    application_id: Optional[UUID] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists citizen consents with optional filtering."""
    q = select(Consent).order_by(desc(Consent.created_at))
    if current_user.role.value == "CITIZEN":
        q = q.where(Consent.citizen_id == current_user.id)
    if application_id:
        q = q.where(Consent.application_id == application_id)
    if status_filter:
        q = q.where(Consent.status == status_filter.upper())

    result = await db.execute(q)
    consents = result.scalars().all()
    return [format_consent_response(c) for c in consents]


@router.post("", response_model=ConsentRead, status_code=201, include_in_schema=False)
@router.post("/", response_model=ConsentRead, status_code=201)
async def create_consent(
    body: ConsentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/consent
    Creates and activates citizen consent under DPDP provisions.
    """
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=body.expires_in_days or 30)

    # Use explicit citizen_id or default to authenticated user
    target_citizen_id = body.citizen_id or current_user.id
    req_fields = body.requested_data or body.data_categories or ["employment_status", "organization_category", "qualification"]

    consent = Consent(
        citizen_id=target_citizen_id,
        application_id=body.application_id,
        purpose=body.purpose or "Benefit Eligibility Verification",
        requested_data=req_fields,
        data_categories=req_fields,
        requesting_department_id=body.requesting_department_id,
        status=ConsentStatus.ACTIVE,
        granted_at=now,
        expires_at=expires_at,
    )
    db.add(consent)
    await db.commit()
    await db.refresh(consent)

    # Log immutable audit record
    await AuditService.log_operation(
        db=db,
        actor=current_user.email,
        role=current_user.role.value,
        action="CONSENT_GRANTED",
        result="ALLOWED",
        application_id=body.application_id,
        source="citizen_consent_portal",
        target="consent_ledger",
        purpose=consent.purpose,
        consent_id=consent.id,
        user_id=current_user.id,
        details=f"Citizen granted consent for purpose: '{consent.purpose}' on {req_fields}",
        commit=True,
    )

    # Publish Redis Event
    await EventBus.publish(
        EventType.CONSENT_GRANTED,
        {
            "consent_id": str(consent.id),
            "citizen_id": str(target_citizen_id),
            "application_id": str(body.application_id) if body.application_id else None,
            "purpose": consent.purpose,
            "data_categories": req_fields,
        },
        application_id=body.application_id,
        db=db,
    )

    return format_consent_response(consent)


@router.get("/{consent_id}", response_model=ConsentRead)
async def get_consent_by_id(
    consent_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/consent/{id}
    Retrieves consent record with status (ACTIVE, REVOKED, EXPIRED).
    """
    result = await db.execute(select(Consent).where(Consent.id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    # Access control: Citizens can only inspect their own consent
    if current_user.role.value == "CITIZEN" and consent.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot view another citizen's consent")

    return format_consent_response(consent)


@router.post("/{consent_id}/revoke", response_model=ConsentRead)
async def revoke_consent(
    consent_id: UUID,
    reason: str = "Citizen exercised DPDP right to withdraw consent",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/consent/{id}/revoke
    Revokes previously granted citizen consent immediately.
    """
    result = await db.execute(select(Consent).where(Consent.id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    if current_user.role.value == "CITIZEN" and consent.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot revoke consent belonging to another citizen")

    now = datetime.now(timezone.utc)
    consent.status = ConsentStatus.REVOKED
    consent.revoked_at = now
    consent.revocation_reason = reason
    await db.commit()
    await db.refresh(consent)

    # Log revocation in audit trail
    await AuditService.log_operation(
        db=db,
        actor=current_user.email,
        role=current_user.role.value,
        action="CONSENT_REVOKED",
        result="ALLOWED",
        application_id=consent.application_id,
        source="citizen_consent_portal",
        target="consent_ledger",
        purpose=consent.purpose,
        consent_id=consent.id,
        user_id=current_user.id,
        details=f"Consent revoked by {current_user.email}. Reason: {reason}",
        commit=True,
    )

    # Publish Redis Event
    await EventBus.publish(
        "CONSENT_REVOKED",
        {
            "consent_id": str(consent.id),
            "citizen_id": str(consent.citizen_id),
            "application_id": str(consent.application_id) if consent.application_id else None,
            "reason": reason,
        },
        application_id=consent.application_id,
        db=db,
    )

    return format_consent_response(consent)


@router.get("/applications/{application_id}/consents", response_model=List[ConsentRead])
async def get_application_consents(
    application_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/applications/{id}/consents
    Returns all consents associated with a specific benefit application.
    """
    q = (
        select(Consent)
        .where(Consent.application_id == application_id)
        .order_by(desc(Consent.created_at))
    )
    res = await db.execute(q)
    consents = res.scalars().all()
    return [format_consent_response(c) for c in consents]
