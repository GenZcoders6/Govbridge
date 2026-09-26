"""
Pydantic Schemas for GovBridge API
"""
from datetime import datetime
from typing import Optional, List, Any, Dict
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator

from app.models.models import (
    UserRole, ApplicationStatus, ConnectorStatus, ConnectorProtocol,
    EventSeverity, ConsentStatus
)


# ── Auth ──────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserRead"


class LoginRequest(BaseModel):
    email: str
    password: str


# ── User ──────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.CITIZEN
    department_id: Optional[UUID] = None
    phone: Optional[str] = None


class UserRead(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    department_id: Optional[UUID] = None
    last_login: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    department_id: Optional[UUID] = None


# ── Department ────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    ministry: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class DepartmentRead(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    ministry: Optional[str] = None
    is_active: bool
    contact_email: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Connector ─────────────────────────────────────────────────

class ConnectorCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    department_id: Optional[UUID] = None
    protocol: ConnectorProtocol
    base_url: Optional[str] = None
    auth_type: str = "none"
    config: Dict[str, Any] = {}
    is_mock: bool = True
    tags: List[str] = []
    timeout_seconds: int = 30


class ConnectorRead(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    department_id: Optional[UUID] = None
    system_type: Optional[str] = None
    protocol: ConnectorProtocol
    authentication: Optional[str] = "none"
    auth_type: Optional[str] = "none"
    base_url: Optional[str] = None
    status: ConnectorStatus
    is_mock: bool
    tags: List[str] = []
    timeout: Optional[int] = None
    timeout_seconds: int = 30
    last_health_check: Optional[datetime] = None
    retry_policy: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConnectorHealthRead(BaseModel):
    id: UUID
    connector_id: UUID
    status: ConnectorStatus
    latency_ms: Optional[int] = None
    error_message: Optional[str] = None
    checked_at: datetime

    model_config = {"from_attributes": True}


# ── Data Exchange ─────────────────────────────────────────────

class DataExchangeRequest(BaseModel):
    source_connector_id: Optional[UUID] = None
    source_connector_code: Optional[str] = None
    target_connector_id: Optional[UUID] = None
    endpoint_path: str = "/citizens"
    method: str = "GET"
    payload: Optional[Dict[str, Any]] = None
    params: Optional[Dict[str, Any]] = None
    application_id: Optional[UUID] = None
    purpose: Optional[str] = "Benefit Eligibility Verification"
    requested_fields: Optional[List[str]] = None
    enforce_policy: bool = False
    auto_transform: bool = True
    validate_schema: bool = True


class DataExchangeRead(BaseModel):
    id: UUID
    application_id: Optional[UUID] = None
    source_connector_id: Optional[UUID] = None
    target_connector_id: Optional[UUID] = None
    request_payload: Optional[Any] = None
    response_payload: Optional[Any] = None
    status: Optional[str] = None
    latency_ms: Optional[int] = None
    error_message: Optional[str] = None
    exchanged_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}



# ── Application ───────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    workflow_id: Optional[UUID] = None
    title: Optional[str] = None
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    master_citizen_id: Optional[str] = None
    service: Optional[str] = None
    form_data: Dict[str, Any] = {}



class ApplicationRead(BaseModel):
    id: UUID
    reference_number: str
    citizen_id: UUID
    workflow_id: UUID
    department_id: Optional[UUID] = None
    status: ApplicationStatus
    title: Optional[str] = None
    current_step: int
    submitted_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationStepRead(BaseModel):
    id: UUID
    application_id: UUID
    step_order: int
    name: Optional[str] = None
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result_data: Dict[str, Any] = {}
    error_message: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Workflow ──────────────────────────────────────────────────

class WorkflowRead(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    department_id: Optional[UUID] = None
    version: int
    is_active: bool
    sla_hours: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Consent ───────────────────────────────────────────────────

class ConsentCreate(BaseModel):
    application_id: Optional[UUID] = None
    citizen_id: Optional[UUID] = None
    purpose: str = "Benefit Eligibility Verification"
    requested_data: List[str] = []
    data_categories: List[str] = []
    expires_in_days: int = 30
    requesting_department_id: Optional[UUID] = None


class ConsentRead(BaseModel):
    id: UUID
    consent_id: Optional[UUID] = None
    citizen_id: Optional[UUID] = None
    application_id: Optional[UUID] = None
    purpose: str
    requested_data: List[str] = []
    data_categories: List[str] = []
    status: str
    granted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Master Identity ───────────────────────────────────────────

class MasterIdentityMappingRead(BaseModel):
    id: Optional[UUID] = None
    master_identity_id: Optional[UUID] = None
    source_system: str
    source_id: str
    source_schema: Optional[str] = None
    is_active: bool = True
    last_synced: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MasterIdentityRead(BaseModel):
    id: UUID
    master_citizen_id: str
    masked_id: str
    full_name: str
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    masked_phone: Optional[str] = None
    masked_email: Optional[str] = None
    is_verified: bool = True
    confidence_score: float = 1.0
    created_at: datetime
    mappings_count: int = 0

    model_config = {"from_attributes": True}


# ── Access Policy ─────────────────────────────────────────────

class AccessPolicyRead(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    resource: str
    action: str
    roles_allowed: List[str] = []
    purpose: Optional[str] = None
    consent_required: bool = True
    allowed_fields: List[str] = []
    disallowed_fields: List[str] = []
    is_active: bool

    model_config = {"from_attributes": True}


# ── Event ─────────────────────────────────────────────────────

class EventRead(BaseModel):
    id: UUID
    event_type: str
    source: Optional[str] = None
    severity: EventSeverity
    payload: Dict[str, Any] = {}
    is_processed: bool
    processed_at: Optional[datetime] = None
    correlation_id: Optional[str] = None
    application_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Audit Log ─────────────────────────────────────────────────

class AuditLogRead(BaseModel):
    id: UUID
    event_id: Optional[UUID] = None
    timestamp: Optional[datetime] = None
    actor: Optional[str] = None
    role: Optional[str] = None
    application: Optional[str] = None
    application_id: Optional[UUID] = None
    action: str
    source: Optional[str] = None
    target: Optional[str] = None
    purpose: Optional[str] = None
    consent_id: Optional[UUID] = None
    result: str = "ALLOWED"
    integrity_hash: Optional[str] = None
    department_id: Optional[UUID] = None
    status: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard ─────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_applications: int
    pending_applications: int
    approved_applications: int
    active_connectors: int
    total_connectors: int
    active_workflows: int
    total_citizens: int
    events_today: int
    pending_consents: int
    recent_applications: List[ApplicationRead]
    connector_health: List[ConnectorHealthRead]


# ── System Exception ──────────────────────────────────────────

class SystemExceptionCreate(BaseModel):
    application_id: Optional[UUID] = None
    connector_id: Optional[UUID] = None
    exception_type: str
    error_type: Optional[str] = None
    source: str
    severity: EventSeverity = EventSeverity.ERROR
    message: str
    error_message: Optional[str] = None
    retry_count: int = 0
    stack_trace: Optional[str] = None
    payload: Dict[str, Any] = {}
    status: str = "OPEN"


class SystemExceptionRead(BaseModel):
    id: UUID
    exception_id: Optional[UUID] = None
    application_id: Optional[UUID] = None
    connector_id: Optional[UUID] = None
    exception_type: str
    error_type: Optional[str] = None
    source: str
    severity: EventSeverity
    message: str
    error_message: Optional[str] = None
    retry_count: int = 0
    stack_trace: Optional[str] = None
    payload: Dict[str, Any] = {}
    status: str
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}



# Forward reference resolution
TokenResponse.model_rebuild()

