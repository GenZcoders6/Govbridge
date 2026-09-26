"""
GovBridge SQLAlchemy Models
All core database entities
"""
import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, Integer, Float,
    ForeignKey, Enum, JSON, Index, UniqueConstraint
)
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


# ── Enums ─────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    DEPARTMENT_OFFICER = "DEPARTMENT_OFFICER"
    INTEGRATION_ADMIN = "INTEGRATION_ADMIN"
    AUDITOR = "AUDITOR"


class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    PENDING_DATA = "PENDING_DATA"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    QUEUED = "QUEUED"
    MANUAL_REVIEW = "MANUAL_REVIEW"


class ConnectorStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DEGRADED = "DEGRADED"
    ERROR = "ERROR"


class ConnectorProtocol(str, enum.Enum):
    REST_JSON = "REST_JSON"
    SOAP_XML = "SOAP_XML"
    DATABASE = "DATABASE"
    WEBHOOK = "WEBHOOK"
    GRAPHQL = "GRAPHQL"


class WorkflowStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class EventSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class ConsentStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    GRANTED = "GRANTED"
    DENIED = "DENIED"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"


# ── Mixins ─────────────────────────────────────────────────────

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class UUIDMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)


# ── Models ────────────────────────────────────────────────────

class Department(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "departments"

    name = Column(String(200), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    ministry = Column(String(200))
    is_active = Column(Boolean, default=True)
    contact_email = Column(String(255))
    contact_phone = Column(String(20))

    users = relationship("User", back_populates="department")
    connectors = relationship("Connector", back_populates="department")
    workflows = relationship("Workflow", back_populates="department")

    __table_args__ = (
        Index("idx_departments_code", "code"),
    )


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(200), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CITIZEN)
    is_active = Column(Boolean, default=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    last_login = Column(DateTime(timezone=True))
    phone = Column(String(20))

    department = relationship("Department", back_populates="users")
    applications = relationship("Application", back_populates="citizen", foreign_keys="Application.citizen_id")
    assigned_applications = relationship("Application", back_populates="assigned_officer", foreign_keys="Application.assigned_officer_id")
    audit_logs = relationship("AuditLog", back_populates="user")
    consents = relationship("Consent", back_populates="citizen")

    __table_args__ = (
        Index("idx_users_role", "role"),
    )


class Citizen(Base, UUIDMixin, TimestampMixin):
    """Separate citizen profile entity distinct from auth User"""
    __tablename__ = "citizens"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    full_name = Column(String(200), nullable=False)
    date_of_birth = Column(String(20))  # stored as string to avoid real PII risks
    gender = Column(String(20))
    state = Column(String(100))
    district = Column(String(100))
    pincode = Column(String(10))
    is_verified = Column(Boolean, default=False)

    master_identities = relationship("MasterIdentity", back_populates="citizen")


class MasterIdentity(Base, UUIDMixin, TimestampMixin):
    """Cross-system master identity record"""
    __tablename__ = "master_identities"

    citizen_id = Column(UUID(as_uuid=True), ForeignKey("citizens.id"), nullable=False)
    master_uid = Column(String(100), nullable=False, unique=True)  # GovBridge internal ID
    confidence_score = Column(Float, default=1.0)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True))

    citizen = relationship("Citizen", back_populates="master_identities")
    identity_mappings = relationship("IdentityMapping", back_populates="master_identity")


class IdentityMapping(Base, UUIDMixin, TimestampMixin):
    """Maps master identity to source system identifiers"""
    __tablename__ = "identity_mappings"

    master_identity_id = Column(UUID(as_uuid=True), ForeignKey("master_identities.id"), nullable=False)
    source_system = Column(String(100), nullable=False)  # e.g. "identity_registry", "education_registry"
    source_id = Column(String(200), nullable=False)      # ID in that system
    source_schema = Column(String(100))
    is_active = Column(Boolean, default=True)
    last_synced = Column(DateTime(timezone=True))

    master_identity = relationship("MasterIdentity", back_populates="identity_mappings")

    __table_args__ = (
        UniqueConstraint("master_identity_id", "source_system", name="uq_identity_mapping"),
    )


