"""
GovBridge Canonical Data Model (CDM)
SIH26129 Interoperability Foundation

Unified internal schemas ensuring heterogeneous departmental registries speak the same data language
without altering source legacy systems.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Canonical Domain Models ──────────────────────────────────────────────

class PersonCDM(BaseModel):
    """Canonical representation of a Citizen/Person"""
    id: str = Field(description="Canonical citizen identifier or source employee/citizen id")
    full_name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    is_verified: bool = False
    identifiers: Dict[str, str] = Field(default_factory=dict, description="Registry-specific source IDs")


class EducationCDM(BaseModel):
    """Canonical representation of academic qualification"""
    person_id: Optional[str] = None
    highest_qualification: Optional[str] = None
    institution: Optional[str] = None
    year_of_passing: Optional[int] = None
    percentage: Optional[float] = None
    stream: Optional[str] = None
    is_verified: bool = False


class EmploymentCDM(BaseModel):
    """
    Canonical representation of employment record.
    Transformation target:
    employee_id -> person.id (or person_id)
    job_status -> status
    organization -> organization
    joining_date -> startDate
    """
    person_id: Optional[str] = Field(None, description="Mapped from source employee_id / citizen_uid")
    status: Optional[str] = Field(None, description="Mapped from source job_status")
    organization: Optional[str] = Field(None, description="Mapped from source organization")
    startDate: Optional[str] = Field(None, description="Mapped from source joining_date")
    designation: Optional[str] = None
    monthly_income: Optional[float] = None
    employment_type: Optional[str] = None
    pf_registered: Optional[bool] = None
    esic_registered: Optional[bool] = None


class SkillCertificationCDM(BaseModel):
    name: str
    level: str
    certificate_number: Optional[str] = None
    issuer: Optional[str] = None


class SkillCDM(BaseModel):
    """Canonical representation of vocational & technical skill qualifications"""
    person_id: Optional[str] = Field(None, description="Mapped from CitizenId")
    certifications: List[SkillCertificationCDM] = Field(default_factory=list)
    primary_skill: Optional[str] = None
    total_certifications: int = 0


class RevenueCDM(BaseModel):
    """Canonical representation of tax and revenue/land records"""
    person_id: Optional[str] = None
    annual_income: Optional[float] = None
    income_category: Optional[str] = None
    land_owned_sqft: Optional[float] = None
    property_tax_paid: Optional[bool] = None
    bpl_status: Optional[bool] = None
    state: Optional[str] = None
    district: Optional[str] = None
    last_assessment_year: Optional[int] = None


class WelfareCDM(BaseModel):
    """Canonical representation of social welfare & benefit enrollments"""
    person_id: Optional[str] = None
    schemes_enrolled: List[str] = Field(default_factory=list)
    ration_card: Optional[str] = None
    ration_card_number: Optional[str] = None
    pmjay_enrolled: Optional[bool] = None
    jan_dhan_account: Optional[bool] = None
    pension_enrolled: Optional[bool] = None
    disability_certificate: Optional[bool] = None


# ── Canonical Envelope (preserves source original data) ──────────────────

class CanonicalEnvelope(BaseModel):
    """
    GovBridge interoperability envelope containing:
    1. Transformed Common Data Model (CDM)
    2. Completely untouched, pristine raw source data
    3. Transformation lineage & metadata
    """
    cdm_type: str = Field(description="Domain: Person, Education, Employment, Skill, Revenue, Welfare")
    cdm_data: Dict[str, Any] = Field(description="Transformed canonical payload")
    raw_data: Any = Field(description="Untouched original payload from source government system")
    source_system: str
    source_protocol: str
    transformation_rules_applied: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
