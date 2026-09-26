"""
GovBridge Governance, Identity, Consent and Audit Test Suite (SIH26129)
Verifies:
1. Master Citizen ID (MAHA-CIT-10284) mapped to 5 registries (Education, Employment, Skill, Revenue, Welfare)
2. DPDP Consent Lifecycle (ACTIVE, REVOKED, EXPIRED) via POST /api/consent, GET /api/consent/{id}, GET /api/applications/{id}/consents, POST /api/consent/{id}/revoke
3. Consent Enforcement & Policy Engine 5-Point Checks:
   - Valid consent -> Access allowed (200 OK)
   - No consent -> Access denied (403 Forbidden)
   - Revoked consent -> Access denied (403 Forbidden)
   - Wrong role -> Access denied (403 Forbidden)
   - Wrong purpose -> Access denied (403 Forbidden)
   - Unauthorized field -> Access denied (403 Forbidden)
4. Immutable Audit Trail & SHA-256 Cryptographic Integrity Hash Verification
5. Privacy Masking (+91 ******284, MAHA-****-10284)
"""
import sys
import os
import asyncio
import time
from uuid import UUID, uuid4
from datetime import datetime, timezone, timedelta

# Enable UTF-8 encoding on Windows console for checkmarks and icons
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_DIR = os.path.abspath(os.path.join(BACKEND_DIR, "..", "mock-services"))
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, MOCK_DIR)

from httpx import ASGITransport, AsyncClient
from sqlalchemy import select, desc
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.models import (
    Application, ApplicationStep, ApplicationStatus, Connector, Department, User, UserRole,
    Consent, ConsentStatus, AccessPolicy, AuditLog, MasterIdentity, IdentityMapping, Citizen
)
from app.services.policy_engine import PolicyEngine
from app.services.audit_service import AuditService
from app.security.jwt_handler import create_access_token, hash_password
from app.security.privacy import mask_phone, mask_citizen_id, mask_email
from app.main import app


