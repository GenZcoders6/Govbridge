"""
GovBridge Schema Validation Engine
SIH26129 Interoperability Foundation

Validates incoming and transformed data before it enters GovBridge workflow orchestration:
- Required fields
- Data types
- Identifier formats
- Schema compatibility
- Timestamps
"""
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.integrations.base import ValidationResult, ValidationIssue


class SchemaValidator:
    """
    Structured validation rules engine for GovBridge Interoperability Layer.
    """

    # Common identifier patterns
    ID_PATTERNS = {
        "EMPLOYEE_ID": re.compile(r"^EMP-[A-Z0-9]+$", re.IGNORECASE),
        "CITIZEN_UID": re.compile(r"^[A-Z0-9_-]{4,30}$", re.IGNORECASE),
        "STATE_CITIZEN_ID": re.compile(r"^[A-Z]{2,4}-CIT-[0-9]{4,8}$", re.IGNORECASE),
        "ISO_DATE": re.compile(r"^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$"),
    }

    @classmethod
    def validate_timestamp(cls, field_name: str, value: Any) -> Optional[ValidationIssue]:
        """Validate date/time string format"""
        if value is None or value == "":
            return None  # Missing is handled by required check
        val_str = str(value).strip()
        if not cls.ID_PATTERNS["ISO_DATE"].match(val_str):
            return ValidationIssue(
                field=field_name,
                message=f"Field '{field_name}' value '{val_str}' is not a valid ISO date/timestamp format (expected YYYY-MM-DD)",
                issue_type="ERROR",
            )
        return None

    @classmethod
    def validate_identifier(cls, field_name: str, value: Any, pattern_type: str = "CITIZEN_UID") -> Optional[ValidationIssue]:
        """Validate identifier structure"""
        if value is None or value == "":
            return ValidationIssue(
                field=field_name,
                message=f"Identifier '{field_name}' must not be null or empty",
                issue_type="ERROR",
            )
        val_str = str(value).strip()
        pattern = cls.ID_PATTERNS.get(pattern_type, cls.ID_PATTERNS["CITIZEN_UID"])
        if not pattern.match(val_str):
            return ValidationIssue(
                field=field_name,
                message=f"Identifier '{field_name}' value '{val_str}' does not match expected format for {pattern_type}",
                issue_type="WARNING",  # Warning to permit legacy variations without dropping data
            )
        return None

    @classmethod
    def validate_employment_payload(cls, data: Dict[str, Any]) -> ValidationResult:
        """
        Validate source or canonical employment payload
        Required: employee_id or person_id, job_status or status, organization
        """
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
            result.errors.append(ValidationIssue(field="root", message="Payload must be a dictionary"))
            return result

        # 1. Identifier check
        has_id = False
        for id_field in ("employee_id", "person_id", "uid"):
            result.checked_fields.append(id_field)
            if data.get(id_field):
                has_id = True
                issue = cls.validate_identifier(id_field, data[id_field], "EMPLOYEE_ID" if "emp" in id_field else "CITIZEN_UID")
                if issue:
                    if issue.issue_type == "ERROR":
                        result.errors.append(issue)
                    else:
                        result.warnings.append(issue)
                break
        if not has_id:
            result.is_valid = False
            result.errors.append(ValidationIssue(field="employee_id", message="Missing required identifier (employee_id or person_id)"))

        # 2. Status check
        status_val = data.get("job_status") or data.get("status")
        result.checked_fields.append("job_status/status")
        if not status_val:
            result.is_valid = False
            result.errors.append(ValidationIssue(field="job_status", message="Missing required field 'job_status'"))
        elif not isinstance(status_val, str):
            result.is_valid = False
            result.errors.append(ValidationIssue(field="job_status", message=f"Field 'job_status' must be string, got {type(status_val).__name__}"))

        # 3. Organization check
        org_val = data.get("organization")
        result.checked_fields.append("organization")
        if org_val is None:
            result.is_valid = False
            result.errors.append(ValidationIssue(field="organization", message="Missing required field 'organization'"))

        # 4. Joining Date / Start Date timestamp check
        date_val = data.get("joining_date") or data.get("startDate")
        if date_val:
            result.checked_fields.append("joining_date/startDate")
            date_issue = cls.validate_timestamp("joining_date", date_val)
            if date_issue:
                result.warnings.append(date_issue)

        if result.errors:
            result.is_valid = False

        return result

    @classmethod
    def validate_skill_payload(cls, data: Dict[str, Any]) -> ValidationResult:
        """
        Validate legacy skill response payload (SOAP/XML parsed or CDM)
        """
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
            result.errors.append(ValidationIssue(field="root", message="Payload must be a dictionary"))
            return result

        # Check CitizenId or citizen_id or person_id
        cit_id = data.get("CitizenId") or data.get("citizen_id") or data.get("person_id")
        result.checked_fields.append("CitizenId")
        if not cit_id:
            result.is_valid = False
            result.errors.append(ValidationIssue(field="CitizenId", message="Missing required identifier 'CitizenId'"))
        else:
            issue = cls.validate_identifier("CitizenId", cit_id, "STATE_CITIZEN_ID")
            if issue:
                result.warnings.append(issue)

        # Check Certification element
        cert_data = data.get("Certification") or data.get("certifications")
        result.checked_fields.append("Certification")
        if cert_data is None:
            result.warnings.append(ValidationIssue(field="Certification", message="No certification records present", issue_type="WARNING"))

        if result.errors:
            result.is_valid = False
        return result

    @classmethod
    def validate_generic(cls, data: Dict[str, Any], required_fields: List[str], expected_types: Optional[Dict[str, type]] = None) -> ValidationResult:
        """
        Generic validator for any registry payload: required fields, types, timestamps
        """
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
            result.errors.append(ValidationIssue(field="root", message="Payload must be a dictionary"))
            return result

        for field in required_fields:
            result.checked_fields.append(field)
            val = data.get(field)
            if val is None or val == "":
                result.is_valid = False
                result.errors.append(ValidationIssue(field=field, message=f"Required field '{field}' is missing or empty"))
            elif expected_types and field in expected_types:
                expected = expected_types[field]
                if not isinstance(val, expected):
                    result.is_valid = False
                    result.errors.append(ValidationIssue(
                        field=field,
                        message=f"Field '{field}' expected type {expected.__name__}, got {type(val).__name__}",
                    ))

        # Check any date-like fields for timestamp format
        for k, v in data.items():
            if "date" in k.lower() or "time" in k.lower() or "at" in k.lower():
                if v and isinstance(v, str) and len(v) >= 10:
                    t_issue = cls.validate_timestamp(k, v)
                    if t_issue:
                        result.warnings.append(t_issue)

        return result
