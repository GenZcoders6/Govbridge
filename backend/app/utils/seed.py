"""
Demo data seeder — seeds departments, users, connectors, workflows
NEVER uses real citizen data.
"""
import uuid
import structlog
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import (
    Department, User, UserRole, Connector, ConnectorProtocol,
    ConnectorStatus, Workflow, WorkflowStep, Event, EventSeverity,
    ConnectorHealth
)
from app.security.jwt_handler import hash_password

log = structlog.get_logger()

DEMO_DEPARTMENTS = [
    {"name": "Ministry of Education", "code": "MOE", "ministry": "Education", "description": "Manages educational records and credentials"},
    {"name": "Ministry of Labour & Employment", "code": "MOLE", "ministry": "Labour", "description": "Employment and workforce management"},
    {"name": "Ministry of Skill Development", "code": "MSDE", "ministry": "Skill", "description": "Skill certification and training records"},
    {"name": "Revenue Department", "code": "REV", "ministry": "Finance", "description": "Land records, tax and revenue"},
    {"name": "Social Welfare Department", "code": "SWD", "ministry": "Social Justice", "description": "Welfare schemes and beneficiary management"},
    {"name": "Identity Authority", "code": "IDAUTH", "ministry": "Home Affairs", "description": "National identity registry"},
    {"name": "GovBridge Operations", "code": "GOVOPS", "ministry": "Electronics & IT", "description": "GovBridge platform operations"},
]

DEMO_USERS = [
    {"email": "citizen@govbridge.demo", "full_name": "Demo Citizen", "password": "citizen123", "role": UserRole.CITIZEN, "dept_code": None},
    {"email": "officer@govbridge.demo", "full_name": "Department Officer", "password": "officer123", "role": UserRole.DEPARTMENT_OFFICER, "dept_code": "MOE"},
    {"email": "admin@govbridge.demo", "full_name": "Integration Admin", "password": "admin123", "role": UserRole.INTEGRATION_ADMIN, "dept_code": "GOVOPS"},
    {"email": "auditor@govbridge.demo", "full_name": "System Auditor", "password": "auditor123", "role": UserRole.AUDITOR, "dept_code": "GOVOPS"},
]

from app.core.config import settings

def get_demo_connectors():
    return [
        {
            "name": "Identity Registry",
            "code": "MOCK_IDENTITY",
            "description": "National Identity Registry — REST/JSON (MOCK)",
            "dept_code": "IDAUTH",
            "protocol": ConnectorProtocol.REST_JSON,
            "base_url": settings.MOCK_IDENTITY_URL,
            "is_mock": True,
            "tags": ["identity", "rest", "json"],
        },
        {
            "name": "Education Registry",
            "code": "MOCK_EDUCATION",
            "description": "Academic credentials and certificates — REST/JSON (MOCK)",
            "dept_code": "MOE",
            "protocol": ConnectorProtocol.REST_JSON,
            "base_url": settings.MOCK_EDUCATION_URL,
            "is_mock": True,
            "tags": ["education", "rest", "json"],
        },
        {
            "name": "Employment Registry",
            "code": "MOCK_EMPLOYMENT",
            "description": "Employment records and history — REST/JSON (MOCK)",
            "dept_code": "MOLE",
            "protocol": ConnectorProtocol.REST_JSON,
            "base_url": settings.MOCK_EMPLOYMENT_URL,
            "is_mock": True,
            "tags": ["employment", "rest", "json"],
        },
        {
            "name": "Skill Registry",
            "code": "MOCK_SKILL",
            "description": "Skill certifications — SOAP/XML (MOCK)",
            "dept_code": "MSDE",
            "protocol": ConnectorProtocol.SOAP_XML,
            "base_url": settings.MOCK_SKILL_URL,
            "is_mock": True,
            "tags": ["skill", "soap", "xml"],
        },
        {
            "name": "Revenue Registry",
            "code": "MOCK_REVENUE",
            "description": "Land records and revenue data — DB Connector (MOCK)",
            "dept_code": "REV",
            "protocol": ConnectorProtocol.DATABASE,
            "base_url": settings.MOCK_REVENUE_URL,
            "is_mock": True,
            "tags": ["revenue", "database"],
        },
        {
            "name": "Welfare Registry",
            "code": "MOCK_WELFARE",
            "description": "Welfare scheme beneficiary data — REST/JSON (MOCK)",
            "dept_code": "SWD",
            "protocol": ConnectorProtocol.REST_JSON,
            "base_url": settings.MOCK_WELFARE_URL,
            "is_mock": True,
            "tags": ["welfare", "rest", "json"],
        },
    ]



