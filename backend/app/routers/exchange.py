"""
Data Exchange Router — Interoperability Gateway & Pipeline
SIH26129 Interoperability Foundation & Governance Enforcement

Executes live data exchanges between GovBridge and external government systems:
Government System -> Connector / Adapter -> API Gateway -> Policy/Consent Enforcement -> Validation -> Transformation -> Common Data Model
"""
from typing import List, Optional, Any, Dict
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.models import Connector, DataExchange, User, UserRole
from app.schemas.schemas import DataExchangeRequest, DataExchangeRead
from app.security import get_current_user
from app.security.rbac import require_officer
from app.integrations.factory import ConnectorFactory
from app.integrations.validation import SchemaValidator
from app.integrations.transformer import DataTransformer
from app.integrations.base import ValidationResult
from app.schemas.cdm import CanonicalEnvelope
from app.services.policy_engine import PolicyEngine, PolicyDecision
from app.security.privacy import mask_sensitive_payload

router = APIRouter()


class ExchangeExecutionResponse(BaseModel):
    id: UUID
    status: str
    latency_ms: Optional[int] = None
    source_connector: str
    source_protocol: str
    raw_data: Any = Field(description="Untouched source system response")
    validation: Optional[ValidationResult] = Field(None, description="Structured validation outcome")
    canonical_envelope: Optional[CanonicalEnvelope] = Field(None, description="Transformed Common Data Model")
    error_message: Optional[str] = None
    exchanged_at: datetime


class PolicyCheckRequest(BaseModel):
    resource: str = "employment_registry"
    action: str = "data_exchange"
    purpose: str = "Benefit Eligibility Verification"
    requested_fields: Optional[List[str]] = None
    application_id: Optional[UUID] = None


