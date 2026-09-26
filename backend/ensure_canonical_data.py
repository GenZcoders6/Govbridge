"""
Ensure Canonical Demo Data exists in govbridge_dev.db:
- Workflow: "Unified Skill & Employment Benefit Application" (code: UNIFIED_SKILL_BENEFIT)
- Citizen Master Identity: MAHA-CIT-10284
- Demo Users: citizen@govbridge.demo, officer@govbridge.demo, admin@govbridge.demo, auditor@govbridge.demo
"""
import sqlite3
import uuid
from datetime import datetime, timezone

import os
db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "govbridge_dev.db")
con = sqlite3.connect(db_file)
cur = con.cursor()

# 1. Canonical Workflow
cur.execute("SELECT id FROM workflows WHERE code = 'UNIFIED_SKILL_BENEFIT'")
row = cur.fetchone()
if not row:
    cur.execute("SELECT id FROM departments LIMIT 1")
    dept_res = cur.fetchone()
    dept_id = dept_res[0] if dept_res else uuid.uuid4().hex
    wf_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc).isoformat()
    cur.execute(
        """
        INSERT INTO workflows (id, name, code, description, department_id, version, is_active, sla_hours, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, 1, 48, ?, ?)
        """,
        (
            wf_id,
            "Unified Skill & Employment Benefit Application",
            "UNIFIED_SKILL_BENEFIT",
            "Cross-departmental welfare, skill and employment benefit verification and disbursement orchestration.",
            dept_id,
            now,
            now,
        )
    )
    con.commit()
    print("[OK] Created canonical workflow UNIFIED_SKILL_BENEFIT:", wf_id)
else:
    print("[OK] Canonical workflow already exists:", row[0])

# 2. Master Identity MAHA-CIT-10284
cur.execute("SELECT id FROM master_identities WHERE master_uid = 'MAHA-CIT-10284'")
mi_row = cur.fetchone()
if not mi_row:
    cit_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc).isoformat()
    cur.execute(
        """
        INSERT INTO citizens (id, full_name, date_of_birth, gender, state, district, pincode, is_verified, created_at, updated_at)
        VALUES (?, 'Sunil Patil', '1998-05-14', 'MALE', 'Maharashtra', 'Pune', '411001', 1, ?, ?)
        """,
        (cit_id, now, now)
    )
    mi_id = uuid.uuid4().hex
    cur.execute(
        """
        INSERT INTO master_identities (id, citizen_id, master_uid, confidence_score, is_verified, verified_at, created_at, updated_at)
        VALUES (?, ?, 'MAHA-CIT-10284', 1.0, 1, ?, ?, ?)
        """,
        (mi_id, cit_id, now, now, now)
    )
    dept_mappings = [
        ("education", "EDU-MH-2021-8842", "education_degree_v1"),
        ("employment", "EMP-49382", "employment_status_v1"),
        ("skill", "SKILL-CERT-8841", "msde_cert_v1"),
        ("revenue", "PAN-ABCDE1234F", "revenue_pan_v1"),
        ("welfare", "BOCW-2024-9912", "welfare_direct_v1"),
    ]
    for sys_name, sid, schema in dept_mappings:
        map_id = uuid.uuid4().hex
        cur.execute(
            """
            INSERT INTO identity_mappings (id, master_identity_id, source_system, source_id, source_schema, is_active, last_synced, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
            """,
            (map_id, mi_id, sys_name, sid, schema, now, now, now)
        )
    con.commit()
    print("[OK] Seeded MAHA-CIT-10284 with 5 department registry linkages.")
else:
    print("[OK] MAHA-CIT-10284 exists:", mi_row[0])

con.close()