async def seed_demo_data():
    async with AsyncSessionLocal() as db:
        try:
            # Check if already seeded
            existing = await db.execute(select(Department).where(Department.code == "GOVOPS"))
            if existing.scalar_one_or_none():
                log.info("seed.skip", reason="Already seeded")
                return

            log.info("seed.start")

            # Seed departments
            dept_map = {}
            for d in DEMO_DEPARTMENTS:
                dept = Department(
                    name=d["name"],
                    code=d["code"],
                    ministry=d["ministry"],
                    description=d["description"],
                )
                db.add(dept)
                await db.flush()
                dept_map[d["code"]] = dept

            # Seed users
            for u in DEMO_USERS:
                dept_id = dept_map[u["dept_code"]].id if u["dept_code"] else None
                user = User(
                    email=u["email"],
                    full_name=u["full_name"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"],
                    department_id=dept_id,
                )
                db.add(user)

            await db.flush()

            # Seed connectors
            connector_map = {}
            for c in get_demo_connectors():
                dept_id = dept_map[c["dept_code"]].id
                connector = Connector(
                    name=c["name"],
                    code=c["code"],
                    description=c["description"],
                    department_id=dept_id,
                    protocol=c["protocol"],
                    base_url=c["base_url"],
                    is_mock=c["is_mock"],
                    tags=c["tags"],
                    status=ConnectorStatus.ACTIVE,
                )
                db.add(connector)
                await db.flush()
                connector_map[c["code"]] = connector

                # Add initial health record
                health = ConnectorHealth(
                    connector_id=connector.id,
                    status=ConnectorStatus.ACTIVE,
                    latency_ms=42,
                )
                db.add(health)

            # Seed sample workflows
            wf1 = Workflow(
                name="Scholarship Application",
                code="SCHOLARSHIP_APPLICATION",
                description="End-to-end scholarship application with identity, education and income verification",
                department_id=dept_map["MOE"].id,
                sla_hours=72,
                definition={"type": "sequential", "steps": 5},
            )
            db.add(wf1)
            await db.flush()

            steps1 = [
                WorkflowStep(workflow_id=wf1.id, step_order=1, name="Identity Verification", step_type="data_fetch", connector_id=connector_map["MOCK_IDENTITY"].id),
                WorkflowStep(workflow_id=wf1.id, step_order=2, name="Education Record Check", step_type="data_fetch", connector_id=connector_map["MOCK_EDUCATION"].id),
                WorkflowStep(workflow_id=wf1.id, step_order=3, name="Income/Revenue Verification", step_type="data_fetch", connector_id=connector_map["MOCK_REVENUE"].id),
                WorkflowStep(workflow_id=wf1.id, step_order=4, name="Officer Review", step_type="approval"),
                WorkflowStep(workflow_id=wf1.id, step_order=5, name="Notification & Disbursal", step_type="notification"),
            ]
            for s in steps1:
                db.add(s)

            wf2 = Workflow(
                name="Employment Certificate",
                code="EMPLOYMENT_CERT",
                description="Employment status verification and certificate issuance",
                department_id=dept_map["MOLE"].id,
                sla_hours=48,
                definition={"type": "sequential", "steps": 3},
            )
            db.add(wf2)
            await db.flush()

            steps2 = [
                WorkflowStep(workflow_id=wf2.id, step_order=1, name="Identity Verification", step_type="data_fetch", connector_id=connector_map["MOCK_IDENTITY"].id),
                WorkflowStep(workflow_id=wf2.id, step_order=2, name="Employment Record Fetch", step_type="data_fetch", connector_id=connector_map["MOCK_EMPLOYMENT"].id),
                WorkflowStep(workflow_id=wf2.id, step_order=3, name="Certificate Generation", step_type="generation"),
            ]
            for s in steps2:
                db.add(s)

            wf3 = Workflow(
                name="Welfare Scheme Enrollment",
                code="WELFARE_ENROLLMENT",
                description="Multi-system verification for welfare scheme enrollment",
                department_id=dept_map["SWD"].id,
                sla_hours=120,
                definition={"type": "parallel", "steps": 6},
            )
            db.add(wf3)
            await db.flush()

            steps3 = [
                WorkflowStep(workflow_id=wf3.id, step_order=1, name="Identity Verification", step_type="data_fetch", connector_id=connector_map["MOCK_IDENTITY"].id),
                WorkflowStep(workflow_id=wf3.id, step_order=2, name="Income Verification", step_type="data_fetch", connector_id=connector_map["MOCK_REVENUE"].id),
                WorkflowStep(workflow_id=wf3.id, step_order=3, name="Skill Record Check", step_type="data_fetch", connector_id=connector_map["MOCK_SKILL"].id),
                WorkflowStep(workflow_id=wf3.id, step_order=4, name="Employment Check", step_type="data_fetch", connector_id=connector_map["MOCK_EMPLOYMENT"].id),
                WorkflowStep(workflow_id=wf3.id, step_order=5, name="Eligibility Assessment", step_type="validation"),
                WorkflowStep(workflow_id=wf3.id, step_order=6, name="Approval & Enrollment", step_type="approval"),
            ]
            for s in steps3:
                db.add(s)

            # Seed some demo events
            demo_events = [
                Event(event_type="connector.health_check", source="MOCK_IDENTITY", severity=EventSeverity.INFO, payload={"status": "ok", "latency_ms": 42}),
                Event(event_type="application.submitted", source="GOVBRIDGE_API", severity=EventSeverity.INFO, payload={"workflow": "SCHOLARSHIP_APPLICATION"}),
                Event(event_type="connector.health_check", source="MOCK_EDUCATION", severity=EventSeverity.INFO, payload={"status": "ok", "latency_ms": 55}),
                Event(event_type="connector.error", source="MOCK_REVENUE", severity=EventSeverity.WARNING, payload={"error": "Timeout after 5s", "retry": 1}),
                Event(event_type="workflow.completed", source="GOVBRIDGE_API", severity=EventSeverity.INFO, payload={"workflow": "EMPLOYMENT_CERT"}),
            ]
            for ev in demo_events:
                db.add(ev)

            await db.commit()
            log.info("seed.done")

        except Exception as e:
            await db.rollback()
            log.error("seed.error", error=str(e))
            raise
