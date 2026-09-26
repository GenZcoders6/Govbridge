"""
MOCK Welfare Registry Service — REST/JSON
⚠️  DEMO ONLY — No real citizen data
"""
from fastapi import FastAPI, HTTPException

SERVICE_NAME = "Welfare Registry (MOCK)"
app = FastAPI(title=SERVICE_NAME, description="⚠️ MOCK/DEMO — Simulated welfare scheme registry")

MOCK_WELFARE = {
    "DEMO003": {
        "uid": "DEMO003",
        "schemes_enrolled": ["PM-KISAN", "MGNREGS"],
        "ration_card": "AAY",
        "ration_card_number": "DEMO-RC-003",
        "pmjay_enrolled": True,
        "jan_dhan_account": True,
        "pension_enrolled": False,
        "disability_certificate": False,
    },
    "DEMO004": {
        "uid": "DEMO004",
        "schemes_enrolled": ["PMAY", "PM-KISAN", "MGNREGS", "PMJDY"],
        "ration_card": "BPL",
        "ration_card_number": "DEMO-RC-004",
        "pmjay_enrolled": True,
        "jan_dhan_account": True,
        "pension_enrolled": True,
        "disability_certificate": False,
    },
    "DEMO001": {
        "uid": "DEMO001",
        "schemes_enrolled": [],
        "ration_card": "APL",
        "ration_card_number": "DEMO-RC-001",
        "pmjay_enrolled": False,
        "jan_dhan_account": True,
        "pension_enrolled": False,
        "disability_certificate": False,
    },
    "DEMO002": {
        "uid": "DEMO002",
        "schemes_enrolled": [],
        "ration_card": "APL",
        "ration_card_number": "DEMO-RC-002",
        "pmjay_enrolled": False,
        "jan_dhan_account": True,
        "pension_enrolled": False,
        "disability_certificate": False,
    },
    "DEMO005": {
        "uid": "DEMO005",
        "schemes_enrolled": [],
        "ration_card": "APL",
        "ration_card_number": "DEMO-RC-005",
        "pmjay_enrolled": False,
        "jan_dhan_account": True,
        "pension_enrolled": False,
        "disability_certificate": False,
    },
    "MAHA-CIT-10284": {
        "uid": "MAHA-CIT-10284",
        "welfare_id": "BOCW-2024-9912",
        "schemes_enrolled": ["BOCW Welfare Board Registration"],
        "ration_card": "APL",
        "ration_card_number": "MH-RC-10284",
        "pmjay_enrolled": True,
        "jan_dhan_account": True,
        "pension_enrolled": False,
        "disability_certificate": False,
    },
    "BOCW-2024-9912": {
        "uid": "MAHA-CIT-10284",
        "welfare_id": "BOCW-2024-9912",
        "schemes_enrolled": ["BOCW Welfare Board Registration"],
        "ration_card": "APL",
        "ration_card_number": "MH-RC-10284",
        "pmjay_enrolled": True,
        "jan_dhan_account": True,
        "pension_enrolled": False,
        "disability_certificate": False,
    },
}


@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME, "note": "MOCK/DEMO"}


@app.get("/citizens/{uid}")
def get_welfare(uid: str):
    record = MOCK_WELFARE.get(uid)
    if not record:
        raise HTTPException(status_code=404, detail=f"Welfare record for {uid} not found (MOCK)")
    return {
        "note": "MOCK/DEMO — Simulated data only",
        "data": record,
        "source": SERVICE_NAME,
    }


@app.get("/schemes")
def list_schemes():
    return {
        "note": "MOCK/DEMO",
        "schemes": ["PM-KISAN", "MGNREGS", "PMAY", "PMJDY", "PMJAY", "NSAP"],
        "source": SERVICE_NAME,
    }