class Connector(Base, UUIDMixin, TimestampMixin):
    """Represents a connection to an external government system"""
    __tablename__ = "connectors"

    name = Column(String(200), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    protocol = Column(Enum(ConnectorProtocol), nullable=False)
    base_url = Column(String(500))
    auth_type = Column(String(50), default="none")  # none, api_key, oauth2, basic
    config = Column(JSON, default={})               # connector-specific config
    status = Column(Enum(ConnectorStatus), default=ConnectorStatus.ACTIVE)
    is_mock = Column(Boolean, default=True)
    tags = Column(JSON, default=[])
    timeout_seconds = Column(Integer, default=30)

    department = relationship("Department", back_populates="connectors")
    health_records = relationship("ConnectorHealth", back_populates="connector")

    __table_args__ = (
        Index("idx_connectors_code", "code"),
        Index("idx_connectors_status", "status"),
    )


class ConnectorHealth(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "connector_health"

    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=False)
    status = Column(Enum(ConnectorStatus), nullable=False)
    latency_ms = Column(Integer)
    error_message = Column(Text)
    checked_at = Column(DateTime(timezone=True), server_default=func.now())

    connector = relationship("Connector", back_populates="health_records")


class Workflow(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workflows"

    name = Column(String(200), nullable=False)
    code = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    definition = Column(JSON, default={})  # workflow DAG definition
    sla_hours = Column(Integer, default=72)

    department = relationship("Department", back_populates="workflows")
    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="workflow")


class WorkflowStep(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workflow_steps"

    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    name = Column(String(200), nullable=False)
    step_type = Column(String(50), nullable=False)  # data_fetch, validation, approval, notification
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=True)
    config = Column(JSON, default={})
    is_required = Column(Boolean, default=True)

    workflow = relationship("Workflow", back_populates="steps")


class Application(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "applications"

    reference_number = Column(String(50), nullable=False, unique=True)
    citizen_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT)
    title = Column(String(500))
    form_data = Column(JSON, default={})
    current_step = Column(Integer, default=0)
    submitted_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    assigned_officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text)

    citizen = relationship("User", back_populates="applications", foreign_keys=[citizen_id])
    assigned_officer = relationship("User", back_populates="assigned_applications", foreign_keys=[assigned_officer_id])
    workflow = relationship("Workflow", back_populates="applications")
    steps = relationship("ApplicationStep", back_populates="application", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_applications_status", "status"),
        Index("idx_applications_citizen", "citizen_id"),
        Index("idx_applications_ref", "reference_number"),
    )