@router.post("/policy-check")
async def check_exchange_policy(
    req: PolicyCheckRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/exchange/policy-check
    Evaluates the 5-point governance & consent checks:
    1. Authenticated?
    2. Role permits access?
    3. Valid consent present? (ACTIVE, not REVOKED/EXPIRED)
    4. Requested purpose allowed?
    5. Requested fields permitted?
    """
    decision = await PolicyEngine.evaluate_access(
        db=db,
        user=current_user,
        resource=req.resource,
        action=req.action,
        purpose=req.purpose,
        requested_fields=req.requested_fields,
        application_id=req.application_id,
        source="govbridge_policy_validator",
        target=req.resource,
        record_audit=True,
    )
    if not decision.allowed:
        raise HTTPException(
            status_code=decision.status_code,
            detail=decision.reason,
        )
    return {
        "allowed": decision.allowed,
        "reason": decision.reason,
        "policy_name": decision.policy_name,
        "consent_id": decision.consent_id,
        "allowed_fields": decision.allowed_fields,
    }


@router.post("", response_model=ExchangeExecutionResponse, status_code=200, include_in_schema=False)
@router.post("/", response_model=ExchangeExecutionResponse, status_code=200)
async def execute_data_exchange(
    req: DataExchangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/exchange
    Initiates live data exchange with an external government system:
    1. Resolves connector
    2. Enforces 5-point Policy & Consent Governance
    3. Calls adapter (fetch/send)
    4. Validates incoming payload
    5. Transforms into Common Data Model (CDM)
    6. Persists exchange record and audit log in database
    """
    # 1. Resolve connector
    query = select(Connector)
    if req.source_connector_id:
        query = query.where(Connector.id == req.source_connector_id)
    elif req.source_connector_code:
        query = query.where(Connector.code == req.source_connector_code)
    else:
        raise HTTPException(status_code=400, detail="Must supply source_connector_id or source_connector_code")

    res = await db.execute(query)
    connector = res.scalar_one_or_none()
    if not connector:
        raise HTTPException(
            status_code=404,
            detail=f"Source connector '{req.source_connector_id or req.source_connector_code}' not found",
        )

    # 2. Enforce 5-Point Governance (RBAC, Consent, Purpose, Prohibited Fields)
    policy_decision: Optional[PolicyDecision] = None
    if req.enforce_policy or req.application_id or req.requested_fields:
        conn_lower = (connector.name + " " + connector.code).lower()
        if "employ" in conn_lower or "mole" in conn_lower:
            res_key = "employment_registry"
        elif "educat" in conn_lower or "moe" in conn_lower:
            res_key = "education_registry"
        elif "skill" in conn_lower or "msde" in conn_lower:
            res_key = "skill_registry"
        elif "revenue" in conn_lower or "dor" in conn_lower:
            res_key = "revenue_registry"
        else:
            res_key = connector.code.lower()

        policy_decision = await PolicyEngine.evaluate_access(
            db=db,
            user=current_user,
            resource=res_key,
            action="data_exchange",
            purpose=req.purpose,
            requested_fields=req.requested_fields,
            application_id=req.application_id,
            source="govbridge_api_gateway",
            target=connector.name,
            record_audit=True,
        )

        if not policy_decision.allowed:
            raise HTTPException(
                status_code=policy_decision.status_code,
                detail=policy_decision.reason,
            )

    # 3. Execute connector call
    adapter = ConnectorFactory.get_connector(connector)
    if req.method.upper() == "POST":
        conn_res = await adapter.send(req.endpoint_path, req.payload or {})
    else:
        conn_res = await adapter.fetch(req.endpoint_path, req.params)

    # Apply data minimization & privacy masking on protected fields
    if policy_decision and policy_decision.disallowed_fields and isinstance(conn_res.data, dict):
        conn_res.data = mask_sensitive_payload(conn_res.data, policy_decision.disallowed_fields)

    # 4. Validation step
    validation_outcome: Optional[ValidationResult] = None
    if req.validate_schema and conn_res.success and isinstance(conn_res.data, dict):
        system_type = connector.name.lower()
        if "employ" in system_type or "mole" in connector.code.lower():
            validation_outcome = SchemaValidator.validate_employment_payload(conn_res.data)
        elif "skill" in system_type or "msde" in connector.code.lower():
            validation_outcome = SchemaValidator.validate_skill_payload(conn_res.data)
        else:
            validation_outcome = SchemaValidator.validate_generic(conn_res.data, required_fields=["uid"] if "uid" in conn_res.data else [])

    # 5. Transformation step (Common Data Model)
    canonical_env: Optional[CanonicalEnvelope] = None
    if req.auto_transform and conn_res.success:
        canonical_env = DataTransformer.auto_transform(
            conn_res.data,
            system_type=connector.name,
            source_system=connector.name,
        )

    # 6. Persist exchange record
    exchange_status = "COMPLETED" if conn_res.success else "FAILED"
    stored_response = {
        "status": exchange_status,
        "source_protocol": conn_res.source_protocol,
        "raw_data": conn_res.data,
        "validation": validation_outcome.model_dump() if validation_outcome else None,
        "canonical_data": canonical_env.model_dump() if canonical_env else None,
    }

    exchange_record = DataExchange(
        application_id=req.application_id,
        source_connector_id=connector.id,
        target_connector_id=req.target_connector_id,
        request_payload={
            "path": req.endpoint_path,
            "method": req.method,
            "params": req.params,
            "body": req.payload,
        },
        response_payload=stored_response,
        status=exchange_status,
        latency_ms=conn_res.latency_ms or 0,
        error_message=conn_res.error,
        exchanged_at=datetime.now(timezone.utc),
    )
    db.add(exchange_record)
    await db.commit()
    await db.refresh(exchange_record)

    return ExchangeExecutionResponse(
        id=exchange_record.id,
        status=exchange_status,
        latency_ms=conn_res.latency_ms,
        source_connector=connector.code,
        source_protocol=conn_res.source_protocol,
        raw_data=conn_res.data,
        validation=validation_outcome,
        canonical_envelope=canonical_env,
        error_message=conn_res.error,
        exchanged_at=exchange_record.exchanged_at,
    )


@router.get("", response_model=List[DataExchangeRead], include_in_schema=False)
@router.get("/", response_model=List[DataExchangeRead])
async def list_exchanges(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/exchange
    Returns historical data exchanges recorded in GovBridge audit storage.
    """
    result = await db.execute(
        select(DataExchange)
        .order_by(desc(DataExchange.exchanged_at))
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{exchange_id}", response_model=DataExchangeRead)
async def get_exchange(
    exchange_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    GET /api/exchange/{id}
    Retrieves full exchange audit trail including request, raw response, and CDM transformation.
    """
    result = await db.execute(select(DataExchange).where(DataExchange.id == exchange_id))
    exchange = result.scalar_one_or_none()
    if not exchange:
        raise HTTPException(status_code=404, detail="Data exchange record not found")
    return exchange
