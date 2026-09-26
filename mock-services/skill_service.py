"""
MOCK Skill Registry Service — SOAP/XML style responses
⚠️  DEMO ONLY — Synthetic legacy SOAP/XML government registry simulation

Exposes XML endpoints representing legacy systems returning SOAP/XML envelopes.
GovBridge connector parses this XML into canonical common models.
"""
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Response

try:
    from lxml import etree

    def _to_xml_string(root) -> str:
        return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="UTF-8").decode()
except ImportError:
    import xml.etree.ElementTree as etree

    def _to_xml_string(root) -> str:
        etree.indent(root)
        return etree.tostring(root, encoding="utf-8", xml_declaration=True).decode()

SERVICE_NAME = "Skill Registry (MOCK-SOAP)"
app = FastAPI(title=SERVICE_NAME, description="⚠️ MOCK/DEMO — Simulated SOAP/XML skill registry")

MOCK_SKILLS: Dict[str, Dict[str, Any]] = {
    "DEMO001": {
        "citizen_id": "MAHA-CIT-10284",
        "certifications": [
            {"name": "Python Development", "level": "Advanced", "cert_no": "NSDC-2021-PY-001", "issuer": "NSDC"},
            {"name": "Web Development", "level": "Intermediate", "cert_no": "NSDC-2022-WD-045", "issuer": "NSDC"},
        ],
    },
    "DEMO002": {
        "citizen_id": "KER-CIT-84729",
        "certifications": [
            {"name": "Data Science & Analytics", "level": "Expert", "cert_no": "NASSCOM-2022-DS-112", "issuer": "NASSCOM"},
        ],
    },
    "DEMO003": {
        "citizen_id": "UP-CIT-59281",
        "certifications": [
            {"name": "Retail Store Management", "level": "Intermediate", "cert_no": "PMKVY-2019-RM-33", "issuer": "PMKVY"},
        ],
    },
    "DEMO004": {
        "citizen_id": "BIH-CIT-38102",
        "certifications": [],
    },
    "DEMO005": {
        "citizen_id": "GUJ-CIT-73910",
        "certifications": [
            {"name": "Financial Risk Analysis", "level": "Expert", "cert_no": "NISM-2020-FA-221", "issuer": "NISM"},
            {"name": "Accounting & Auditing", "level": "Advanced", "cert_no": "NISM-2021-RM-087", "issuer": "NISM"},
        ],
    },
    "MAHA-CIT-10284": {
        "citizen_id": "MAHA-CIT-10284",
        "certifications": [
            {"name": "Python Development", "level": "Advanced", "cert_no": "SKILL-CERT-8841", "issuer": "NSDC"},
            {"name": "Web Development", "level": "Intermediate", "cert_no": "NSDC-2022-WD-045", "issuer": "NSDC"},
        ],
    },
    "SKILL-CERT-8841": {
        "citizen_id": "MAHA-CIT-10284",
        "certifications": [
            {"name": "Python Development", "level": "Advanced", "cert_no": "SKILL-CERT-8841", "issuer": "NSDC"},
        ],
    },
}

# Alias by citizen_id as well
MOCK_BY_CITIZEN_ID = {data["citizen_id"]: data for data in MOCK_SKILLS.values()}


def _build_soap_xml_response(citizen_id: str, certifications: List[Dict[str, str]]) -> str:
    """
    Builds exact XML response structure requested:
    <SkillResponse>
        <CitizenId>MAHA-CIT-10284</CitizenId>
        <Certification>
            <Name>Python Development</Name>
            <Level>Advanced</Level>
        </Certification>
    </SkillResponse>
    """
    root = etree.Element("SkillResponse")
    root.set("xmlns", "http://gov.in/skill-registry/v1")
    root.set("source", SERVICE_NAME)

    citizen_elem = etree.SubElement(root, "CitizenId")
    citizen_elem.text = citizen_id

    for cert in certifications:
        cert_elem = etree.SubElement(root, "Certification")
        name_elem = etree.SubElement(cert_elem, "Name")
        name_elem.text = cert.get("name", "")
        level_elem = etree.SubElement(cert_elem, "Level")
        level_elem.text = cert.get("level", "")
        if "cert_no" in cert:
            cert_no_elem = etree.SubElement(cert_elem, "CertificateNumber")
            cert_no_elem.text = cert["cert_no"]
        if "issuer" in cert:
            issuer_elem = etree.SubElement(cert_elem, "Issuer")
            issuer_elem.text = cert["issuer"]

    return _to_xml_string(root)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "protocol": "SOAP_XML",
        "note": "MOCK/DEMO - Synthetic data only",
    }


@app.get("/citizens/{uid}/skills")
def get_skills_by_uid(uid: str):
    """Returns XML response by citizen UID"""
    record = MOCK_SKILLS.get(uid) or MOCK_BY_CITIZEN_ID.get(uid)
    if not record:
        raise HTTPException(status_code=404, detail=f"Citizen {uid} not found in skill registry (MOCK)")
    xml_content = _build_soap_xml_response(record["citizen_id"], record["certifications"])
    return Response(content=xml_content, media_type="application/xml")


@app.get("/skills/{citizen_id}")
def get_skills_by_citizen_id(citizen_id: str):
    """Returns XML response by CitizenId (e.g., MAHA-CIT-10284)"""
    record = MOCK_BY_CITIZEN_ID.get(citizen_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Citizen {citizen_id} not found in skill registry (MOCK)")
    xml_content = _build_soap_xml_response(citizen_id, record["certifications"])
    return Response(content=xml_content, media_type="application/xml")


@app.get("/citizens/{uid}/skills/json")
def get_skills_json(uid: str):
    """Convenience JSON endpoint"""
    record = MOCK_SKILLS.get(uid)
    if not record:
        raise HTTPException(status_code=404, detail=f"Citizen {uid} not found (MOCK)")
    return {
        "note": "MOCK/DEMO — Simulated SOAP data as JSON",
        "data": record,
        "source": SERVICE_NAME,
        "original_protocol": "SOAP_XML",
    }
