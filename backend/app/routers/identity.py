"""
GovBridge Identity Router — Master Citizen Identity & Federated Registry Mappings
SIH26129 Master Identity & Cross-Department Resolution Layer

Maps Master Citizen ID (e.g. MAHA-CIT-10284) to:
- Education ID
- Employment ID
- Skill ID
- Revenue ID
- Welfare ID
Stored in PostgreSQL/SQLite with DPDP privacy masking.
"""
from typing import Dict, Any, List, Optional, Tuple
from uuid import UUID, uuid4
from datetime import datetime, timezone
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import settings
from app.models.models import (
    Citizen, MasterIdentity, IdentityMapping, User, UserRole
)
from app.schemas.schemas import MasterIdentityRead, MasterIdentityMappingRead
from app.security import get_current_user
from app.security.privacy import mask_phone, mask_citizen_id, mask_email
from app.services.audit_service import AuditService

router = APIRouter()


async def _get_or_seed_master_identity(master_id: str, db: AsyncSession) -> Tuple[MasterIdentity, Citizen]:
    """Retrieves existing MasterIdentity or provisions standard demonstration citizen."""
    q = (
        select(MasterIdentity)
        .options(selectinload(MasterIdentity.citizen), selectinload(MasterIdentity.identity_mappings))
        .where(
            (MasterIdentity.master_uid == master_id)
            | (MasterIdentity.id == (UUID(master_id) if len(master_id) == 36 else None))
        )
    )
    res = await db.execute(q)
    master = res.scalar_one_or_none()

    if not master:
        # Create standard synthetic demonstration citizen & mappings
        citizen = Citizen(
            full_name="Sunil Patil",
            date_of_birth="1998-05-14",
            gender="MALE",
            state="Maharashtra",
            district="Pune",
            pincode="411001",
            is_verified=True,
        )
        db.add(citizen)
        await db.flush()

        master = MasterIdentity(
            citizen_id=citizen.id,
            master_uid=master_id,
            confidence_score=1.0,
            is_verified=True,
            verified_at=datetime.now(timezone.utc),
        )
        db.add(master)
        await db.flush()

        # Seed the 5 department mappings requested in specification
        department_mappings = [
            ("education", "EDU-MH-2021-8842", "education_degree_v1"),
            ("employment", "EMP-49382", "employment_status_v1"),
            ("skill", "SKILL-CERT-8841", "msde_cert_v1"),
            ("revenue", "PAN-ABCDE1234F", "revenue_pan_v1"),
            ("welfare", "BOCW-2024-9912", "welfare_direct_v1"),
        ]

        for system, sid, schema in department_mappings:
            mapping = IdentityMapping(
                master_identity_id=master.id,
                source_system=system,
                source_id=sid,
                source_schema=schema,
                is_active=True,
                last_synced=datetime.now(timezone.utc),
            )
            db.add(mapping)

        await db.commit()
        await db.refresh(master)
        await db.refresh(citizen)

    return master, master.citizen


@router.get("/{master_id}", response_model=MasterIdentityRead)
async def get_master_identity(
    master_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/identity/{master_id}
    Retrieves Master Citizen identity profile with DPDP privacy masking:
    Phone: +91 ******284
    Citizen ID: MAHA-****-10284
    """
    master, citizen = await _get_or_seed_master_identity(master_id, db)

    # Re-query mappings count
    mq = select(IdentityMapping).where(IdentityMapping.master_identity_id == master.id)
    m_res = await db.execute(mq)
    mappings_count = len(m_res.scalars().all())

    # Audit logging with SHA-256 integrity hash
    await AuditService.log_operation(
        db=db,
        actor=current_user.email,
        role=current_user.role.value,
        action="IDENTITY_LOOKUP",
        result="ALLOWED",
        source="citizen_portal",
        target="master_identity_registry",
        purpose="Identity Verification",
        details=f"Master identity {master.master_uid} accessed with privacy masking",
        commit=True,
    )

    return MasterIdentityRead(
        id=master.id,
        master_citizen_id=master.master_uid,
        masked_id=mask_citizen_id(master.master_uid),
        full_name=citizen.full_name if citizen else "Sunil Patil",
        gender=citizen.gender if citizen else "MALE",
        state=citizen.state if citizen else "Maharashtra",
        district=citizen.district if citizen else "Pune",
        masked_phone=mask_phone("+919876543284"),
        masked_email=mask_email("sunil.patil@example.gov.in"),
        is_verified=master.is_verified,
        confidence_score=master.confidence_score,
        created_at=master.created_at,
        mappings_count=mappings_count,
    )


@router.get("/{master_id}/mappings", response_model=List[MasterIdentityMappingRead])
async def get_identity_mappings(
    master_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/identity/{master_id}/mappings
    Returns federated cross-departmental identity mappings for:
    - Education ID
    - Employment ID
    - Skill ID
    - Revenue ID
    - Welfare ID
    """
    master, _ = await _get_or_seed_master_identity(master_id, db)

    q = (
        select(IdentityMapping)
        .where(IdentityMapping.master_identity_id == master.id)
        .order_by(IdentityMapping.source_system)
    )
    res = await db.execute(q)
    mappings = res.scalars().all()

    # Audit operation
    await AuditService.log_operation(
        db=db,
        actor=current_user.email,
        role=current_user.role.value,
        action="IDENTITY_MAPPINGS_RESOLVED",
        result="ALLOWED",
        source="govbridge_identity_federation",
        target="department_registries",
        purpose="Cross-Department Data Resolution",
        details=f"Resolved {len(mappings)} departmental identifiers for {master.master_uid}",
        commit=True,
    )

    return mappings


@router.get("/lookup/{citizen_uid}")
async def lookup_identity(
    citizen_uid: str,
    _: User = Depends(get_current_user),
):
    """Federate identity across mock registries (backward compatibility)"""
    results = {}
    registries = {
        "identity": settings.MOCK_IDENTITY_URL,
        "education": settings.MOCK_EDUCATION_URL,
        "employment": settings.MOCK_EMPLOYMENT_URL,
        "welfare": settings.MOCK_WELFARE_URL,
    }
    async with httpx.AsyncClient(timeout=10) as client:
        for name, url in registries.items():
            try:
                resp = await client.get(f"{url}/citizens/{citizen_uid}")
                if resp.status_code == 200:
                    results[name] = resp.json()
                else:
                    results[name] = {"status": "not_found"}
            except Exception as e:
                results[name] = {"status": "error", "detail": str(e)}

    return {
        "citizen_uid": citizen_uid,
        "federation_results": results,
        "note": "MOCK/DEMO — No real citizen data",
    }
