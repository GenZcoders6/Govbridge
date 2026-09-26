"""
MOCK Employment Registry Service — REST/JSON
⚠️  DEMO ONLY — Synthetic government employment registry simulation
"""
from typing import Optional
from fastapi import FastAPI, HTTPException

SERVICE_NAME = "Employment Registry (MOCK)"
app = FastAPI(title=SERVICE_NAME, description="⚠️ MOCK/DEMO — Simulated employment registry")

# Synthetic employment records with source fields matching the prompt specification
MOCK_RECORDS = {
    "DEMO001": {
        "uid": "DEMO001",
        "employee_id": "EMP-49382",
        "job_status": "EMPLOYED",
        "organization": "Demo Organization",
        "joining_date": "2025-06-10",
        "designation": "Senior Systems Engineer",
        "monthly_income": 65000,
        "employment_type": "Regular",
        "pf_registered": True,
        "esic_registered": False,
    },
    "DEMO002": {
        "uid": "DEMO002",
        "employee_id": "EMP-38104",
        "job_status": "EMPLOYED",
        "organization": "Demo Analytics Corp",
        "joining_date": "2022-03-15",
        "designation": "Data Analyst",
        "monthly_income": 55000,
        "employment_type": "Regular",
        "pf_registered": True,
        "esic_registered": True,
    },
    "DEMO003": {
        "uid": "DEMO003",
        "employee_id": "EMP-10294",
        "job_status": "SELF_EMPLOYED",
        "organization": "Gupta General Stores",
        "joining_date": "2015-01-20",
        "designation": "Proprietor",
        "monthly_income": 22000,
        "employment_type": "Self-employed",
        "pf_registered": False,
        "esic_registered": False,
    },
    "DEMO004": {
        "uid": "DEMO004",
        "employee_id": "EMP-00000",
        "job_status": "UNEMPLOYED",
        "organization": "None",
        "joining_date": None,
        "designation": None,
        "monthly_income": 0,
        "employment_type": "Unemployed",
        "pf_registered": False,
        "esic_registered": False,
    },
    "DEMO005": {
        "uid": "DEMO005",
        "employee_id": "EMP-92841",
        "job_status": "EMPLOYED",
        "organization": "Demo Finance Ltd",
        "joining_date": "2020-07-01",
        "designation": "Branch Operations Manager",
        "monthly_income": 95000,
        "employment_type": "Regular",
        "pf_registered": True,
        "esic_registered": False,
    },
    "MAHA-CIT-10284": {
        "uid": "MAHA-CIT-10284",
        "employee_id": "EMP-49382",
        "job_status": "EMPLOYED",
        "organization": "Maharashtra IT Infrastructure Corp",
        "joining_date": "2023-08-15",
        "designation": "Systems Engineer",
        "monthly_income": 45000,
        "employment_type": "Regular",
        "pf_registered": True,
        "esic_registered": True,
    },
}

# Lookup index by employee_id
MOCK_BY_EMP_ID = {rec["employee_id"]: rec for rec in MOCK_RECORDS.values() if rec.get("employee_id")}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "protocol": "REST_JSON",
        "note": "MOCK/DEMO - Synthetic data only",
    }


@app.get("/citizens/{uid}")
def get_citizen_employment(uid: str):
    record = MOCK_RECORDS.get(uid) or MOCK_BY_EMP_ID.get(uid)
    if not record:
        raise HTTPException(status_code=404, detail=f"Employment record for {uid} not found (MOCK)")
    return {
        "note": "MOCK/DEMO — Simulated data only",
        "data": record,
        "source": SERVICE_NAME,
    }


@app.get("/citizens/{uid}/employment")
def get_canonical_employment(uid: str):
    """
    Exposes REST/JSON endpoint with required structure:
    employee_id, job_status, organization, joining_date
    """
    record = MOCK_RECORDS.get(uid) or MOCK_BY_EMP_ID.get(uid)
    if not record:
        raise HTTPException(status_code=404, detail=f"Employment record for {uid} not found (MOCK)")
    return {
        "employee_id": record["employee_id"],
        "job_status": record["job_status"],
        "organization": record["organization"],
        "joining_date": record["joining_date"],
        "citizen_uid": uid,
        "source": SERVICE_NAME,
    }


@app.get("/employees/{employee_id}")
def get_by_employee_id(employee_id: str):
    record = MOCK_BY_EMP_ID.get(employee_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found (MOCK)")
    return {
        "employee_id": record["employee_id"],
        "job_status": record["job_status"],
        "organization": record["organization"],
        "joining_date": record["joining_date"],
        "source": SERVICE_NAME,
    }


@app.get("/records")
def list_records():
    return {
        "note": "MOCK/DEMO — Simulated data only",
        "records": list(MOCK_RECORDS.values()),
        "total": len(MOCK_RECORDS),
    }
