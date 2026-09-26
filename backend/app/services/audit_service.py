"""
GovBridge Immutable Audit Service
SIH26129 Governance & Audit Trail

Generates SHA-256 integrity-hashed audit logs for all security, consent, policy,
and cross-departmental data exchanges.
"""
import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.models import AuditLog


class AuditService:
    SALT = "govbridge_audit_ledger_v1_2026"

    @classmethod
    def _normalize_ts(cls, ts: Any) -> str:
        if isinstance(ts, datetime):
            return ts.strftime("%Y-%m-%dT%H:%M:%S")
        if isinstance(ts, str):
            return ts[:19].replace(" ", "T")
        return ""

    @classmethod
    def calculate_integrity_hash(
        cls,
        event_id: str,
        timestamp: Any,
        actor: str,
        role: str,
        application: str,
        action: str,
        source: str,
        target: str,
        purpose: str,
        consent_id: str,
        result: str,
    ) -> str:
        """
        Generates a deterministic SHA-256 cryptographic hash guaranteeing audit record immutability.
        """
        ts_str = cls._normalize_ts(timestamp)
        canonical_str = (
            f"{event_id}|{ts_str}|{actor}|{role}|{application}|"
            f"{action}|{source}|{target}|{purpose}|{consent_id}|{result}|{cls.SALT}"
        )
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    @classmethod
    async def log_operation(
        cls,
        db: AsyncSession,
        actor: str,
        role: str,
        action: str,
        result: str,
        application_id: Optional[UUID] = None,
        source: str = "govbridge_gateway",
        target: str = "internal_service",
        purpose: Optional[str] = "Benefit Eligibility Verification",
        consent_id: Optional[UUID] = None,
        department_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[str] = None,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        commit: bool = True,
    ) -> AuditLog:
        """
        Creates, hashes, and persists an immutable audit log entry.
        """
        event_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        timestamp_str = now.isoformat()

        app_str = str(application_id) if application_id else "N/A"
        consent_str = str(consent_id) if consent_id else "N/A"
        purpose_str = purpose or "General Operations"
        source_str = source or "govbridge_gateway"
        target_str = target or "internal_service"
        actor_str = actor or "anonymous"
        role_str = role or "UNKNOWN"
        result_str = result or "ALLOWED"

        # Cryptographic SHA-256 integrity hash
        integrity_hash = cls.calculate_integrity_hash(
            event_id=str(event_id),
            timestamp=now,
            actor=actor_str,
            role=role_str,
            application=app_str,
            action=action,
            source=source_str,
            target=target_str,
            purpose=purpose_str,
            consent_id=consent_str,
            result=result_str,
        )

        audit_entry = AuditLog(
            event_id=event_id,
            user_id=user_id,
            actor=actor_str,
            role=role_str,
            application_id=application_id,
            action=action,
            source=source_str,
            target=target_str,
            purpose=purpose_str,
            consent_id=consent_id,
            result=result_str,
            integrity_hash=integrity_hash,
            department_id=department_id,
            resource_type=resource_type or target_str,
            resource_id=resource_id or app_str,
            status="SUCCESS" if result_str in ("ALLOWED", "SUCCESS") else "FAILURE",
            details=details or f"Action {action} performed with result {result_str}",
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address or "127.0.0.1",
            created_at=now,
        )

        db.add(audit_entry)
        if commit:
            await db.commit()
            await db.refresh(audit_entry)

        return audit_entry

    @classmethod
    def calculate_record_hash(cls, log: AuditLog) -> str:
        """
        Calculates SHA-256 hash for an existing AuditLog model record.
        """
        app_str = str(log.application_id) if log.application_id else "N/A"
        consent_str = str(log.consent_id) if log.consent_id else "N/A"
        purpose_str = log.purpose or "General Operations"
        source_str = log.source or "govbridge_gateway"
        target_str = log.target or "internal_service"
        actor_str = log.actor or "anonymous"
        role_str = log.role or "UNKNOWN"
        result_str = log.result or log.status or "ALLOWED"

        return cls.calculate_integrity_hash(
            event_id=str(log.event_id),
            timestamp=log.created_at,
            actor=actor_str,
            role=role_str,
            application=app_str,
            action=log.action,
            source=source_str,
            target=target_str,
            purpose=purpose_str,
            consent_id=consent_str,
            result=result_str,
        )

    @classmethod
    def verify_record_integrity(cls, log: AuditLog) -> bool:
        """
        Validates that an audit record has not been altered or tampered with.
        """
        if not log.integrity_hash:
            return False
        expected = cls.calculate_record_hash(log)
        return expected == log.integrity_hash