class ApplicationStep(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "application_steps"

    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    workflow_step_id = Column(UUID(as_uuid=True), ForeignKey("workflow_steps.id"))
    step_order = Column(Integer, nullable=False)
    name = Column(String(200))
    status = Column(String(50), default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, FAILED, SKIPPED
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    result_data = Column(JSON, default={})
    error_message = Column(Text)
    performed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    application = relationship("Application", back_populates="steps")


class SchemaMapping(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "schema_mappings"

    name = Column(String(200), nullable=False)
    source_connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"))
    target_connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"))
    source_schema = Column(JSON, nullable=False)
    target_schema = Column(JSON, nullable=False)
    transformation_rules = Column(JSON, default={})
    is_active = Column(Boolean, default=True)


class DataExchange(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "data_exchanges"

    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True)
    source_connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"))
    target_connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"))
    request_payload = Column(JSON)
    response_payload = Column(JSON)
    status = Column(String(50))
    latency_ms = Column(Integer)
    error_message = Column(Text)
    exchanged_at = Column(DateTime(timezone=True), server_default=func.now())


class Consent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "consents"

    citizen_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True)
    purpose = Column(Text, nullable=False)
    data_categories = Column(JSON, default=[])  # list of data categories
    requested_data = Column(JSON, default=[])   # explicit requested_data categories/fields
    requesting_department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    status = Column(Enum(ConsentStatus), default=ConsentStatus.ACTIVE)
    granted_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    revoked_at = Column(DateTime(timezone=True))
    revocation_reason = Column(Text)

    citizen = relationship("User", back_populates="consents")
    data_requests = relationship("ConsentDataRequest", back_populates="consent")

    @property
    def consent_id(self):
        return self.id

    __table_args__ = (
        Index("idx_consents_citizen", "citizen_id"),
        Index("idx_consents_status", "status"),
        Index("idx_consents_app", "application_id"),
    )


class ConsentDataRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "consent_data_requests"

    consent_id = Column(UUID(as_uuid=True), ForeignKey("consents.id"), nullable=False)
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"))
    data_field = Column(String(200))
    is_approved = Column(Boolean, default=False)

    consent = relationship("Consent", back_populates="data_requests")


class AccessPolicy(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "access_policies"

    name = Column(String(200), nullable=False)
    description = Column(Text)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    resource = Column(String(200), nullable=False)  # e.g. "employment_registry"
    action = Column(String(50), nullable=False)     # read, write, data_exchange
    roles_allowed = Column(JSON, default=[])         # list of UserRole values e.g. ["DEPARTMENT_OFFICER"]
    purpose = Column(String(200), nullable=True)     # e.g. "Benefit Eligibility Verification"
    consent_required = Column(Boolean, default=True) # Consent: Required
    allowed_fields = Column(JSON, default=[])       # e.g. ["employment_status", "organization_category"]
    disallowed_fields = Column(JSON, default=[])    # e.g. ["salary", "private contact details"]
    conditions = Column(JSON, default={})
    is_active = Column(Boolean, default=True)


class Event(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "events"

    event_type = Column(String(100), nullable=False)
    source = Column(String(200))
    severity = Column(Enum(EventSeverity), default=EventSeverity.INFO)
    payload = Column(JSON, default={})
    is_processed = Column(Boolean, default=False)
    processed_at = Column(DateTime(timezone=True))
    correlation_id = Column(String(100))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True)

    __table_args__ = (
        Index("idx_events_type", "event_type"),
        Index("idx_events_severity", "severity"),
        Index("idx_events_processed", "is_processed"),
        Index("idx_events_application", "application_id"),
    )


class AuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    event_id = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    actor = Column(String(255), nullable=True, index=True)
    role = Column(String(100), nullable=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True, index=True)
    action = Column(String(200), nullable=False)
    source = Column(String(200), nullable=True)
    target = Column(String(200), nullable=True)
    purpose = Column(String(255), nullable=True)
    consent_id = Column(UUID(as_uuid=True), ForeignKey("consents.id"), nullable=True, index=True)
    result = Column(String(50), nullable=False, default="ALLOWED")  # ALLOWED, DENIED, SUCCESS, FAILURE
    integrity_hash = Column(String(64), nullable=True)             # SHA-256 hash
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True, index=True)

    resource_type = Column(String(100))
    resource_id = Column(String(200))
    old_value = Column(JSON)
    new_value = Column(JSON)
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    status = Column(String(20), default="SUCCESS")  # SUCCESS, FAILURE
    details = Column(Text)

    user = relationship("User", back_populates="audit_logs")

    @property
    def timestamp(self):
        return self.created_at

    @property
    def application(self):
        return str(self.application_id) if self.application_id else None

    __table_args__ = (
        Index("idx_audit_user", "user_id"),
        Index("idx_audit_action", "action"),
        Index("idx_audit_actor", "actor"),
        Index("idx_audit_app", "application_id"),
        Index("idx_audit_result", "result"),
        Index("idx_audit_resource", "resource_type", "resource_id"),
    )


class Notification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")  # INFO, SUCCESS, WARNING, ERROR
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    related_resource_type = Column(String(100))
    related_resource_id = Column(String(200))


class SystemException(Base, UUIDMixin, TimestampMixin):
    """Tracks interoperability errors, gateway timeouts, schema errors, and connector faults"""
    __tablename__ = "exceptions"

    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True)
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=True)
    exception_type = Column(String(100), nullable=False)
    error_type = Column(String(100), nullable=True)
    source = Column(String(100), nullable=False)
    severity = Column(Enum(EventSeverity), default=EventSeverity.ERROR, nullable=False)
    message = Column(Text, nullable=False)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    stack_trace = Column(Text, nullable=True)
    payload = Column(JSON, default={})
    status = Column(String(50), default="OPEN")  # OPEN, RETRYING, QUEUED, MANUAL_REVIEW, RESOLVED
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)

    @property
    def exception_id(self):
        return self.id

    __table_args__ = (
        Index("idx_exceptions_type", "exception_type"),
        Index("idx_exceptions_source", "source"),
        Index("idx_exceptions_severity", "severity"),
        Index("idx_exceptions_status", "status"),
        Index("idx_exceptions_app", "application_id"),
    )


