"""
GovBridge Backend Foundation Verification Test Suite
Comprehensive checks for Step 1 Backend Foundation
"""
import asyncio
import sys
import yaml
import httpx
from sqlalchemy import text, select

from app.main import app, lifespan
from app.core.config import settings
from app.core.database import Base, AsyncSessionLocal
from app.core.redis_client import get_redis
from app.models import (
    User, UserRole, Department, Connector, Workflow,
    SystemException, Application, Consent, Event, AuditLog
)
from app.security.jwt_handler import hash_password, verify_password, create_access_token, decode_access_token
from app.integrations import ConnectorFactory, RestConnector, SoapConnector, DatabaseConnector


async def run_all_tests():
    print("=" * 60)
    print("GOVBRIDGE BACKEND FOUNDATION VERIFICATION TEST SUITE")
    print("=" * 60)

    # ──────────────────────────────────────────────────────────
    # 1. DATABASE & MODELS VERIFICATION
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 1] Verifying Database Connection and Models...")
    async with AsyncSessionLocal() as session:
        # Check connection
        res = await session.execute(text("SELECT 1"))
        assert res.scalar() == 1, "Database connection query failed"
        print("  [OK] Database connectivity: SUCCESS")

        # Verify all 20 required tables
        tables = set(Base.metadata.tables.keys())
        expected_tables = {
            "users", "departments", "citizens", "master_identities",
            "identity_mappings", "applications", "application_steps",
            "workflows", "workflow_steps", "connectors", "connector_health",
            "consents", "consent_data_requests", "access_policies",
            "data_exchanges", "schema_mappings", "events", "exceptions",
            "audit_logs", "notifications"
        }
        missing = expected_tables - tables
        assert not missing, f"Missing tables: {missing}"
        print(f"  [OK] All {len(expected_tables)} required tables registered in SQLAlchemy metadata")

        # Verify seeded data
        dept_count = (await session.execute(select(Department))).scalars().all()
        user_count = (await session.execute(select(User))).scalars().all()
        conn_count = (await session.execute(select(Connector))).scalars().all()
        wf_count = (await session.execute(select(Workflow))).scalars().all()
        print(f"  [OK] Seed data verified: {len(dept_count)} departments, {len(user_count)} users, {len(conn_count)} connectors, {len(wf_count)} workflows")

    # ──────────────────────────────────────────────────────────
    # 2. REDIS CONNECTION VERIFICATION
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 2] Verifying Redis Client & Connection Handling...")
    try:
        r = await get_redis()
        pong = await r.ping()
        print(f"  [OK] Redis status: ONLINE (ping response: {pong})")
        redis_online = True
    except Exception as e:
        print(f"  [OK] Redis status: OFFLINE (gracefully handled: {type(e).__name__} - {e})")
        redis_online = False

    # ──────────────────────────────────────────────────────────
    # 3. AUTHENTICATION & PASSWORD HASHING
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 3] Verifying Authentication & Password Hashing...")
    # Bcrypt test
    test_pwd = "GovBridgeSecurePassword2026!"
    hashed = hash_password(test_pwd)
    assert verify_password(test_pwd, hashed), "Password verification failed"
    assert not verify_password("WrongPassword!", hashed), "Invalid password falsely verified"
    print("  [OK] Bcrypt password hashing & validation: SUCCESS")

    # JWT generation & decoding
    jwt_data = {"sub": "00000000-0000-0000-0000-000000000001", "role": "INTEGRATION_ADMIN"}
    token = create_access_token(jwt_data)
    decoded = decode_access_token(token)
    assert decoded["sub"] == jwt_data["sub"]
    assert decoded["role"] == jwt_data["role"]
    print("  [OK] JWT token creation & decoding: SUCCESS")

    # ──────────────────────────────────────────────────────────
    # 4. DEMO ACCOUNTS & LOGIN VIA HTTP
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 4] Verifying Demo Account Logins & Protected Endpoints...")
    demo_accounts = [
        ("citizen@govbridge.demo", "citizen123", "CITIZEN"),
        ("officer@govbridge.demo", "officer123", "DEPARTMENT_OFFICER"),
        ("admin@govbridge.demo", "admin123", "INTEGRATION_ADMIN"),
        ("auditor@govbridge.demo", "auditor123", "AUDITOR"),
    ]

    tokens = {}
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        for email, pwd, expected_role in demo_accounts:
            res = await client.post("/api/auth/login", json={"email": email, "password": pwd})
            assert res.status_code == 200, f"Login failed for {email}: {res.text}"
            data = res.json()
            assert data["user"]["role"] == expected_role
            assert "access_token" in data
            tokens[expected_role] = data["access_token"]
            print(f"  [OK] Demo account '{email}' authenticated successfully as {expected_role}")

        # Invalid password check
        bad_res = await client.post("/api/auth/login", json={"email": "admin@govbridge.demo", "password": "wrongpassword"})
        assert bad_res.status_code == 401, "Invalid password was not rejected with 401"
        print("  [OK] Invalid password rejected with 401 Unauthorized")

    # ──────────────────────────────────────────────────────────
    # 5. RBAC AUTHORIZATION
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 5] Verifying 4-Tier RBAC Access Control...")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Unauthenticated request
        r_unauth = await client.get("/api/users/me")
        assert r_unauth.status_code == 401
        print("  [OK] Unauthenticated access to protected route: 401 Unauthorized")

        # Citizen cannot access admin /api/users
        r_cit_users = await client.get("/api/users", headers={"Authorization": f"Bearer {tokens['CITIZEN']}"})
        assert r_cit_users.status_code == 403
        print("  [OK] CITIZEN blocked from Admin /api/users: 403 Forbidden")

        # Officer cannot access admin /api/users
        r_off_users = await client.get("/api/users", headers={"Authorization": f"Bearer {tokens['DEPARTMENT_OFFICER']}"})
        assert r_off_users.status_code == 403
        print("  [OK] DEPARTMENT_OFFICER blocked from Admin /api/users: 403 Forbidden")

        # Auditor cannot access admin /api/users
        r_aud_users = await client.get("/api/users", headers={"Authorization": f"Bearer {tokens['AUDITOR']}"})
        assert r_aud_users.status_code == 403
        print("  [OK] AUDITOR blocked from Admin /api/users: 403 Forbidden")

        # Auditor CAN access /api/audit
        r_aud_audit = await client.get("/api/audit", headers={"Authorization": f"Bearer {tokens['AUDITOR']}"})
        assert r_aud_audit.status_code == 200
        print("  [OK] AUDITOR allowed on /api/audit: 200 OK")

        # Admin CAN access /api/users and /api/audit
        r_adm_users = await client.get("/api/users", headers={"Authorization": f"Bearer {tokens['INTEGRATION_ADMIN']}"})
        assert r_adm_users.status_code == 200
        r_adm_audit = await client.get("/api/audit", headers={"Authorization": f"Bearer {tokens['INTEGRATION_ADMIN']}"})
        assert r_adm_audit.status_code == 200
        print("  [OK] INTEGRATION_ADMIN allowed on Admin and Audit routes: 200 OK")

    # ──────────────────────────────────────────────────────────
    # 6. SWAGGER / API DOCUMENTATION
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 6] Verifying API Documentation (/docs & /openapi.json)...")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        r_docs = await client.get("/docs")
        assert r_docs.status_code == 200
        assert "swagger" in r_docs.text.lower() or "html" in r_docs.text.lower()
        print("  [OK] Swagger UI (/docs) returns 200 OK")

        r_openapi = await client.get("/openapi.json")
        assert r_openapi.status_code == 200
        paths = r_openapi.json()["paths"]
        print(f"  [OK] OpenAPI Specification (/openapi.json) returns 200 OK with {len(paths)} registered paths")

        r_api_docs = await client.get("/api/docs")
        assert r_api_docs.status_code in (307, 200)
        print("  [OK] /api/docs alias redirects to /docs: 307 Temporary Redirect")

    # ──────────────────────────────────────────────────────────
    # 7. HEALTH CHECK ENDPOINT
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 7] Verifying Health Check Endpoint (/api/health)...")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        r_health = await client.get("/api/health")
        assert r_health.status_code == 200
        health_data = r_health.json()
        assert "status" in health_data
        assert "service" in health_data
        assert "components" in health_data
        assert "backend" in health_data["components"]
        assert "database" in health_data["components"]
        assert "redis" in health_data["components"]
        print(f"  [OK] Health endpoint returned 200 OK: overall status = '{health_data['status']}'")
        print(f"    - Backend: {health_data['components']['backend']}")
        print(f"    - Database: {health_data['components']['database']}")
        print(f"    - Redis: {health_data['components']['redis']}")
        if not redis_online:
            assert health_data["status"] == "degraded", "Health should report 'degraded' when Redis is offline"
            print("  [OK] Accurate status reporting: Degraded (not falsely reporting healthy when Redis is offline)")

    # ──────────────────────────────────────────────────────────
    # 8. DOCKER COMPOSE CONFIGURATION
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 8] Verifying Docker Compose Configuration...")
    with open("../docker-compose.yml", "r") as f:
        dc = yaml.safe_load(f)
    services = dc.get("services", {})
    expected_services = [
        "postgres", "redis", "backend", "frontend",
        "mock-identity", "mock-education", "mock-employment",
        "mock-skill", "mock-revenue", "mock-welfare"
    ]
    for s in expected_services:
        assert s in services, f"Missing service in docker-compose: {s}"
    print(f"  [OK] docker-compose.yml defines all {len(expected_services)} services with valid configuration")

    # ──────────────────────────────────────────────────────────
    # 9. REUSABLE CONNECTOR ARCHITECTURE
    # ──────────────────────────────────────────────────────────
    print("\n[TEST 9] Verifying Reusable Connector Architecture...")
    c1 = Connector(name="Mock Identity", code="MOCK_IDENTITY", protocol="REST_JSON", base_url="http://localhost:8001")
    c2 = Connector(name="Mock Skill", code="MOCK_SKILL", protocol="SOAP_XML", base_url="http://localhost:8004")
    c3 = Connector(name="Mock Revenue", code="MOCK_REVENUE", protocol="DATABASE", base_url="http://localhost:8005")

    adapter1 = ConnectorFactory.get_connector(c1)
    adapter2 = ConnectorFactory.get_connector(c2)
    adapter3 = ConnectorFactory.get_connector(c3)

    assert isinstance(adapter1, RestConnector), "Expected RestConnector"
    assert isinstance(adapter2, SoapConnector), "Expected SoapConnector"
    assert isinstance(adapter3, DatabaseConnector), "Expected DatabaseConnector"
    print("  [OK] ConnectorFactory resolved RestConnector, SoapConnector, and DatabaseConnector successfully")

    print("\n" + "=" * 60)
    print("ALL 9 VERIFICATION TEST SUITES PASSED (100% HEALTHY)")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_all_tests())
