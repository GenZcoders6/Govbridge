"""
MOCK Education Registry Service — REST/JSON
⚠️  DEMO ONLY — No real citizen data
"""
from fastapi import FastAPI, HTTPException

SERVICE_NAME = "Education Registry (MOCK)"
app = FastAPI(title=SERVICE_NAME, description="⚠️ MOCK/DEMO — Simulated education registry")

MOCK_RECORDS = {
    "DEMO001": {
        "uid": "DEMO001",
        "highest_qualification": "B.Tech",
        "institution": "Demo University",
        "year_of_passing": 2017,
        "percentage": 72.5,
        "stream": "Computer Science",
        "is_verified": True,
    },
    "DEMO002": {
        "uid": "DEMO002",
        "highest_qualification": "M.Sc",
        "institution": "Demo Science College",
        "year_of_passing": 2020,
        "percentage": 81.2,
        "stream": "Mathematics",
        "is_verified": True,
    },
    "DEMO003": {
        "uid": "DEMO003",
        "highest_qualification": "12th",
        "institution": "Demo High School",
        "year_of_passing": 2005,
        "percentage": 65.0,
        "stream": "Commerce",
        "is_verified": True,
    },
    "DEMO004": {
        "uid": "DEMO004",
        "highest_qualification": "10th",
        "institution": "Demo Secondary School",
        "year_of_passing": 2016,
        "percentage": 58.3,
        "stream": "General",
        "is_verified": False,
    },
    "DEMO005": {
        "uid": "DEMO005",
        "highest_qualification": "MBA",
        "institution": "Demo Business School",
        "year_of_passing": 2019,
        "percentage": 78.8,
        "stream": "Finance",
        "is_verified": True,
    },
    "MAHA-CIT-10284": {
        "uid": "MAHA-CIT-10284",
        "education_id": "EDU-MH-2021-8842",
        "highest_qualification": "B.Tech",
        "institution": "Pune Institute of Technology",
        "year_of_passing": 2021,
        "percentage": 78.5,
        "stream": "Computer Science & Engineering",
        "is_verified": True,
    },
    "EDU-MH-2021-8842": {
        "uid": "MAHA-CIT-10284",
        "education_id": "EDU-MH-2021-8842",
        "highest_qualification": "B.Tech",
        "institution": "Pune Institute of Technology",
        "year_of_passing": 2021,
        "percentage": 78.5,
        "stream": "Computer Science & Engineering",
        "is_verified": True,
    },
}


@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME, "note": "MOCK/DEMO"}


@app.get("/citizens/{uid}")
def get_education(uid: str):
    record = MOCK_RECORDS.get(uid)
    if not record:
        raise HTTPException(status_code=404, detail=f"Education record for {uid} not found (MOCK)")
    return {
        "note": "MOCK/DEMO — Simulated data only",
        "data": record,
        "source": SERVICE_NAME,
    }


@app.get("/records")
def list_records():
    return {
        "note": "MOCK/DEMO — Simulated data only",
        "records": list(MOCK_RECORDS.values()),
        "total": len(MOCK_RECORDS),
    }
