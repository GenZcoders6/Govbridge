"""
GovBridge Comprehensive QA & End-to-End Verification Suite
Tests:
1. All 4 Personas Login & RBAC Enforcement
2. Full Primary Flow:
   Login -> New Application -> Consent -> Identity Mapping -> Education REST ->
   Skill SOAP/XML -> Employment REST -> Revenue -> Transformation -> Validation ->
   Workflow Engine -> Redis Event -> Application Tracking -> SHA-256 Audit Trail
3. Failure Flow & Automated Fault Recovery:
   Connector Failure -> Retries (3 attempts) -> Redis Queue -> Exception Registry ->
   Recovery API -> Workflow Resumes & Completes
4. Next.js Frontend Routes Verification
"""
import urllib.request
import urllib.error
import json
import sys
import time

API_BASE = "http://127.0.0.1:8000/api"
FRONTEND_BASE = "http://localhost:3000"

def request_json(url, method="GET", payload=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(content)
            except:
                return resp.status, content
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 500, {"error": str(e)}

def check_frontend(route):
    url = f"{FRONTEND_BASE}{route}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            return resp.status, len(content)
    except urllib.error.HTTPError as e:
        return e.code, 0
    except Exception as e:
        return 500, 0

passed_checks = 0
failed_checks = 0

def check(condition, message):
    global passed_checks, failed_checks
    if condition:
        passed_checks += 1
        print(f"  [PASS] {message}")
    else:
        failed_checks += 1
        print(f"  [FAIL] {message}")

print("=" * 75)
print("GOVBRIDGE COMPREHENSIVE QA & TECHNICAL VALIDATION")
print("=" * 75)

# ======================================================================
# 1. LOGIN & RBAC VERIFICATION
# ======================================================================
print("\n" + "=" * 50)
print("SECTION 1: AUTHENTICATION & RBAC ENFORCEMENT")
print("=" * 50)

personas = {
    "Citizen": ("citizen@govbridge.demo", "citizen123", "CITIZEN"),
    "Officer": ("officer@govbridge.demo", "officer123", "DEPARTMENT_OFFICER"),
    "Admin": ("admin@govbridge.demo", "admin123", "INTEGRATION_ADMIN"),
    "Auditor": ("auditor@govbridge.demo", "auditor123", "AUDITOR"),
}

tokens = {}
for role_name, (email, pwd, expected_role) in personas.items():
    st, data = request_json(f"{API_BASE}/auth/login", method="POST", payload={"email": email, "password": pwd})
    is_ok = st == 200 and "access_token" in data and data.get("user", {}).get("role") == expected_role
    check(is_ok, f"Login as {role_name:<8} ({email}) -> Token received, Role: {data.get('user', {}).get('role')}")
    if is_ok:
        tokens[role_name] = data["access_token"]

citizen_tok = tokens["Citizen"]
officer_tok = tokens["Officer"]
admin_tok = tokens["Admin"]
auditor_tok = tokens["Auditor"]

print("\n--- Verifying RBAC Restrictions ---")
# 1. Citizen accessing Audit Logs -> Should be 403 Forbidden
st_c_audit, _ = request_json(f"{API_BASE}/audit", token=citizen_tok)
check(st_c_audit == 403, f"Citizen accessing /api/audit -> Blocked with HTTP {st_c_audit} (Expected 403)")

# 2. Auditor accessing Audit Logs -> Should be 200 OK
st_a_audit, _ = request_json(f"{API_BASE}/audit", token=auditor_tok)
check(st_a_audit == 200, f"Auditor accessing /api/audit -> Allowed with HTTP {st_a_audit} (Expected 200)")

# 3. Citizen triggering Connector Health Check -> Should be 403 Forbidden
# Get any connector id
_, conns = request_json(f"{API_BASE}/connectors", token=officer_tok)
sample_conn_id = conns[0]["id"] if conns else None
if sample_conn_id:
    st_c_hc, _ = request_json(f"{API_BASE}/connectors/{sample_conn_id}/health-check", method="POST", token=citizen_tok)
    check(st_c_hc == 403, f"Citizen triggering connector health check -> Blocked with HTTP {st_c_hc} (Expected 403)")

    st_o_hc, _ = request_json(f"{API_BASE}/connectors/{sample_conn_id}/health-check", method="POST", token=officer_tok)
    check(st_o_hc == 200, f"Officer triggering connector health check -> Allowed with HTTP {st_o_hc} (Expected 200)")

# 4. Officer accessing User Administration -> Should be 403 Forbidden
st_o_users, _ = request_json(f"{API_BASE}/users", token=officer_tok)
check(st_o_users == 403, f"Officer accessing /api/users -> Blocked with HTTP {st_o_users} (Expected 403)")

# 5. Admin accessing User Administration -> Should be 200 OK
st_adm_users, _ = request_json(f"{API_BASE}/users", token=admin_tok)
check(st_adm_users == 200, f"Admin accessing /api/users -> Allowed with HTTP {st_adm_users} (Expected 200)")


# ======================================================================
# 2. PRIMARY END-TO-END FLOW
# ======================================================================
print("\n" + "=" * 50)
print("SECTION 2: PRIMARY INTEROPERABILITY WORKFLOW")
print("=" * 50)

# Step 1: New Application
app_payload = {
    "full_name": "Sunil Patil",
    "mobile": "+919876543284",
    "master_citizen_id": "MAHA-CIT-10284",
    "service": "Unified Skill & Employment Benefit Application",
    "form_data": {
        "full_name": "Sunil Patil",
        "mobile": "+919876543284",
        "master_citizen_id": "MAHA-CIT-10284",
        "citizen_uid": "MAHA-CIT-10284",
    }
}
st, new_app = request_json(f"{API_BASE}/applications", method="POST", payload=app_payload, token=citizen_tok)
check(st in (200, 201) and "id" in new_app, f"Application Submitted -> ID: {new_app.get('id')} Ref: {new_app.get('reference_number')}")
primary_app_id = new_app.get("id")

# Step 2: Consent
consent_payload = {
    "application_id": primary_app_id,
    "purpose": "Unified Skill & Employment Benefit Verification",
    "requested_data": ["identity", "education", "skill", "employment", "revenue"],
    "data_categories": ["identity", "education", "skill", "employment", "revenue"],
    "expires_in_days": 60,
}
st_c, c_res = request_json(f"{API_BASE}/consent", method="POST", payload=consent_payload, token=citizen_tok)
check(st_c in (200, 201) and c_res.get("status") == "ACTIVE", f"Consent Granted -> ID: {c_res.get('id')} Status: {c_res.get('status')}")

# Step 3: Identity & Mapping Resolution
st_id, id_profile = request_json(f"{API_BASE}/identity/MAHA-CIT-10284", token=citizen_tok)
check(st_id == 200 and id_profile.get("master_citizen_id") == "MAHA-CIT-10284", f"Identity Resolved -> Name: {id_profile.get('full_name')} Masked Phone: {id_profile.get('masked_phone')}")

st_map, mappings = request_json(f"{API_BASE}/identity/MAHA-CIT-10284/mappings", token=citizen_tok)
check(st_map == 200 and len(mappings) >= 5, f"Federated Identity Mappings -> {len(mappings)} departmental registries linked")

# Step 4: Run Primary Workflow
print("\n--- Executing Multi-Department Orchestration ---")
st_wf, wf_result = request_json(
    f"{API_BASE}/workflows/{primary_app_id}/start",
    method="POST",
    payload={"citizen_uid": "MAHA-CIT-10284"},
    token=citizen_tok
)
check(st_wf == 200 and wf_result.get("status") == "COMPLETED", f"Workflow Orchestration Completed -> Status: {wf_result.get('status')} Decision: {wf_result.get('decision')}")

# Step 5: Verify Application Timeline, Steps, CDM Transformation & Validation
st_tl, tl_data = request_json(f"{API_BASE}/applications/{primary_app_id}/timeline", token=citizen_tok)
check(tl_data.get("current_step") == 11 and tl_data.get("status") == "COMPLETED", f"Application Timeline -> Current Step: {tl_data.get('current_step')}/11, Status: {tl_data.get('status')}")

st_steps, steps_list = request_json(f"{API_BASE}/applications/{primary_app_id}/steps", token=citizen_tok)
step_map = {s["name"]: s for s in steps_list}

# Check Education REST & CDM
edu_step = step_map.get("Education Verification", {})
edu_cdm = (edu_step.get("result_data") or {}).get("cdm")
check(edu_step.get("status") == "COMPLETED" and edu_cdm is not None, f"Education REST Verification -> Status: {edu_step.get('status')}, CDM Type: Education")

# Check Skill SOAP/XML & CDM
skill_step = step_map.get("Skill Verification", {})
skill_cdm = (skill_step.get("result_data") or {}).get("cdm")
check(skill_step.get("status") == "COMPLETED" and skill_cdm is not None, f"Skill SOAP/XML Verification -> Status: {skill_step.get('status')}, CDM Type: Skill")

# Check Employment REST & CDM
emp_step = step_map.get("Employment Verification", {})
emp_cdm = (emp_step.get("result_data") or {}).get("cdm")
check(emp_step.get("status") == "COMPLETED" and emp_cdm is not None, f"Employment REST Verification -> Status: {emp_step.get('status')}, CDM Type: Employment")

# Check Income Verification & CDM
rev_step = step_map.get("Income Verification", {})
rev_cdm = (rev_step.get("result_data") or {}).get("cdm")
check(rev_step.get("status") == "COMPLETED" and rev_cdm is not None, f"Revenue/Income Verification -> Status: {rev_step.get('status')}, CDM Type: Revenue")

# Check Decision
dec_step = step_map.get("Decision", {})
decision_val = (dec_step.get("result_data") or {}).get("decision")
check(decision_val == "BENEFIT_SANCTIONED", f"Decision Step -> Result: {decision_val} (Amount: INR 12,000 via DBT)")

# Step 6: Verify Redis Events
st_ev, events = request_json(f"{API_BASE}/events?application_id={primary_app_id}&limit=50", token=officer_tok)
check(st_ev == 200 and len(events) >= 5, f"Redis Events Logged -> Found {len(events)} events for application")
event_types = [e.get("event_type") for e in events]
print(f"    Events emitted: {', '.join(event_types[:6])}")

# Step 7: Verify SHA-256 Audit Trail
st_aud, audit_entries = request_json(f"{API_BASE}/audit?application_id={primary_app_id}&limit=50", token=auditor_tok)
check(st_aud == 200 and len(audit_entries) >= 4, f"Cryptographic Audit Trail -> Found {len(audit_entries)} audit entries")
if audit_entries:
    first_audit_id = audit_entries[0]["id"]
    st_v, v_res = request_json(f"{API_BASE}/audit/{first_audit_id}/verify", token=auditor_tok)
    is_valid = v_res.get("verified") if isinstance(v_res, dict) else False
    check(is_valid, f"SHA-256 Hash Verification -> Integrity: Verified True (Hash: {str(v_res.get('calculated_hash', ''))[:16]}...)")


# ======================================================================
# 3. CONNECTOR FAILURE & AUTOMATED RECOVERY FLOW
# ======================================================================
print("\n" + "=" * 50)
print("SECTION 3: CONNECTOR FAILURE & FAULT RECOVERY PIPELINE")
print("=" * 50)

# Submit a second application specifically to test connector fault tolerance
fail_payload = {
    "full_name": "Ramesh Kumar",
    "mobile": "+919876543210",
    "master_citizen_id": "MAHA-CIT-10284",
    "service": "Unified Skill & Employment Benefit Application",
    "form_data": {
        "full_name": "Ramesh Kumar",
        "citizen_uid": "MAHA-CIT-10284",
    }
}
st, fail_app = request_json(f"{API_BASE}/applications", method="POST", payload=fail_payload, token=citizen_tok)
fail_app_id = fail_app.get("id")
print(f"Created Test Application for Failure Simulation: {fail_app_id}")

# Run workflow with simulated connector failure on MOCK_EMPLOYMENT
print("\n--- Triggering Workflow with Simulated Employment Connector Failure ---")
st_fail, fail_res = request_json(
    f"{API_BASE}/workflows/{fail_app_id}/start",
    method="POST",
    payload={"citizen_uid": "MAHA-CIT-10284", "simulate_failure_connector": "MOCK_EMPLOYMENT", "max_retries": 3},
    token=citizen_tok
)
check(fail_res.get("status") == "QUEUED", f"Workflow Failure Handling -> State transitioned to {fail_res.get('status')}")

# Verify Retries & SystemException
st_exc, exc_list = request_json(f"{API_BASE}/exceptions?application_id={fail_app_id}", token=officer_tok)
check(st_exc == 200 and len(exc_list) >= 1, f"Exception Registry -> Found {len(exc_list)} exception(s) recorded")
if exc_list:
    exc_obj = exc_list[0]
    check(exc_obj.get("status") == "QUEUED" and exc_obj.get("retry_count") == 3, f"Exception Metadata -> Status: {exc_obj.get('status')}, Retry Attempts: {exc_obj.get('retry_count')}, Source: {exc_obj.get('source')}")

# Verify Events emitted for retries
st_fev, fail_events = request_json(f"{API_BASE}/events?application_id={fail_app_id}&limit=20", token=officer_tok)
retry_events = [e for e in fail_events if e.get("event_type") == "RETRY_STARTED"]
check(len(retry_events) == 3, f"Redis Event Retries -> Verified 3 RETRY_STARTED events published")

# Trigger Recovery: POST /api/workflows/{id}/retry
print("\n--- Initiating Automated Recovery Pipeline ---")
st_rec, rec_res = request_json(f"{API_BASE}/workflows/{fail_app_id}/retry", method="POST", token=officer_tok)
check(st_rec == 200 and rec_res.get("status") == "COMPLETED", f"Automated Recovery Executed -> Status: {rec_res.get('status')}, Recovered: {rec_res.get('recovered')}")

# Verify Exception marked RESOLVED
st_exc2, exc_list2 = request_json(f"{API_BASE}/exceptions?application_id={fail_app_id}", token=officer_tok)
if exc_list2:
    check(exc_list2[0].get("status") == "RESOLVED", f"Exception Resolution -> Status updated to {exc_list2[0].get('status')}")

# Verify Application completed
st_app2, app2_obj = request_json(f"{API_BASE}/applications/{fail_app_id}", token=citizen_tok)
check(app2_obj.get("status") == "COMPLETED" and app2_obj.get("current_step") == 11, f"Recovered Application State -> Status: {app2_obj.get('status')}, Current Step: {app2_obj.get('current_step')}/11")


# ======================================================================
# 4. FRONTEND ROUTE ACCESSIBILITY
# ======================================================================
print("\n" + "=" * 50)
print("SECTION 4: FRONTEND APPLICATION ROUTES")
print("=" * 50)

routes = [
    "/login",
    "/dashboard",
    "/applications",
    "/applications/new",
    f"/applications/{primary_app_id}",
    "/consents",
    "/identity",
    "/connectors",
    "/workflows",
    "/exceptions",
    "/events",
    "/audit",
]

for r in routes:
    status, length = check_frontend(r)
    is_ok = status == 200 and length > 500
    check(is_ok, f"Route {r:<35} -> HTTP {status} ({length} bytes)")

print("\n" + "=" * 75)
print(f"FINAL TECHNICAL QA REPORT: {passed_checks} PASSED, {failed_checks} FAILED")
print("=" * 75)

if failed_checks > 0:
    sys.exit(1)
else:
    sys.exit(0)
