"""
test_sih_demo_suite.py
Automated end-to-end verification of the SIH Judge Demonstration Optimization.
"""
import sys
import os
import httpx

def run_tests():
    print("==================================================")
    print("STARTING SIH DEMO OPTIMIZATION TECHNICAL QA SUITE")
    print("==================================================")
    passed = 0
    failed = 0

    with httpx.Client(timeout=10.0) as client:
        # Test 1: Frontend Login Page (SSR check)
        print("\n[CHECK 1] Testing Frontend Login Page (SSR)...")
        try:
            r = client.get("http://localhost:3000/login")
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            assert "GovBridge" in r.text, "GovBridge logo not found in /login"
            assert "Demo Accounts" in r.text, "Demo accounts quick fill not found in /login"
            print("  [PASS] /login page renders with GovBridge branding and 1-click Demo Accounts")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Frontend Login Page Check: {e}")
            failed += 1

        # Test 2: Frontend Dashboard Route & Code Verification
        print("\n[CHECK 2] Testing Frontend Dashboard & SIH Optimization...")
        try:
            # Check route HTTP 200
            r = client.get("http://localhost:3000/dashboard")
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            
            # Check dashboard code contains all required SIH elements
            dash_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "src", "app", "dashboard", "page.tsx")
            with open(dash_path, "r", encoding="utf-8") as f:
                dash_code = f.read()
            
            assert "One request." in dash_code, "Headline 'One request.' not found"
            assert "Multiple departments." in dash_code, "Headline 'Multiple departments.' not found"
            assert "One governed interoperability layer." in dash_code, "Headline 'One governed interoperability layer.' not found"
            assert "RUN INTEROPERABILITY DEMO" in dash_code, "RUN INTEROPERABILITY DEMO button text not found"
            assert "APP-2026-1048" in dash_code, "Demo application APP-2026-1048 not referenced on dashboard"
            assert "ConnectedSystemsTopology" in dash_code, "ConnectedSystemsTopology component not found"
            assert "InteroperabilityDemoModal" in dash_code, "InteroperabilityDemoModal component not found"
            print("  [PASS] Landing Dashboard communicates the exact 3-line headline, demo button, topology, and APP-2026-1048")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Frontend Dashboard Check: {e}")
            failed += 1

        # Test 3: Login with Demo Citizen
        print("\n[CHECK 3] Testing Demo Authentication...")
        token = None
        try:
            r = client.post("http://127.0.0.1:8000/api/auth/token", data={"username": "citizen@govbridge.demo", "password": "citizen123"})
            assert r.status_code == 200, f"Login failed: {r.text}"
            token = r.json()["access_token"]
            print("  [PASS] citizen@govbridge.demo authenticated successfully")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Citizen authentication: {e}")
            failed += 1

        headers = {"Authorization": f"Bearer {token}"} if token else {}

        # Test 4: Application Lookup by reference number APP-2026-1048
        print("\n[CHECK 4] Testing Application Lookup for APP-2026-1048...")
        try:
            r = client.get("http://127.0.0.1:8000/api/applications/APP-2026-1048", headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            data = r.json()
            assert data["reference_number"] == "APP-2026-1048", "Reference number mismatch"
            assert data["status"] == "COMPLETED", f"Expected COMPLETED status, got {data['status']}"
            assert "Sunil Patil" in data["title"], "Title does not contain Sunil Patil"
            print(f"  [PASS] APP-2026-1048 found: {data['title']} (Status: {data['status']})")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] APP-2026-1048 lookup: {e}")
            failed += 1

        # Test 5: Verification Steps for APP-2026-1048
        print("\n[CHECK 5] Testing 11 Workflow Steps for APP-2026-1048...")
        try:
            r = client.get("http://127.0.0.1:8000/api/applications/APP-2026-1048/steps", headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            steps = r.json()
            assert len(steps) == 11, f"Expected 11 steps, got {len(steps)}"
            step_names = [s["name"] for s in steps]
            expected_names = [
                "Application Created", "Identity Verification", "Consent Validation",
                "Education Verification", "Skill Verification", "Employment Verification",
                "Income Verification", "Eligibility Evaluation", "Department Review",
                "Decision", "Application Completed"
            ]
            for exp in expected_names:
                assert exp in step_names, f"Missing step: {exp}"
            
            # Check SOAP XML content in Skill step
            skill_step = next(s for s in steps if s["name"] == "Skill Verification")
            assert "soap_envelope" in skill_step["result_data"], "SOAP envelope missing from Skill Verification step"
            
            # Check REST CDM in Education step
            edu_step = next(s for s in steps if s["name"] == "Education Verification")
            assert "cdm" in edu_step["result_data"], "CDM missing from Education Verification step"

            # Check Decision
            dec_step = next(s for s in steps if s["name"] == "Decision")
            assert dec_step["result_data"]["decision"] == "BENEFIT_SANCTIONED", "Decision not BENEFIT_SANCTIONED"

            print(f"  [PASS] All 11 workflow steps verified with SOAP XML, REST CDM, and BENEFIT_SANCTIONED")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] APP-2026-1048 steps: {e}")
            failed += 1

        # Test 6: DPDP Consent for APP-2026-1048
        print("\n[CHECK 6] Testing DPDP Consent for APP-2026-1048...")
        try:
            r = client.get("http://127.0.0.1:8000/api/applications/APP-2026-1048/consents", headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            consents = r.json()
            assert len(consents) >= 1, "No consents found"
            c = consents[0]
            assert c["status"] == "ACTIVE", f"Consent not ACTIVE: {c['status']}"
            print(f"  [PASS] DPDP active consent record verified for APP-2026-1048 (ID: {c['consent_id']})")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Consent check: {e}")
            failed += 1

        # Test 7: Timeline Endpoint for APP-2026-1048
        print("\n[CHECK 7] Testing Timeline Endpoint for APP-2026-1048...")
        try:
            r = client.get("http://127.0.0.1:8000/api/applications/APP-2026-1048/timeline", headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            tl = r.json()
            assert len(tl["timeline"]) == 11, f"Expected 11 timeline items, got {len(tl['timeline'])}"
            assert tl["status"] == "COMPLETED", f"Expected COMPLETED, got {tl['status']}"
            print(f"  [PASS] 11-step visual timeline returned with status: {tl['status']}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Timeline check: {e}")
            failed += 1

        # Test 8: Master Identity Mappings for MAHA-CIT-10284
        print("\n[CHECK 8] Testing Master Identity Mappings for MAHA-CIT-10284...")
        try:
            r = client.get("http://127.0.0.1:8000/api/identity/MAHA-CIT-10284/mappings", headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            mappings = r.json()
            assert len(mappings) >= 5, f"Expected at least 5 mappings, got {len(mappings)}"
            sources = {m["source_system"]: m["source_id"] for m in mappings}
            assert "education" in sources and sources["education"] == "EDU-MH-2021-8842"
            assert "skill" in sources and sources["skill"] == "SKILL-CERT-8841"
            assert "employment" in sources and sources["employment"] == "EMP-49382"
            assert "revenue" in sources and sources["revenue"] == "PAN-ABCDE1234F"
            assert "welfare" in sources and sources["welfare"] == "BOCW-2024-9912"
            print(f"  [PASS] Master Identity MAHA-CIT-10284 mapped to all 5 departmental IDs: {sources}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Master Identity check: {e}")
            failed += 1

        # Test 9: Frontend Application Detail Page
        print("\n[CHECK 9] Testing Frontend Route /applications/APP-2026-1048...")
        try:
            r = client.get("http://localhost:3000/applications/APP-2026-1048")
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            print("  [PASS] Frontend renders /applications/APP-2026-1048 with HTTP 200 OK")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Frontend detail page check: {e}")
            failed += 1

        # Test 10: Verify All 6 Mock Services
        print("\n[CHECK 10] Testing All 6 Heterogeneous Mock Registries...")
        mock_endpoints = [
            ("Identity Authority (REST)", "http://127.0.0.1:8001/citizens/MAHA-CIT-10284", 200),
            ("Higher Education (REST)", "http://127.0.0.1:8002/citizens/MAHA-CIT-10284", 200),
            ("Employment Exchange (REST)", "http://127.0.0.1:8003/citizens/MAHA-CIT-10284", 200),
            ("Skill Mission (SOAP/XML WSDL)", "http://127.0.0.1:8004/health", 200),
            ("Revenue Registry (SQL Direct)", "http://127.0.0.1:8005/health", 200),
            ("Welfare DBT Board (REST)", "http://127.0.0.1:8006/citizens/MAHA-CIT-10284", 200),
        ]
        for name, url, exp_code in mock_endpoints:
            try:
                res = client.get(url)
                assert res.status_code == exp_code, f"Expected {exp_code}, got {res.status_code}"
                print(f"  [PASS] {name} responding on port {url.split(':')[2].split('/')[0]} (Status: {res.status_code})")
                passed += 1
            except Exception as e:
                print(f"  [FAIL] {name} check: {e}")
                failed += 1

        # Test 11: Authenticate All 4 Persona Roles
        print("\n[CHECK 11] Testing All 4 RBAC Persona Logins...")
        roles = [
            ("citizen@govbridge.demo", "citizen123", "CITIZEN"),
            ("officer@govbridge.demo", "officer123", "DEPARTMENT_OFFICER"),
            ("admin@govbridge.demo", "admin123", "INTEGRATION_ADMIN"),
            ("auditor@govbridge.demo", "auditor123", "AUDITOR"),
        ]
        for user_email, pwd, role in roles:
            try:
                r = client.post("http://127.0.0.1:8000/api/auth/token", data={"username": user_email, "password": pwd})
                assert r.status_code == 200, f"Login failed for {user_email}: {r.status_code}"
                user_info = r.json()["user"]
                assert user_info["role"] == role, f"Role mismatch for {user_email}: expected {role}, got {user_info['role']}"
                print(f"  [PASS] {user_email} logged in with role {role}")
                passed += 1
            except Exception as e:
                print(f"  [FAIL] {user_email} login: {e}")
                failed += 1

    print("\n==================================================")
    print(f"SIH DEMONSTRATION TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")
    if failed == 0:
        print("ALL CRITERIA SATISFIED! PLATFORM READY FOR SIH JURY.")
    return failed

if __name__ == "__main__":
    sys.exit(run_tests())
