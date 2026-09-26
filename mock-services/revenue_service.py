"""
MOCK Revenue Registry Service — Database Connector Simulation
⚠️  DEMO ONLY — No real citizen data

Simulates a legacy database-style connector where data is returned
as structured records (as if read from a database table).
"""
from fastapi import FastAPI, HTTPException

SERVICE_NAME = "Revenue Registry (MOCK-DB)"
app = FastAPI(title=SERVICE_NAME, description="⚠️ MOCK/DEMO — Simulated database connector for revenue/land records")

# Simulates a SELECT * FROM revenue_records WHERE uid = ?
MOCK_DB_RECORDS = {
    "DEMO001": {
        "table": "revenue_records",
        "row_id": 10001,
        "uid": "DEMO001",
        "annual_income": 780000,
        "income_category": "Middle",
        "land_owned_sqft": 0,
        "property_tax_paid": True,
        "bpl_status": False,
        "state": "Maharashtra",
        "district": "Pune",
        "last_assessment_year": 2023,
    },
    "DEMO002": {
        "table": "revenue_records",
        "row_id": 10002,
        "uid": "DEMO002",
        "annual_income": 660000,
        "income_category": "Middle",
        "land_owned_sqft": 500,
        "property_tax_paid": True,
        "bpl_status": False,
        "state": "Kerala",
        "district": "Ernakulam",
        "last_assessment_year": 2023,
    },
    "DEMO003": {
        "table": "revenue_records",
        "row_id": 10003,
        "uid": "DEMO003",
        "annual_income": 264000,
        "income_category": "Lower",
        "land_owned_sqft": 200,
        "property_tax_paid": False,
        "bpl_status": True,
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "last_assessment_year": 2022,
    },
    "DEMO004": {
        "table": "revenue_records",
        "row_id": 10004,
        "uid": "DEMO004",
        "annual_income": 0,
        "income_category": "BPL",
        "land_owned_sqft": 0,
        "property_tax_paid": False,
        "bpl_status": True,
        "state": "Bihar",
        "district": "Patna",
        "last_assessment_year": 2022,
    },
    "DEMO005": {
        "table": "revenue_records",
        "row_id": 10005,
        "uid": "DEMO005",
        "annual_income": 1140000,
        "income_category": "Upper-Middle",
        "land_owned_sqft": 2000,
        "property_tax_paid": True,
        "bpl_status": False,
        "state": "Gujarat",
        "district": "Ahmedabad",
        "last_assessment_year": 2023,
    },
    "MAHA-CIT-10284": {
        "table": "revenue_records",
        "row_id": 10006,
        "uid": "MAHA-CIT-10284",
        "pan": "PAN-ABCDE1234F",
        "annual_income": 540000,
        "income_category": "Middle",
        "land_owned_sqft": 0,
        "property_tax_paid": True,
        "bpl_status": False,
        "state": "Maharashtra",
        "district": "Pune",
        "last_assessment_year": 2024,
    },
    "PAN-ABCDE1234F": {
        "table": "revenue_records",
        "row_id": 10006,
        "uid": "MAHA-CIT-10284",
        "pan": "PAN-ABCDE1234F",
        "annual_income": 540000,
        "income_category": "Middle",
        "land_owned_sqft": 0,
        "property_tax_paid": True,
        "bpl_status": False,
        "state": "Maharashtra",
        "district": "Pune",
        "last_assessment_year": 2024,
    },
}


@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME, "protocol": "DATABASE", "note": "MOCK/DEMO"}


@app.get("/citizens/{uid}")
def get_revenue_record(uid: str):
    """Simulates a database query by UID"""
    record = MOCK_DB_RECORDS.get(uid)
    if not record:
        raise HTTPException(status_code=404, detail=f"No revenue record for {uid} (MOCK-DB)")
    return {
        "note": "MOCK/DEMO — Simulated database connector response",
        "query": f"SELECT * FROM revenue_records WHERE uid = '{uid}'",
        "data": record,
        "source": SERVICE_NAME,
    }


@app.get("/records/bpl")
def get_bpl_list():
    """Simulates SELECT * FROM revenue_records WHERE bpl_status = true"""
    bpl = [r for r in MOCK_DB_RECORDS.values() if r["bpl_status"]]
    return {
        "note": "MOCK/DEMO — Simulated database query",
        "query": "SELECT * FROM revenue_records WHERE bpl_status = true",
        "data": bpl,
        "count": len(bpl),
        "source": SERVICE_NAME,
    }