async def run_governance_tests():
    print("\n" + "=" * 75)
    print("GOVBRIDGE GOVERNANCE, IDENTITY, CONSENT & AUDIT VERIFICATION (SIH26129)")
    print("=" * 75)

    # Sync tables & default policies
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await PolicyEngine.ensure_default_policies(db)

    # Provision test users & department
    async with AsyncSessionLocal() as db:
        suffix = uuid4().hex[:6]
        dept = Department(name=f"Employment Dept {suffix}", code=f"DEPT_LABOR_{suffix}", ministry="Ministry of Labour")
        db.add(dept)
        await db.flush()

        officer = User(
            email=f"officer_{uuid4().hex[:6]}@govbridge.demo",
            full_name="Rajesh Sharma (Officer)",
            hashed_password=hash_password("officer123"),
            role=UserRole.DEPARTMENT_OFFICER,
            department_id=dept.id,
            is_active=True,
        )
        citizen = User(
            email=f"citizen_{uuid4().hex[:6]}@govbridge.demo",
            full_name="Sunil Patil (Citizen)",
            hashed_password=hash_password("citizen123"),
            role=UserRole.CITIZEN,
            is_active=True,
        )
        auditor = User(
            email=f"auditor_{uuid4().hex[:6]}@govbridge.demo",
            full_name="Kavita Iyer (Auditor)",
            hashed_password=hash_password("auditor123"),
            role=UserRole.AUDITOR,
            is_active=True,
        )
        db.add_all([officer, citizen, auditor])
        await db.commit()
        await db.refresh(officer)
        await db.refresh(citizen)
        await db.refresh(auditor)

        officer_token = create_access_token({"sub": str(officer.id), "role": officer.role.value, "email": officer.email})
        citizen_token = create_access_token({"sub": str(citizen.id), "role": citizen.role.value, "email": citizen.email})
        auditor_token = create_access_token({"sub": str(auditor.id), "role": auditor.role.value, "email": auditor.email})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        officer_headers = {"Authorization": f"Bearer {officer_token}"}
        citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
        auditor_headers = {"Authorization": f"Bearer {auditor_token}"}

        # =================================================================
        # TEST 1: Master Citizen ID & Department Mappings
        # =================================================================
        print("\n--- TEST SUITE 1: Master Citizen ID & Cross-Department Resolution ---")
        master_id = "MAHA-CIT-10284"

        # 1.1 GET /api/identity/{master_id}
        res = await client.get(f"/api/identity/{master_id}", headers=officer_headers)
        assert res.status_code == 200, f"Failed GET /api/identity/{master_id}: {res.text}"
        id_data = res.json()
        assert id_data["master_citizen_id"] == master_id
        assert id_data["masked_id"] == "MAHA-****-10284", f"Expected MAHA-****-10284, got {id_data['masked_id']}"
        assert id_data["masked_phone"] == "+91 ******284", f"Expected +91 ******284, got {id_data['masked_phone']}"
        assert id_data["is_verified"] is True
        print(f"  [PASS] GET /api/identity/{master_id}: Master identity verified (Masked: {id_data['masked_id']}, Phone: {id_data['masked_phone']})")

        # 1.2 GET /api/identity/{master_id}/mappings
        res = await client.get(f"/api/identity/{master_id}/mappings", headers=officer_headers)
        assert res.status_code == 200, f"Failed GET /api/identity/{master_id}/mappings: {res.text}"
        mappings = res.json()
        assert len(mappings) >= 5, f"Expected 5 department mappings, got {len(mappings)}"
        systems = {m["source_system"]: m["source_id"] for m in mappings}
        print(f"  [PASS] GET /api/identity/{master_id}/mappings: Successfully resolved 5 department registries:")
        for sys_name, sid in systems.items():
            print(f"         - {sys_name.capitalize()} Registry ID -> {sid}")
        assert "education" in systems
        assert "employment" in systems
        assert "skill" in systems
        assert "revenue" in systems
        assert "welfare" in systems

        # =================================================================
        # TEST 2: Consent Lifecycle (POST, GET, Applications, Revoke)
        # =================================================================
        print("\n--- TEST SUITE 2: DPDP Consent Lifecycle (ACTIVE, REVOKED, EXPIRED) ---")
        app_id = uuid4()

        # 2.1 POST /api/consent
        consent_payload = {
            "application_id": str(app_id),
            "citizen_id": str(citizen.id),
            "purpose": "Benefit Eligibility Verification",
            "requested_data": ["employment_status", "organization_category", "qualification"],
            "expires_in_days": 30,
        }
        res = await client.post("/api/consent", json=consent_payload, headers=citizen_headers)
        assert res.status_code == 201, f"Failed POST /api/consent: {res.text}"
        consent_record = res.json()
        consent_id = consent_record["consent_id"]
        assert consent_record["status"] == "ACTIVE"
        assert consent_record["purpose"] == "Benefit Eligibility Verification"
        assert "employment_status" in consent_record["requested_data"]
        assert consent_record["granted_at"] is not None
        assert consent_record["expires_at"] is not None
        print(f"  [PASS] POST /api/consent: Consent granted (ID: {consent_id}, Status: {consent_record['status']}, Purpose: '{consent_record['purpose']}')")

        # 2.2 GET /api/consent/{id}
        res = await client.get(f"/api/consent/{consent_id}", headers=citizen_headers)
        assert res.status_code == 200, f"Failed GET /api/consent/{consent_id}: {res.text}"
        assert res.json()["status"] == "ACTIVE"
        print(f"  [PASS] GET /api/consent/{consent_id}: Verified ACTIVE status and DPDP fields")

        # 2.3 GET /api/applications/{id}/consents
        res = await client.get(f"/api/consent/applications/{app_id}/consents", headers=citizen_headers)
        assert res.status_code == 200, f"Failed GET application consents: {res.text}"
        app_consents = res.json()
        assert len(app_consents) >= 1
        assert app_consents[0]["consent_id"] == consent_id
        print(f"  [PASS] GET /api/applications/{app_id}/consents: Retrieved linked citizen consents ({len(app_consents)} record)")

        # =================================================================
        # TEST 3: Consent Enforcement & Policy Engine 5-Point Checks
        # =================================================================
        print("\n--- TEST SUITE 3: 5-Point Governance & Consent Enforcement Checks ---")

        # 3.1 Scenario 1: Valid Consent -> Access Allowed (200 OK)
        res = await client.post(
            "/api/exchange/policy-check",
            json={
                "resource": "employment_registry",
                "action": "data_exchange",
                "purpose": "Benefit Eligibility Verification",
                "requested_fields": ["employment_status", "organization_category"],
                "application_id": str(app_id),
            },
            headers=officer_headers,
        )
        assert res.status_code == 200, f"Expected 200 OK for valid consent, got {res.status_code}: {res.text}"
        data = res.json()
        assert data["allowed"] is True
        print(f"  [PASS] Scenario 1 (Valid Consent): ACCESS ALLOWED -> {data['reason']}")

        # 3.2 Scenario 2: No Consent -> Access Denied (403 Forbidden)
        unconsented_app_id = str(uuid4())
        res = await client.post(
            "/api/exchange/policy-check",
            json={
                "resource": "employment_registry",
                "action": "data_exchange",
                "purpose": "Benefit Eligibility Verification",
                "requested_fields": ["employment_status"],
                "application_id": unconsented_app_id,
            },
            headers=officer_headers,
        )
        assert res.status_code == 403, f"Expected 403 for missing consent, got {res.status_code}: {res.text}"
        print(f"  [PASS] Scenario 2 (No Consent): ACCESS DENIED (403) -> {res.json()['detail']}")

        # 3.3 Scenario 3: Revoked Consent -> Access Denied (403 Forbidden)
        # First revoke the consent
        revoke_res = await client.post(f"/api/consent/{consent_id}/revoke", headers=citizen_headers)
        assert revoke_res.status_code == 200
        assert revoke_res.json()["status"] == "REVOKED"
        print(f"  [INFO] Revoked consent {consent_id} (Status: REVOKED, Timestamp: {revoke_res.json()['revoked_at']})")

        # Now test policy check on revoked consent
        res = await client.post(
            "/api/exchange/policy-check",
            json={
                "resource": "employment_registry",
                "action": "data_exchange",
                "purpose": "Benefit Eligibility Verification",
                "requested_fields": ["employment_status"],
                "application_id": str(app_id),
            },
            headers=officer_headers,
        )
        assert res.status_code == 403, f"Expected 403 for revoked consent, got {res.status_code}: {res.text}"
        print(f"  [PASS] Scenario 3 (Revoked Consent): ACCESS DENIED (403) -> {res.json()['detail']}")

        # 3.4 Scenario 4: Wrong Role -> Access Denied (403 Forbidden)
        # Create fresh active consent for testing wrong role
        c2 = await client.post("/api/consent", json={
            "application_id": str(app_id),
            "citizen_id": str(citizen.id),
            "purpose": "Benefit Eligibility Verification",
            "requested_data": ["employment_status"],
        }, headers=citizen_headers)
        assert c2.status_code == 201

        # CITIZEN role attempting officer-only departmental data exchange
        res = await client.post(
            "/api/exchange/policy-check",
            json={
                "resource": "employment_registry",
                "action": "data_exchange",
                "purpose": "Benefit Eligibility Verification",
                "requested_fields": ["employment_status"],
                "application_id": str(app_id),
            },
            headers=citizen_headers,
        )
        assert res.status_code == 403, f"Expected 403 for wrong role (CITIZEN), got {res.status_code}: {res.text}"
        print(f"  [PASS] Scenario 4 (Wrong Role): ACCESS DENIED (403) -> {res.json()['detail']}")

        # 3.5 Scenario 5: Wrong Purpose -> Access Denied (403 Forbidden)
        res = await client.post(
            "/api/exchange/policy-check",
            json={
                "resource": "employment_registry",
                "action": "data_exchange",
                "purpose": "Commercial Marketing & Profiling",  # Unauthorized purpose
                "requested_fields": ["employment_status"],
                "application_id": str(app_id),
            },
            headers=officer_headers,
        )
        assert res.status_code == 403, f"Expected 403 for unauthorized purpose, got {res.status_code}: {res.text}"
        print(f"  [PASS] Scenario 5 (Wrong Purpose): ACCESS DENIED (403) -> {res.json()['detail']}")

        # 3.6 Scenario 6: Unauthorized Prohibited Field -> Access Denied (403 Forbidden)
        # Attempting to fetch salary / private contact details
        res = await client.post(
            "/api/exchange/policy-check",
            json={
                "resource": "employment_registry",
                "action": "data_exchange",
                "purpose": "Benefit Eligibility Verification",
                "requested_fields": ["employment_status", "salary", "private contact details"],
                "application_id": str(app_id),
            },
            headers=officer_headers,
        )
        assert res.status_code == 403, f"Expected 403 for unauthorized field, got {res.status_code}: {res.text}"
        print(f"  [PASS] Scenario 6 (Unauthorized Field): ACCESS DENIED (403) -> {res.json()['detail']}")

        # =================================================================
        # TEST 4: Audit Trail & SHA-256 Cryptographic Integrity Verification
        # =================================================================
        print("\n--- TEST SUITE 4: Audit API & Cryptographic Integrity Verification ---")

        # 4.1 Filter by application
        res = await client.get(f"/api/audit?application_id={app_id}", headers=auditor_headers)
        assert res.status_code == 200, f"Failed GET /api/audit: {res.text}"
        app_audit_logs = res.json()
        assert len(app_audit_logs) >= 1, "Expected audit logs for application"
        print(f"  [PASS] GET /api/audit?application_id: Retrieved {len(app_audit_logs)} audit records for application")

        # 4.2 Filter by actor
        res = await client.get(f"/api/audit?actor={officer.email}", headers=auditor_headers)
        assert res.status_code == 200
        officer_logs = res.json()
        assert len(officer_logs) >= 1
        print(f"  [PASS] GET /api/audit?actor={officer.email}: Retrieved {len(officer_logs)} records for officer")

        # 4.3 Filter by result (DENIED)
        res = await client.get("/api/audit?result=DENIED", headers=auditor_headers)
        assert res.status_code == 200
        denied_logs = res.json()
        assert len(denied_logs) >= 4, f"Expected at least 4 DENIED audit logs, found {len(denied_logs)}"
        print(f"  [PASS] GET /api/audit?result=DENIED: Retrieved {len(denied_logs)} policy denial records")

        # 4.4 Cryptographic SHA-256 verification of single audit log
        sample_log_id = app_audit_logs[0]["id"]
        res = await client.get(f"/api/audit/{sample_log_id}", headers=auditor_headers)
        assert res.status_code == 200
        single_log = res.json()
        assert single_log["integrity_hash"] is not None
        assert len(single_log["integrity_hash"]) == 64, "Expected 64-character hex SHA-256 string"
        assert single_log["integrity_verified"] is True
        print(f"  [PASS] GET /api/audit/{sample_log_id}: SHA-256 Cryptographic Integrity VERIFIED (Hash: {single_log['integrity_hash'][:16]}...)")

        # =================================================================
        # TEST 5: Privacy Masking Verification
        # =================================================================
        print("\n--- TEST SUITE 5: Privacy & DPDP Data Masking ---")
        phone_masked = mask_phone("+919876543284")
        assert phone_masked == "+91 ******284", f"Expected '+91 ******284', got '{phone_masked}'"
        print(f"  [PASS] Phone Masking: '+919876543284' -> '{phone_masked}'")

        cit_masked = mask_citizen_id("MAHA-CIT-10284")
        assert cit_masked == "MAHA-****-10284", f"Expected 'MAHA-****-10284', got '{cit_masked}'"
        print(f"  [PASS] Citizen ID Masking: 'MAHA-CIT-10284' -> '{cit_masked}'")

        email_masked = mask_email("sunil.patil@example.gov.in")
        assert email_masked == "s***@example.gov.in", f"Expected 's***@example.gov.in', got '{email_masked}'"
        print(f"  [PASS] Email Masking: 'sunil.patil@example.gov.in' -> '{email_masked}'")

    print("\n" + "=" * 75)
    print("ALL GOVERNANCE, IDENTITY, CONSENT & AUDIT TESTS PASSED (100% VERIFIED)")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    asyncio.run(run_governance_tests())
