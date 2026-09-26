"""
MOCK Identity Registry Service — REST/JSON
⚠️  DEMO ONLY — No real citizen data
"""
import os
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

SERVICE_NAME = "Identity Registry (MOCK)"
app = FastAPI(title=SERVICE_NAME, description="⚠️ MOCK/DEMO — Simulated government identity registry")

# Simulated in-memory citizen database
MOCK_CITIZENS = {
    "DEMO001": {"uid": "DEMO001", "name": "Arjun Sharma", "dob": "1995-04-12", "gender": "M", "state": "Maharashtra", "is_verified": True},
    "DEMO002": {"uid": "DEMO002", "name": "Priya Nair", "dob": "1998-08-23", "gender": "F", "state": "Kerala", "is_verified": True},
    "DEMO003": {"uid": "DEMO003", "name": "Rajesh Gupta", "dob": "1987-01-05", "gender": "M", "state": "Uttar Pradesh", "is_verified": True},
    "DEMO004": {"uid": "DEMO004", "name": "Sunita Devi", "dob": "2000-11-17", "gender": "F", "state": "Bihar", "is_verified": False},
    "DEMO005": {"uid": "DEMO005", "name": "Vikram Patel", "dob": "1993-06-30", "gender": "M", "state": "Gujarat", "is_verified": True},
    "MAHA-CIT-10284": {"uid": "MAHA-CIT-10284", "name": "Sunil Patil", "dob": "1998-05-14", "gender": "M", "state": "Maharashtra", "district": "Pune", "is_verified": True},
}


@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME, "note": "MOCK/DEMO"}


@app.get("/citizens")
def list_citizens():
    return {
        "note": "MOCK/DEMO — Simulated data only",
        "citizens": list(MOCK_CITIZENS.values()),
        "total": len(MOCK_CITIZENS),
    }


@app.get("/citizens/{uid}")
def get_citizen(uid: str):
    citizen = MOCK_CITIZENS.get(uid)
    if not citizen:
        raise HTTPException(status_code=404, detail=f"Citizen {uid} not found (MOCK)")
    return {
        "note": "MOCK/DEMO — Simulated data only",
        "data": citizen,
        "source": "Identity Registry (MOCK)",
    }


@app.post("/citizens/verify")
def verify_citizen(uid: str):
    citizen = MOCK_CITIZENS.get(uid)
    if not citizen:
        raise HTTPException(status_code=404, detail=f"Citizen {uid} not found (MOCK)")
    return {
        "uid": uid,
        "is_verified": citizen["is_verified"],
        "confidence": 0.98 if citizen["is_verified"] else 0.45,
        "source": "Identity Registry (MOCK)",
    }
