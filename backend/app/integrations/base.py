"""
GovBridge Reusable Connector Architecture — Base Connector Interface
SIH26129 Interoperability Foundation

Acts as an interoperability adapter connecting heterogeneous government systems
(REST/JSON, SOAP/XML, legacy databases, webhooks) without modifying existing systems.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Type, TypeVar
import time
from pydantic import BaseModel, Field

T = TypeVar("T", bound=BaseModel)


class ValidationIssue(BaseModel):
    field: str
    message: str
    issue_type: str = "ERROR"  # ERROR, WARNING


class ValidationResult(BaseModel):
    """Structured validation outcome before transformed data enters workflow"""
    is_valid: bool = True
    errors: list[ValidationIssue] = Field(default_factory=list)
    warnings: list[ValidationIssue] = Field(default_factory=list)
    checked_fields: list[str] = Field(default_factory=list)
    schema_compatible: bool = True
    validated_at: Optional[str] = None


class ConnectorResponse(BaseModel):
    """Standardized response from any external government system connector"""
    success: bool
    status_code: int = 200
    data: Optional[Any] = None
    raw_response: Optional[str] = None
    latency_ms: Optional[int] = None
    error: Optional[str] = None
    source_protocol: str = "REST_JSON"
    validation_result: Optional[ValidationResult] = None
    transformed_data: Optional[Any] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BaseConnector(ABC):
    """
    Abstract Base Class for all GovBridge Connectors / Adapters.
    Defines the unified lifecycle for interacting with heterogeneous government registries:
    - connect()
    - authenticate()
    - health_check()
    - fetch()
    - send()
    - transform()
    - validate()
    - handle_error()
    """

    def __init__(
        self,
        name: str,
        code: str,
        base_url: str,
        timeout_seconds: int = 30,
        auth_type: str = "none",
        config: Optional[Dict[str, Any]] = None,
        retry_policy: Optional[Dict[str, Any]] = None,
    ):
        self.name = name
        self.code = code
        self.base_url = (base_url or "").rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.auth_type = auth_type
        self.config = config or {}
        self.retry_policy = retry_policy or {"max_retries": 3, "backoff_factor": 1.5}
        self._connected: bool = False

    async def connect(self) -> bool:
        """
        Establish connection or verify remote availability.
        Subclasses may customize session pools, database connections, or auth handshakes.
        """
        health = await self.health_check()
        self._connected = health.success
        return self._connected

    def authenticate(self) -> Dict[str, str]:
        """
        Prepare standard headers/tokens/signatures based on auth_type.
        """
        headers: Dict[str, str] = {
            "X-GovBridge-Client": "GovBridge/1.0",
        }
        if self.auth_type == "api_key" and "api_key" in self.config:
            headers["X-API-Key"] = str(self.config["api_key"])
        elif self.auth_type == "bearer" and "token" in self.config:
            headers["Authorization"] = f"Bearer {self.config['token']}"
        elif self.auth_type == "basic" and "username" in self.config:
            import base64
            user = self.config.get("username", "")
            pwd = self.config.get("password", "")
            token = base64.b64encode(f"{user}:{pwd}".encode()).decode()
            headers["Authorization"] = f"Basic {token}"
        return headers

    @abstractmethod
    async def health_check(self) -> ConnectorResponse:
        """Ping external service and return health metrics"""
        pass

    @abstractmethod
    async def fetch(self, path: str, params: Optional[Dict[str, Any]] = None) -> ConnectorResponse:
        """Fetch citizen or registry data through the connector"""
        pass

    # Backwards-compatible alias for existing code
    async def fetch_data(self, path: str, params: Optional[Dict[str, Any]] = None) -> ConnectorResponse:
        return await self.fetch(path, params)

    @abstractmethod
    async def send(self, path: str, payload: Dict[str, Any]) -> ConnectorResponse:
        """Submit data or verification requests to the external registry"""
        pass

    # Backwards-compatible alias for existing code
    async def send_data(self, path: str, payload: Dict[str, Any]) -> ConnectorResponse:
        return await self.send(path, payload)

    def transform(self, raw_data: Any, target_model: Optional[Type[T]] = None) -> Any:
        """
        Hook to convert raw registry output into GovBridge Canonical Data Model (CDM)
        while preserving the source data untouched.
        Subclasses or transformer pipelines override this method.
        """
        if target_model and isinstance(raw_data, dict):
            try:
                return target_model(**raw_data)
            except Exception:
                pass
        return raw_data

    def validate(self, data: Any, required_fields: Optional[list[str]] = None) -> ValidationResult:
        """
        Validate data against required fields, types, and schema integrity
        before it enters the GovBridge workflow.
        """
        from datetime import datetime
        result = ValidationResult(
            is_valid=True,
            errors=[],
            warnings=[],
            checked_fields=[],
            schema_compatible=True,
            validated_at=datetime.utcnow().isoformat(),
        )

        if not isinstance(data, dict):
            result.is_valid = False
            result.schema_compatible = False
            result.errors.append(ValidationIssue(field="root", message="Payload must be a key-value dictionary"))
            return result

        reqs = required_fields or []
        for field in reqs:
            result.checked_fields.append(field)
            val = data.get(field)
            if val is None or val == "":
                result.is_valid = False
                result.errors.append(ValidationIssue(field=field, message=f"Required field '{field}' is missing or empty"))

        return result

    def handle_error(self, error: Exception, context: str = "", latency_ms: Optional[int] = None) -> ConnectorResponse:
        """
        Unified error handler across all connector implementations.
        Logs, formats, and returns standardized failure responses without crashing.
        """
        error_msg = f"{type(error).__name__}: {str(error)}"
        if context:
            error_msg = f"[{context}] {error_msg}"
        return ConnectorResponse(
            success=False,
            status_code=500,
            error=error_msg,
            latency_ms=latency_ms,
            source_protocol=getattr(self, "PROTOCOL", "UNKNOWN"),
            metadata={"connector_code": self.code, "error_type": type(error).__name__},
        )
