"""
End-to-End Integration Verification Script
Verifies all backend APIs and frontend routes requested in SIH26129.
"""
import urllib.request
import urllib.error
import json
import sys

API_BASE = "http://127.0.0.1:8000/api"
FRONTEND_BASE = "http://localhost:3000"

def request_json(url, method="GET", payload=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body

def check_frontend(route):
    url = f"{FRONTEND_BASE}{route}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            return resp.status, len(content)
    except urllib.error.HTTPError as e:
        return e.code, 0

print("=" * 70)
print("GOVBRIDGE FULL INTEGRATION VERIFICATION")
print("=" * 70)

# 1. Frontend Route Accessibility
frontend_routes = [
    "/login",
    "/dashboard",
    "/applications",
    "/applications/new",
    "/consents",
    "/identity",
    "/connectors",
    "/workflows",
    "/exceptions",
    "/events",
    "/audit",
]
print("\n--- [1] Checking Frontend Routes on Next.js ---")
all_routes_ok = True
for r in frontend_routes:
    status, length = check_frontend(r)
    is_ok = status == 200 and length > 500
    print(f"  {r:<25} -> Status: {status} (Bytes: {length}) {'[OK]' if is_ok else '[FAIL]'}")
    if not is_ok:
        all_routes_ok = False

# 2. Authentication with all 4 personas
print("\n--- [2] Checking Authentication (4 Demo Personas) ---")
personas = {
    "Citizen": ("citizen@govbridge.demo", "citizen123"),
    "Officer": ("officer@govbridge.demo", "officer123"),
    "Admin": ("admin@govbridge.demo", "admin123"),
    "Auditor": ("auditor@govbridge.demo", "auditor123"),
}

tokens = {}
for role_name, (email, pwd) in personas.items():
    st, data = request_json(f"{API_BASE}/auth/login", method="POST", payload={"email": email, "password": pwd})
    if st == 200 and "access_token" in data:
        tokens[role_name] = data["access_token"]
        print(f"  {role_name:<10} ({email}) -> OK (Role: {data['user']['role']})")
    else:
        print(f"  {role_name:<10} ({email}) -> FAILED: {st} {data}")

citizen_tok = tokens.get("Citizen")
officer_tok = tokens.get("Officer")
admin_tok = tokens.get("Admin")

# 3. New Application Submission
print("\n--- [3] New Application Submission (Unified Skill & Employment Benefit) ---")
app_payload = {
    "full_name": "Ramesh Kumar",
    "mobile": "9876543210",
    "master_citizen_id": "MAHA-CIT-10284",
    "service": "Unified Skill & Employment Benefit Application",
    "form_data": {
        "full_name": "Ramesh Kumar",
        "mobile": "9876543210",
        "master_citizen_id": "MAHA-CIT-10284",
    }
}
st, app_res = request_json(f"{API_BASE}/applications", method="POST", payload=app_payload, token=citizen_tok)
app_id = None
if st in (200, 201):
    app_id = app_res.get("id")
    ref = app_res.get("reference_number")
    st_name = app_res.get("status")
    print(f"  Created Application ID: {app_id}")
    print(f"  Reference Number: {ref}")
    print(f"  Status: {st_name}")
else:
    print(f"  Application submission failed: {st} {app_res}")

# 4. Application Tracking & Timeline
if app_id:
    print("\n--- [4] Application Tracking & Timeline ---")
    st, track_res = request_json(f"{API_BASE}/applications/{app_id}", token=citizen_tok)
    print(f"  GET /api/applications/{app_id} -> Status: {track_res.get('status')}")
    st_tl, tl_res = request_json(f"{API_BASE}/applications/{app_id}/timeline", token=citizen_tok)
    print(f"  GET /api/applications/{app_id}/timeline -> Total Steps: {tl_res.get('total_steps')}, Current Step: {tl_res.get('current_step')}")
    for s in tl_res.get("timeline", [])[:3]:
        print(f"    Step {s.get('step_order')}: {s.get('name')} [{s.get('status')}]")

    # Run Workflow Orchestration
    print("\n--- [4b] Workflow Execution ---")
    st_wf, wf_res = request_json(f"{API_BASE}/workflows/{app_id}/start", method="POST", payload={"citizen_uid": "MAHA-CIT-10284"}, token=citizen_tok)
    print(f"  POST /api/workflows/{app_id}/start -> Status: {wf_res.get('status')}, Decision: {wf_res.get('decision')}")

    # Recheck timeline
    st_tl2, tl_res2 = request_json(f"{API_BASE}/applications/{app_id}/timeline", token=citizen_tok)
    print(f"  Timeline after execution: Current Step: {tl_res2.get('current_step')}, App Status: {tl_res2.get('status')}")

# 5. Consent Management
print("\n--- [5] Consent Management (Requested Departments) ---")
# List consents
st, consents_res = request_json(f"{API_BASE}/consents", token=citizen_tok)
print(f"  GET /api/consents -> Total consents found: {len(consents_res)}")
for c in consents_res[:3]:
    print(f"    ID: {c.get('id')} | Dept: {c.get('department_name') or c.get('department_code')} | Status: {c.get('status')} | Purpose: {c.get('purpose')}")

# Grant a new consent for Welfare
grant_payload = {
    "master_citizen_id": "MAHA-CIT-10284",
    "department_code": "WELFARE",
    "purpose": "Unified Skill & Employment Benefit Verification",
    "data_scope": ["welfare_schemes", "benefit_history"],
    "validity_days": 90,
}
st, new_consent = request_json(f"{API_BASE}/consent", method="POST", payload=grant_payload, token=citizen_tok)
print(f"  POST /api/consent -> Status: {st}, Consent ID: {new_consent.get('id')}, Status: {new_consent.get('status')}")

if new_consent.get("id"):
    c_id = new_consent.get("id")
    # Review
    st, review_res = request_json(f"{API_BASE}/consent/{c_id}", token=citizen_tok)
    print(f"  GET /api/consent/{c_id} -> Status: {review_res.get('status')}, Purpose: {review_res.get('purpose')}")
    # Revoke
    st, revoke_res = request_json(f"{API_BASE}/consent/{c_id}/revoke", method="POST", payload={"reason": "User revoked demo consent"}, token=citizen_tok)
    print(f"  POST /api/consent/{c_id}/revoke -> New Status: {revoke_res.get('status')}")

# 6. Master Identity
print("\n--- [6] Master Identity (MAHA-CIT-10284) ---")
st, id_res = request_json(f"{API_BASE}/identity/MAHA-CIT-10284", token=citizen_tok)
print(f"  GET /api/identity/MAHA-CIT-10284 -> Status: {st}")
print(f"    Full Name: {id_res.get('full_name')}, Mobile: {id_res.get('mobile_masked')}, Status: {id_res.get('status')}")

st_map, mappings_res = request_json(f"{API_BASE}/identity/MAHA-CIT-10284/mappings", token=citizen_tok)
print(f"  GET /api/identity/MAHA-CIT-10284/mappings -> Mappings Count: {len(mappings_res)}")
for m in mappings_res:
    print(f"    System: {m.get('source_system')} | ID: {m.get('source_id')} | Schema: {m.get('source_schema')} | Active: {m.get('is_active')}")

# 7. Connector Registry & Live Health Check
print("\n--- [7] Connector Registry & Health Check Probes ---")
st, connectors = request_json(f"{API_BASE}/connectors", token=admin_tok)
print(f"  GET /api/connectors -> Total connectors: {len(connectors)}")
for conn in connectors[:4]:
    cid = conn.get("id")
    cname = conn.get("name")
    csys = conn.get("system_type")
    cproto = conn.get("protocol")
    cauth = conn.get("auth_type")
    cstatus = conn.get("status")
    print(f"    Connector: {cname} | System: {csys} | Proto: {cproto} | Auth: {cauth} | Status: {cstatus}")
    # Run Live Health Check Probe
    st_hc, hc_res = request_json(f"{API_BASE}/connectors/{cid}/health-check", method="POST", token=admin_tok)
    print(f"      -> Health Check Probe: Status={hc_res.get('status')}, Latency={hc_res.get('latency_ms')}ms")

# 8. Workflow Visualization Statuses
print("\n--- [8] Workflow Engine & Actual Statuses ---")
st, workflows = request_json(f"{API_BASE}/workflows", token=officer_tok)
print(f"  GET /api/workflows -> Total workflows: {len(workflows)}")
for w in workflows[:2]:
    print(f"    Workflow: {w.get('name')} (Code: {w.get('code')}) SLA: {w.get('sla_hours')}h")

# 9. Exceptions
print("\n--- [9] Exception Registry ---")
st, excs = request_json(f"{API_BASE}/exceptions", token=officer_tok)
print(f"  GET /api/exceptions -> Total exceptions: {len(excs)}")
if excs:
    ex = excs[0]
    eid = ex.get("id")
    print(f"    Sample Exception: {ex.get('component')} | Code: {ex.get('error_code')} | Status: {ex.get('status')}")
    # Test retry exception
    st_ret, ret_res = request_json(f"{API_BASE}/exceptions/{eid}/retry", method="POST", token=officer_tok)
    print(f"      POST /api/exceptions/{eid}/retry -> Status: {st_ret}")

# 10. Event Monitoring
print("\n--- [10] Event Monitoring ---")
st, events = request_json(f"{API_BASE}/events?limit=5", token=officer_tok)
print(f"  GET /api/events -> Total events returned: {len(events)}")
for ev in events[:3]:
    print(f"    [{ev.get('timestamp')}] {ev.get('event_type')} | Severity: {ev.get('severity')}")

# 11. Audit Explorer
print("\n--- [11] Audit Explorer & SHA-256 Integrity ---")
st, audit_records = request_json(f"{API_BASE}/audit?limit=5", token=tokens.get("Auditor"))
print(f"  GET /api/audit -> Total audit records: {len(audit_records)}")
for a in audit_records[:3]:
    print(f"    Timestamp: {a.get('timestamp')} | Actor: {a.get('actor')} | Action: {a.get('action')} | Source: {a.get('source')} | Consent: {a.get('consent_id') or 'N/A'} | Result: {a.get('result')}")

if audit_records:
    aid = audit_records[0].get("id")
    st_v, v_res = request_json(f"{API_BASE}/audit/{aid}/verify", token=tokens.get("Auditor"))
    if isinstance(v_res, dict):
        print(f"    SHA-256 Verification for {aid} -> Verified: {v_res.get('verified')}, Calculated Hash: {str(v_res.get('calculated_hash', ''))[:16]}...")
    else:
        print(f"    SHA-256 Verification response: {st_v} {v_res}")

print("\n" + "=" * 70)
print("E2E INTEGRATION VERIFICATION COMPLETE")
print("=" * 70)
