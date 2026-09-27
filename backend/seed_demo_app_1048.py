"""
seed_demo_app_1048.py
Seeds APP-2026-1048 synthetic demo application with full 11-step execution results,
canonical data models (CDM), SOAP/XML & REST payloads, DPDP consent, and SHA-256 audit logs.
"""
import sys
import os
import json
import hashlib
import uuid
from datetime import datetime, timezone, timedelta

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker

# Database engine
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "govbridge.db")
DATABASE_URL = f"sqlite:///{db_path}"
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)

def generate_sha256(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def seed():
    session = SessionLocal()
    try:
        from app.models.models import (
            User, Application, ApplicationStep, Consent, ConsentDataRequest,
            DataExchange, AuditLog, MasterIdentity, IdentityMapping, Citizen,
            Workflow, WorkflowStep, ApplicationStatus, ConsentStatus, UserRole
        )

        print("Seeding synthetic demo application APP-2026-1048...")

        # 1. Ensure Citizen User
        user = session.execute(select(User).where(User.email == "citizen@govbridge.demo")).scalar_one_or_none()
        if not user:
            print("Creating citizen user...")
            user = User(
                email="citizen@govbridge.demo",
                full_name="Sunil Patil",
                role=UserRole.CITIZEN,
                phone="+919876543284"
            )
            session.add(user)
            session.flush()

        # 2. Ensure Citizen profile
        citizen = session.execute(select(Citizen).where(Citizen.full_name == "Sunil Patil")).scalar_one_or_none()
        if not citizen:
            citizen = Citizen(
                user_id=user.id,
                full_name="Sunil Patil",
                date_of_birth=datetime(1998, 5, 14),
                gender="MALE",
                state="Maharashtra",
                district="Pune",
                pincode="411030",
                is_verified=True
            )
            session.add(citizen)
            session.flush()
        else:
            citizen.user_id = user.id
            session.flush()

        # 3. Ensure Master Identity MAHA-CIT-10284
        master_id = session.execute(select(MasterIdentity).where(MasterIdentity.master_uid == "MAHA-CIT-10284")).scalar_one_or_none()
        if not master_id:
            master_id = MasterIdentity(
                citizen_id=citizen.id,
                master_uid="MAHA-CIT-10284",
                confidence_score=0.99,
                is_verified=True,
                verified_at=datetime.now(timezone.utc)
            )
            session.add(master_id)
            session.flush()

        # 4. Ensure Federated Identity Mappings for MAHA-CIT-10284
        mappings_data = [
            ("education", "EDU-MH-2021-8842", "education_degree_v1"),
            ("employment", "EMP-49382", "employment_status_v1"),
            ("skill", "SKILL-CERT-8841", "msde_cert_v1"),
            ("revenue", "PAN-ABCDE1234F", "revenue_pan_v1"),
            ("welfare", "BOCW-2024-9912", "welfare_direct_v1"),
        ]
        for sys_code, src_id, schema_code in mappings_data:
            existing = session.execute(
                select(IdentityMapping).where(
                    IdentityMapping.master_identity_id == master_id.id,
                    IdentityMapping.source_system == sys_code
                )
            ).scalar_one_or_none()
            if not existing:
                mapping = IdentityMapping(
                    master_identity_id=master_id.id,
                    source_system=sys_code,
                    source_id=src_id,
                    source_schema=schema_code,
                    is_active=True
                )
                session.add(mapping)
        session.flush()

        # 5. Ensure Demo Workflow exists
        workflow = session.execute(
            select(Workflow).where(Workflow.code == "WF-UNIFIED-SKILL-01")
        ).scalar_one_or_none()
        if not workflow:
            workflow = Workflow(
                name="Unified Skill & Employment Benefit Application",
                code="WF-UNIFIED-SKILL-01",
                version="1.0",
                description="Cross-department orchestration pipeline for skill certification, education, employment, and income verification.",
                is_active=True
            )
            session.add(workflow)
            session.flush()

        # 6. Check if APP-2026-1048 already exists
        app_1048 = session.execute(
            select(Application).where(Application.reference_number == "APP-2026-1048")
        ).scalar_one_or_none()

        now = datetime.now(timezone.utc)
        start_time = now - timedelta(hours=2)

        form_data = {
            "applicant_name": "Sunil Patil",
            "date_of_birth": "1998-05-14",
            "gender": "MALE",
            "mobile": "+919876543284",
            "email": "sunil.patil@example.gov.in",
            "address": "42, Shaniwar Peth, Pune, Maharashtra 411030",
            "master_citizen_id": "MAHA-CIT-10284",
            "citizen_uid": "MAHA-CIT-10284",
            "highest_qualification": "B.Tech Computer Science (2021)",
            "institution": "Pune Institute of Technology",
            "education_id": "EDU-MH-2021-8842",
            "skill_cert_id": "SKILL-CERT-8841",
            "skill_course": "Advanced Python & Cloud Infrastructure",
            "employment_id": "EMP-49382",
            "pan_number": "PAN-ABCDE1234F",
            "annual_income": 180000,
            "bocw_id": "BOCW-2024-9912",
            "benefit_requested": "National Apprenticeship Promotion Scheme (NAPS) Monthly Stipend",
            "disbursal_channel": "Direct Benefit Transfer (DBT)",
            "bank_account_verified": True
        }

        if app_1048:
            print("APP-2026-1048 exists. Refreshing steps and results...")
            app = app_1048
            app.status = ApplicationStatus.COMPLETED
            app.form_data = form_data
            app.resolved_at = start_time + timedelta(minutes=15)
        else:
            app = Application(
                reference_number="APP-2026-1048",
                citizen_id=user.id,
                workflow_id=workflow.id,
                department_id=workflow.department_id,
                status=ApplicationStatus.COMPLETED,
                title="Unified Skill & Employment Benefit Application - Sunil Patil",
                form_data=form_data,
                current_step=11,
                submitted_at=start_time,
                resolved_at=start_time + timedelta(minutes=15)
            )
            session.add(app)
            session.flush()

        # Delete old steps for APP-2026-1048 to recreate clean demo state
        session.query(ApplicationStep).filter(ApplicationStep.application_id == app.id).delete()
        session.query(Consent).filter(Consent.application_id == app.id).delete()
        session.query(AuditLog).filter(AuditLog.application_id == app.id).delete()
        session.flush()

        # 7. Create DPDP Consent record
        req_cats = ["identity", "education", "skill", "employment", "revenue", "welfare"]
        consent = Consent(
            application_id=app.id,
            citizen_id=user.id,
            purpose="Unified Skill & Employment Benefit Application Verification",
            data_categories=req_cats,
            requested_data=req_cats,
            status=ConsentStatus.ACTIVE,
            granted_at=start_time + timedelta(seconds=12),
            expires_at=start_time + timedelta(days=90)
        )
        session.add(consent)
        session.flush()

        # Consent data requests
        from app.models.models import Connector
        conn_objs = session.query(Connector).limit(5).all()
        for c_obj in conn_objs:
            session.add(ConsentDataRequest(
                consent_id=consent.id,
                connector_id=c_obj.id,
                data_field="profile_and_verification_data",
                is_approved=True
            ))

        # 8. Create All 11 Application Steps with rich payloads & CDM
        steps_spec = [
            (
                1,
                "Application Created",
                "COMPLETED",
                start_time,
                start_time + timedelta(seconds=5),
                {
                    "step_type": "lifecycle",
                    "reference_number": "APP-2026-1048",
                    "submitted_by": "Sunil Patil",
                    "citizen_uid": "MAHA-CIT-10284",
                    "channel": "GovBridge Unified Portal"
                }
            ),
            (
                2,
                "Identity Verification",
                "COMPLETED",
                start_time + timedelta(seconds=6),
                start_time + timedelta(seconds=15),
                {
                    "verified": True,
                    "protocol": "REST / JSON",
                    "connector": "state_identity_authority",
                    "endpoint": "http://127.0.0.1:8001/api/identity/verify",
                    "latency_ms": 38,
                    "payload": {
                        "uid": "MAHA-CIT-10284",
                        "name": "Sunil Patil",
                        "dob": "1998-05-14",
                        "gender": "MALE",
                        "state": "Maharashtra",
                        "district": "Pune",
                        "is_verified": True
                    },
                    "cdm": {
                        "entity_type": "CITIZEN_IDENTITY",
                        "master_id": "MAHA-CIT-10284",
                        "trust_level": "LEVEL_4_BIOMETRIC_KYC",
                        "verified_at": "2026-09-26T08:18:50Z"
                    }
                }
            ),
            (
                3,
                "Consent Validation",
                "COMPLETED",
                start_time + timedelta(seconds=16),
                start_time + timedelta(seconds=22),
                {
                    "consent_granted": True,
                    "dpdp_compliant": True,
                    "consent_id": str(consent.id),
                    "data_categories": ["identity", "education", "skill", "employment", "revenue", "welfare"],
                    "purpose": "Unified Skill & Employment Benefit Application Verification",
                    "granted_at": (start_time + timedelta(seconds=12)).isoformat(),
                    "expires_at": (start_time + timedelta(days=90)).isoformat(),
                    "revocable": True
                }
            ),
            (
                4,
                "Education Verification",
                "COMPLETED",
                start_time + timedelta(seconds=23),
                start_time + timedelta(seconds=35),
                {
                    "verified": True,
                    "protocol": "REST / JSON",
                    "connector": "higher_education_dept",
                    "endpoint": "http://127.0.0.1:8002/api/education/verify",
                    "latency_ms": 52,
                    "education": {
                        "education_id": "EDU-MH-2021-8842",
                        "institution": "Pune Institute of Technology",
                        "degree": "Bachelor of Technology (B.Tech)",
                        "branch": "Computer Science & Engineering",
                        "year_of_passing": 2021,
                        "cgpa": 8.7,
                        "division": "First Class with Distinction",
                        "is_verified": True
                    },
                    "cdm": {
                        "person_id": "MAHA-CIT-10284",
                        "highest_degree": "B.Tech Computer Science",
                        "completion_year": 2021,
                        "accreditation": "AICTE / NAAC A++",
                        "schema_version": "govbridge.cdm.education.v1"
                    }
                }
            ),
            (
                5,
                "Skill Verification",
                "COMPLETED",
                start_time + timedelta(seconds=36),
                start_time + timedelta(seconds=55),
                {
                    "verified": True,
                    "protocol": "SOAP / XML",
                    "connector": "skill_development_mission",
                    "endpoint": "http://127.0.0.1:8004/ws/SkillVerificationService",
                    "latency_ms": 84,
                    "soap_envelope": "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:msde='http://msde.gov.in/skill/v1'><soapenv:Body><msde:GetSkillCertificationResponse><msde:CitizenId>MAHA-CIT-10284</msde:CitizenId><msde:Certification><msde:Name>Advanced Python & Cloud Infrastructure</msde:Name><msde:Level>NSQF Level 6</msde:Level><msde:CertificateNumber>SKILL-CERT-8841</msde:CertificateNumber><msde:Issuer>National Skill Development Corporation (NSDC)</msde:Issuer><msde:Status>ACTIVE_VALID</msde:Status></msde:Certification></msde:GetSkillCertificationResponse></soapenv:Body></soapenv:Envelope>",
                    "skills": {
                        "CitizenId": "MAHA-CIT-10284",
                        "Certification": [
                            {
                                "Name": "Advanced Python & Cloud Infrastructure",
                                "Level": "NSQF Level 6",
                                "CertificateNumber": "SKILL-CERT-8841",
                                "Issuer": "National Skill Development Corporation (NSDC)",
                                "Status": "ACTIVE_VALID"
                            }
                        ]
                    },
                    "cdm": {
                        "person_id": "MAHA-CIT-10284",
                        "certified_skills": ["Python Development", "Cloud Systems", "Microservices"],
                        "highest_nsqf_level": 6,
                        "validity": "PERPETUAL",
                        "schema_version": "govbridge.cdm.skills.v1"
                    }
                }
            ),
            (
                6,
                "Employment Verification",
                "COMPLETED",
                start_time + timedelta(seconds=56),
                start_time + timedelta(seconds=70),
                {
                    "verified": True,
                    "protocol": "REST / JSON",
                    "connector": "employment_exchange_registry",
                    "endpoint": "http://127.0.0.1:8003/api/employment/status",
                    "latency_ms": 46,
                    "employment": {
                        "employee_id": "EMP-49382",
                        "citizen_uid": "MAHA-CIT-10284",
                        "job_status": "APPRENTICE_TRAINEE",
                        "organization": "Maharashtra IT Infrastructure Corp",
                        "joining_date": "2023-08-15",
                        "employment_type": "APPRENTICESHIP"
                    },
                    "cdm": {
                        "person_id": "MAHA-CIT-10284",
                        "status": "APPRENTICE",
                        "employer_category": "PUBLIC_SECTOR_UNDERTAKING",
                        "schema_version": "govbridge.cdm.employment.v1"
                    }
                }
            ),
            (
                7,
                "Income Verification",
                "COMPLETED",
                start_time + timedelta(seconds=71),
                start_time + timedelta(seconds=85),
                {
                    "verified": True,
                    "protocol": "Database / SQL Direct Adapter",
                    "connector": "revenue_tax_registry",
                    "endpoint": "sqlite:///backend/govbridge_dev.db?table=revenue_records",
                    "latency_ms": 14,
                    "revenue": {
                        "query": "SELECT * FROM revenue_records WHERE uid = 'MAHA-CIT-10284'",
                        "pan": "PAN-ABCDE1234F",
                        "declared_annual_income": 180000,
                        "assessment_year": "2024-25",
                        "tax_payer_status": "BELOW_TAXABLE_LIMIT",
                        "ews_eligible": True
                    },
                    "cdm": {
                        "person_id": "MAHA-CIT-10284",
                        "verified_annual_income_inr": 180000,
                        "income_bracket": "LOW_INCOME_APPRENTICE",
                        "schema_version": "govbridge.cdm.revenue.v1"
                    }
                }
            ),
            (
                8,
                "Eligibility Evaluation",
                "COMPLETED",
                start_time + timedelta(seconds=86),
                start_time + timedelta(seconds=95),
                {
                    "eligible": True,
                    "recommendation": "APPROVE",
                    "rules_evaluated": {
                        "identity_verified": True,
                        "education_qualification_met": True,
                        "skill_certification_verified": True,
                        "income_under_threshold": True,
                        "threshold_limit": 300000,
                        "actual_income": 180000,
                        "active_apprentice_status": True
                    },
                    "calculated_benefit_monthly": 8000,
                    "scheme_matched": "NAPS-Unified-Stipend-Scheme-2026"
                }
            ),
            (
                9,
                "Department Review",
                "COMPLETED",
                start_time + timedelta(seconds=96),
                start_time + timedelta(seconds=115),
                {
                    "officer_decision": "APPROVED",
                    "reviewed_by": "Rajesh Sharma (Joint Director, Skill & Employment)",
                    "department": "Skill Development and Entrepreneurship Department",
                    "review_notes": "All five registry verifications confirmed. AICTE degree, NSDC NSQF Level 6 certificate, and EWS eligibility authenticated. Sanction recommended.",
                    "timestamp": (start_time + timedelta(seconds=115)).isoformat()
                }
            ),
            (
                10,
                "Decision",
                "COMPLETED",
                start_time + timedelta(seconds=116),
                start_time + timedelta(seconds=125),
                {
                    "decision": "BENEFIT_SANCTIONED",
                    "benefit_amount": 8000,
                    "cadence": "MONTHLY",
                    "duration_months": 12,
                    "total_sanction_value": 96000,
                    "disbursal_channel": "Direct Benefit Transfer (DBT)",
                    "bank_account_pfs": "SBI-A/C-****-4412",
                    "sanction_order_number": "MH-GOV-SANCT-2026-9812"
                }
            ),
            (
                11,
                "Application Completed",
                "COMPLETED",
                start_time + timedelta(seconds=126),
                start_time + timedelta(seconds=130),
                {
                    "status": "SUCCESSFUL",
                    "completion_summary": "Unified cross-department application successfully processed across 5 registries with zero manual document uploads.",
                    "total_execution_time_seconds": 130,
                    "cryptographic_proof_chain": "VALID_AND_SEALED"
                }
            )
        ]

        prev_hash = "GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000"

        for order, name, st, s_time, c_time, res_data in steps_spec:
            # Add step
            app_step = ApplicationStep(
                application_id=app.id,
                step_order=order,
                name=name,
                status=st,
                started_at=s_time,
                completed_at=c_time,
                result_data=res_data
            )
            session.add(app_step)
            session.flush()

            # Create chained Audit Log with SHA-256
            entry_content = f"APP-2026-1048|Step-{order}:{name}|{st}|{c_time.isoformat()}|{prev_hash}"
            curr_hash = generate_sha256(entry_content)

            audit_log = AuditLog(
                user_id=user.id,
                actor="System Orchestrator",
                role="SYSTEM_ORCHESTRATOR",
                action=f"STEP_{order}_{name.upper().replace(' ', '_')}",
                resource_type="APPLICATION_STEP",
                resource_id=str(app_step.id),
                application_id=app.id,
                purpose="Unified Interoperability Verification",
                details=f"Step {order} ({name}) executed successfully with protocol connectors.",
                integrity_hash=curr_hash,
                status="SUCCESS",
                result="SUCCESS",
                ip_address="127.0.0.1",
                user_agent="GovBridge Orchestrator v2.0"
            )
            session.add(audit_log)
            prev_hash = curr_hash

        # Commit everything
        session.commit()
        print(f"SUCCESS: APP-2026-1048 seeded cleanly with ID {app.id} and 11 completed steps.")

    except Exception as e:
        session.rollback()
        print("ERROR seeding APP-2026-1048:", e)
        raise
    finally:
        session.close()

if __name__ == "__main__":
    seed()
