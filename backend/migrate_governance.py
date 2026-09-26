"""
GovBridge Database Governance & Identity Schema Sync
Adds new columns for Consent, Policies, and Audit Logs
"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "govbridge_dev.db")
if os.path.exists(db_path):
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    def add_col(table, col, col_type):
        cols = [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]
        if col not in cols:
            print(f"Adding {col} to {table}...")
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")

    add_col("consents", "requested_data", "TEXT")
    add_col("access_policies", "purpose", "VARCHAR(200)")
    add_col("access_policies", "consent_required", "BOOLEAN DEFAULT 1")
    add_col("access_policies", "allowed_fields", "TEXT")
    add_col("access_policies", "disallowed_fields", "TEXT")

    add_col("audit_logs", "event_id", "CHAR(32)")
    add_col("audit_logs", "actor", "VARCHAR(255)")
    add_col("audit_logs", "role", "VARCHAR(100)")
    add_col("audit_logs", "application_id", "CHAR(32)")
    add_col("audit_logs", "source", "VARCHAR(200)")
    add_col("audit_logs", "target", "VARCHAR(200)")
    add_col("audit_logs", "purpose", "VARCHAR(255)")
    add_col("audit_logs", "consent_id", "CHAR(32)")
    add_col("audit_logs", "result", "VARCHAR(50) DEFAULT 'ALLOWED'")
    add_col("audit_logs", "integrity_hash", "VARCHAR(64)")
    add_col("audit_logs", "department_id", "CHAR(32)")

    con.commit()
    con.close()
    print("[OK] Schema sync completed successfully.")
else:
    print("[*] govbridge_dev.db not found, Base.metadata.create_all() will initialize fresh schema.")
