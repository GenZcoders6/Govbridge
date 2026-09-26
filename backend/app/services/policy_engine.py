"""
GovBridge Access Policy & Consent Enforcement Engine
SIH26129 Governance, DPDP Consent & RBAC Layer

Strictly enforces:
1. User Authentication
2. Role Permission (RBAC)
3. Citizen Consent Validity (ACTIVE, not REVOKED/EXPIRED)
4. Permitted Purpose Verification
5. Permitted Fields & Data Minimization (Strict Prohibitions)
"""
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timezone
from dataclasses import dataclass, field
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.models import (
    AccessPolicy, Consent, ConsentStatus, User, UserRole
)
from app.services.audit_service import AuditService


@dataclass
class PolicyDecision:
    allowed: bool
    reason: str
    status_code: int = 200
    consent_id: Optional[UUID] = None
    policy_name: Optional[str] = None
    allowed_fields: List[str] = field(default_factory=list)
    disallowed_fields: List[str] = field(default_factory=list)


class PolicyEngine:
    """
    Central governance engine that evaluates departmental access policies
    and citizen consent before any protected data exchange or retrieval.
    """

    DEFAULT_POLICIES = [
        {
            "name": "Employment Verification",
            "resource": "employment_registry",
            "action": "data_exchange",
            "roles_allowed": ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"],
            "purpose": "Benefit Eligibility Verification",
            "consent_required": True,
            "allowed_fields": ["employment_status", "organization_category", "job_status", "organization", "joining_date"],
            "disallowed_fields": ["salary", "private contact details", "annual_income", "bank_account", "phone", "email"],
        },
        {
            "name": "Education Verification",
            "resource": "education_registry",
            "action": "data_exchange",
            "roles_allowed": ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"],
            "purpose": "Benefit Eligibility Verification",
            "consent_required": True,
            "allowed_fields": ["degree", "institution", "passing_year", "percentage", "status"],
            "disallowed_fields": ["private contact details", "address", "phone", "email"],
        },
        {
            "name": "Skill Verification",
            "resource": "skill_registry",
            "action": "data_exchange",
            "roles_allowed": ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"],
            "purpose": "Benefit Eligibility Verification",
            "consent_required": True,
            "allowed_fields": ["course_name", "certification_id", "grade", "certified_date", "status"],
            "disallowed_fields": ["private contact details", "phone", "email"],
        },
        {
            "name": "Revenue Verification",
            "resource": "revenue_registry",
            "action": "data_exchange",
            "roles_allowed": ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"],
            "purpose": "Benefit Eligibility Verification",
            "consent_required": True,
            "allowed_fields": ["tax_filing_status", "income_slab", "assessment_year", "annual_income"],
            "disallowed_fields": ["salary", "private contact details", "detailed_ledger", "bank_transactions"],
        },
    ]

    @classmethod
    async def ensure_default_policies(cls, db: AsyncSession):
        """Seeds default access governance policies if not already in database."""
        for pol in cls.DEFAULT_POLICIES:
            res = await db.execute(select(AccessPolicy).where(AccessPolicy.name == pol["name"]))
            existing = res.scalar_one_or_none()
            if not existing:
                record = AccessPolicy(
                    name=pol["name"],
                    description=f"DPDP Governance Policy for {pol['name']}",
                    resource=pol["resource"],
                    action=pol["action"],
                    roles_allowed=pol["roles_allowed"],
                    purpose=pol["purpose"],
                    consent_required=pol["consent_required"],
                    allowed_fields=pol["allowed_fields"],
                    disallowed_fields=pol["disallowed_fields"],
                    is_active=True,
                )
                db.add(record)
        await db.commit()

    @classmethod
    async def evaluate_access(
        cls,
        db: AsyncSession,
        user: Optional[User],
        resource: str,
        action: str = "data_exchange",
        purpose: Optional[str] = "Benefit Eligibility Verification",
        requested_fields: Optional[List[str]] = None,
        application_id: Optional[UUID] = None,
        citizen_id: Optional[UUID] = None,
        source: str = "govbridge_gateway",
        target: Optional[str] = None,
        record_audit: bool = True,
    ) -> PolicyDecision:
        """
        Executes the 5-point governance and consent check:
        1. Authentication Check
        2. Role / RBAC Check
        3. Valid Consent Check (ACTIVE, not REVOKED or EXPIRED)
        4. Purpose Verification Check
        5. Permitted Fields / Data Minimization Check
        """
        target_name = target or resource
        actor_email = user.email if user else "anonymous"
        user_role_str = user.role.value if user and hasattr(user, "role") and user.role else "ANONYMOUS"
        user_id = user.id if user else None

        # Helper to log audit asynchronously
        async def _audit(result_str: str, reason_str: str, consent_uuid: Optional[UUID] = None):
            if record_audit:
                await AuditService.log_operation(
                    db=db,
                    actor=actor_email,
                    role=user_role_str,
                    action=f"POLICY_EVALUATION:{action.upper()}",
                    result=result_str,
                    application_id=application_id,
                    source=source,
                    target=target_name,
                    purpose=purpose or "General Operation",
                    consent_id=consent_uuid,
                    user_id=user_id,
                    details=reason_str,
                    commit=True,
                )

        # -------------------------------------------------------------
        # CHECK 1: Is the user authenticated?
        # -------------------------------------------------------------
        if not user or not user_id:
            msg = "Authentication required: User is not authenticated"
            await _audit("DENIED", msg)
            return PolicyDecision(allowed=False, reason=msg, status_code=401)

        # Find matching policy
        q = select(AccessPolicy).where(
            (AccessPolicy.resource == resource) | (AccessPolicy.name.ilike(f"%{resource}%"))
        )
        res = await db.execute(q)
        policy = res.scalar_one_or_none()

        # If policy not in DB, fallback to matching default policy
        if not policy:
            matched_default = next(
                (p for p in cls.DEFAULT_POLICIES if p["resource"] == resource or resource in p["name"].lower()),
                None,
            )
            if matched_default:
                policy = AccessPolicy(
                    name=matched_default["name"],
                    resource=matched_default["resource"],
                    action=matched_default["action"],
                    roles_allowed=matched_default["roles_allowed"],
                    purpose=matched_default["purpose"],
                    consent_required=matched_default["consent_required"],
                    allowed_fields=matched_default["allowed_fields"],
                    disallowed_fields=matched_default["disallowed_fields"],
                    is_active=True,
                )

        # -------------------------------------------------------------
        # CHECK 2: Does their role permit access?
        # -------------------------------------------------------------
        if policy and policy.roles_allowed:
            # INTEGRATION_ADMIN is superuser
            if user_role_str not in policy.roles_allowed and user_role_str != "INTEGRATION_ADMIN":
                msg = f"Access denied: Role '{user_role_str}' does not permit access to policy '{policy.name}'"
                await _audit("DENIED", msg)
                return PolicyDecision(allowed=False, reason=msg, status_code=403, policy_name=policy.name)

        # -------------------------------------------------------------
        # CHECK 3: Is valid consent present?
        # -------------------------------------------------------------
        consent_required = policy.consent_required if policy else True
        consent_record: Optional[Consent] = None

        if consent_required:
            cq = select(Consent)
            if application_id:
                cq = cq.where(Consent.application_id == application_id)
            elif citizen_id:
                cq = cq.where(Consent.citizen_id == citizen_id)
            else:
                cq = cq.where(Consent.citizen_id == user_id)

            cq = cq.order_by(desc(Consent.created_at))
            c_res = await db.execute(cq)
            consent_record = c_res.scalars().first()

            if not consent_record:
                msg = "Access denied: Valid citizen consent is required for this operation but none was found"
                await _audit("DENIED", msg)
                return PolicyDecision(allowed=False, reason=msg, status_code=403, policy_name=policy.name if policy else None)

            # Check Revocation
            status_val = consent_record.status.value if hasattr(consent_record.status, "value") else str(consent_record.status)
            if status_val == "REVOKED":
                msg = f"Access denied: Citizen consent has been revoked (Reason: {consent_record.revocation_reason or 'Citizen revoked consent'})"
                await _audit("DENIED", msg, consent_record.id)
                return PolicyDecision(allowed=False, reason=msg, status_code=403, consent_id=consent_record.id)

            # Check Expiration
            now_utc = datetime.now(timezone.utc)
            if status_val == "EXPIRED" or (consent_record.expires_at and consent_record.expires_at.replace(tzinfo=timezone.utc if consent_record.expires_at.tzinfo is None else None) < now_utc):
                msg = "Access denied: Citizen consent has expired"
                await _audit("DENIED", msg, consent_record.id)
                return PolicyDecision(allowed=False, reason=msg, status_code=403, consent_id=consent_record.id)

            # Check Active/Granted
            if status_val not in ("ACTIVE", "GRANTED"):
                msg = f"Access denied: Citizen consent is not active (current status: {status_val})"
                await _audit("DENIED", msg, consent_record.id)
                return PolicyDecision(allowed=False, reason=msg, status_code=403, consent_id=consent_record.id)

        # -------------------------------------------------------------
        # CHECK 4: Is the requested purpose allowed?
        # -------------------------------------------------------------
        if policy and policy.purpose and purpose:
            req_purp = purpose.strip().lower()
            pol_purp = policy.purpose.strip().lower()
            # Allow substring match or exact match
            if req_purp not in pol_purp and pol_purp not in req_purp:
                msg = f"Access denied: Purpose '{purpose}' is not permitted by policy '{policy.name}' (Allowed: '{policy.purpose}')"
                await _audit("DENIED", msg, consent_record.id if consent_record else None)
                return PolicyDecision(allowed=False, reason=msg, status_code=403, consent_id=consent_record.id if consent_record else None)

        # -------------------------------------------------------------
        # CHECK 5: Are the requested fields permitted?
        # -------------------------------------------------------------
        disallowed_set = set(f.strip().lower() for f in (policy.disallowed_fields if policy and policy.disallowed_fields else []))
        # Always disallow private sensitive fields by default
        disallowed_set.update(["salary", "private contact details", "personal_phone", "personal_email"])

        if requested_fields:
            for field_name in requested_fields:
                f_clean = field_name.strip().lower()
                # Check prohibited fields
                for dis in disallowed_set:
                    if dis in f_clean or f_clean in dis:
                        msg = f"Access denied: Field '{field_name}' is strictly prohibited under privacy policy '{policy.name if policy else 'Default Protection'}'"
                        await _audit("DENIED", msg, consent_record.id if consent_record else None)
                        return PolicyDecision(
                            allowed=False,
                            reason=msg,
                            status_code=403,
                            consent_id=consent_record.id if consent_record else None,
                            disallowed_fields=list(disallowed_set),
                        )

            # Check allowed fields if defined
            if policy and policy.allowed_fields:
                allowed_set = set(f.strip().lower() for f in policy.allowed_fields)
                # If requested fields contain fields not in allowed_fields, check policy strictness
                unrecognized = [f for f in requested_fields if f.strip().lower() not in allowed_set and f.strip().lower() not in ("uid", "id", "citizen_uid")]
                if unrecognized:
                    msg = f"Access denied: Fields {unrecognized} are not permitted by policy '{policy.name}'"
                    await _audit("DENIED", msg, consent_record.id if consent_record else None)
                    return PolicyDecision(allowed=False, reason=msg, status_code=403, consent_id=consent_record.id if consent_record else None)

        # -------------------------------------------------------------
        # ALL 5 CHECKS PASSED: ACCESS GRANTED
        # -------------------------------------------------------------
        success_msg = f"Access granted under policy '{policy.name if policy else 'Default'}'"
        await _audit("ALLOWED", success_msg, consent_record.id if consent_record else None)

        return PolicyDecision(
            allowed=True,
            reason=success_msg,
            status_code=200,
            consent_id=consent_record.id if consent_record else None,
            policy_name=policy.name if policy else "Default",
            allowed_fields=policy.allowed_fields if policy and policy.allowed_fields else [],
            disallowed_fields=list(disallowed_set),
        )
