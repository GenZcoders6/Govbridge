"""
GovBridge Data Transformation Engine
SIH26129 Interoperability Foundation

Transforms raw, heterogeneous departmental data into GovBridge Canonical Data Models (CDM)
while strictly preserving the source data untouched.
"""
from typing import Any, Dict, List, Optional
import copy

from app.schemas.cdm import (
    PersonCDM, EducationCDM, EmploymentCDM, SkillCDM,
    SkillCertificationCDM, RevenueCDM, WelfareCDM, CanonicalEnvelope
)


class DataTransformer:
    """
    Transforms heterogeneous government registry payloads into canonical data models.
    Preserves raw data untouched.
    """

    @classmethod
    def transform_employment(cls, raw: Dict[str, Any], source_system: str = "Employment Registry") -> CanonicalEnvelope:
        """
        Transform employment payload:
        employee_id -> person.id (person_id)
        job_status -> employment.status
        organization -> employment.organization
        joining_date -> employment.startDate
        """
        # Unwrap data envelope if present
        source_data = raw.get("data", raw) if isinstance(raw, dict) else {}
        untouched_raw = copy.deepcopy(raw)

        emp_cdm = EmploymentCDM(
            person_id=str(source_data.get("employee_id") or source_data.get("uid") or ""),
            status=str(source_data.get("job_status") or source_data.get("status") or ""),
            organization=str(source_data.get("organization") or ""),
            startDate=source_data.get("joining_date") or source_data.get("startDate"),
            designation=source_data.get("designation"),
            monthly_income=float(source_data["monthly_income"]) if source_data.get("monthly_income") is not None else None,
            employment_type=source_data.get("employment_type"),
            pf_registered=source_data.get("pf_registered"),
            esic_registered=source_data.get("esic_registered"),
        )

        return CanonicalEnvelope(
            cdm_type="Employment",
            cdm_data=emp_cdm.model_dump(),
            raw_data=untouched_raw,
            source_system=source_system,
            source_protocol="REST_JSON",
            transformation_rules_applied=[
                "employee_id -> person.id",
                "job_status -> employment.status",
                "organization -> employment.organization",
                "joining_date -> employment.startDate",
            ],
        )

    @classmethod
    def transform_skill(cls, raw: Any, source_system: str = "Skill Registry") -> CanonicalEnvelope:
        """
        Transform legacy SOAP/XML parsed skill payload:
        CitizenId -> person_id
        Certification -> certifications list
        """
        untouched_raw = copy.deepcopy(raw)
        source_dict = raw if isinstance(raw, dict) else {}

        # Handle nested SkillResponse wrapper if present
        if "SkillResponse" in source_dict and isinstance(source_dict["SkillResponse"], dict):
            source_dict = source_dict["SkillResponse"]
        elif "data" in source_dict and isinstance(source_dict["data"], dict):
            source_dict = source_dict["data"]

        person_id = source_dict.get("CitizenId") or source_dict.get("citizen_id") or source_dict.get("uid")

        certs_raw = source_dict.get("Certification") or source_dict.get("certifications") or []
        if isinstance(certs_raw, dict):
            certs_raw = [certs_raw]
        elif not isinstance(certs_raw, list):
            certs_raw = []

        certifications: List[SkillCertificationCDM] = []
        for c in certs_raw:
            if isinstance(c, dict):
                cert_name = c.get("Name") or c.get("name") or "Unknown"
                cert_level = c.get("Level") or c.get("level") or "Standard"
                cert_no = c.get("CertificateNumber") or c.get("cert_no")
                cert_issuer = c.get("Issuer") or c.get("issuer")
                certifications.append(
                    SkillCertificationCDM(
                        name=cert_name,
                        level=cert_level,
                        certificate_number=cert_no,
                        issuer=cert_issuer,
                    )
                )

        primary = certifications[0].name if certifications else None
        skill_cdm = SkillCDM(
            person_id=str(person_id) if person_id else None,
            certifications=certifications,
            primary_skill=primary,
            total_certifications=len(certifications),
        )

        return CanonicalEnvelope(
            cdm_type="Skill",
            cdm_data=skill_cdm.model_dump(),
            raw_data=untouched_raw,
            source_system=source_system,
            source_protocol="SOAP_XML",
            transformation_rules_applied=[
                "CitizenId -> Skill.person_id",
                "Certification[] -> Skill.certifications",
                "Certification.Name -> SkillCertification.name",
                "Certification.Level -> SkillCertification.level",
            ],
        )

    @classmethod
    def transform_identity(cls, raw: Dict[str, Any], source_system: str = "Identity Registry") -> CanonicalEnvelope:
        untouched_raw = copy.deepcopy(raw)
        source_data = raw.get("data", raw) if isinstance(raw, dict) else {}

        person_cdm = PersonCDM(
            id=str(source_data.get("uid") or source_data.get("id") or ""),
            full_name=source_data.get("name") or source_data.get("full_name"),
            dob=source_data.get("dob"),
            gender=source_data.get("gender"),
            state=source_data.get("state"),
            is_verified=bool(source_data.get("is_verified", False)),
            identifiers={"uid": str(source_data.get("uid", ""))},
        )

        return CanonicalEnvelope(
            cdm_type="Person",
            cdm_data=person_cdm.model_dump(),
            raw_data=untouched_raw,
            source_system=source_system,
            source_protocol="REST_JSON",
            transformation_rules_applied=[
                "uid -> Person.id",
                "name -> Person.full_name",
                "dob -> Person.dob",
                "gender -> Person.gender",
                "state -> Person.state",
            ],
        )

    @classmethod
    def transform_education(cls, raw: Dict[str, Any], source_system: str = "Education Registry") -> CanonicalEnvelope:
        untouched_raw = copy.deepcopy(raw)
        source_data = raw.get("data", raw) if isinstance(raw, dict) else {}

        edu_cdm = EducationCDM(
            person_id=str(source_data.get("uid") or ""),
            highest_qualification=source_data.get("highest_qualification"),
            institution=source_data.get("institution"),
            year_of_passing=int(source_data["year_of_passing"]) if source_data.get("year_of_passing") else None,
            percentage=float(source_data["percentage"]) if source_data.get("percentage") else None,
            stream=source_data.get("stream"),
            is_verified=bool(source_data.get("is_verified", False)),
        )

        return CanonicalEnvelope(
            cdm_type="Education",
            cdm_data=edu_cdm.model_dump(),
            raw_data=untouched_raw,
            source_system=source_system,
            source_protocol="REST_JSON",
            transformation_rules_applied=[
                "uid -> Education.person_id",
                "highest_qualification -> Education.highest_qualification",
                "institution -> Education.institution",
                "year_of_passing -> Education.year_of_passing",
            ],
        )

    @classmethod
    def transform_revenue(cls, raw: Dict[str, Any], source_system: str = "Revenue Registry") -> CanonicalEnvelope:
        untouched_raw = copy.deepcopy(raw)
        source_data = raw.get("data", raw) if isinstance(raw, dict) else {}

        rev_cdm = RevenueCDM(
            person_id=str(source_data.get("uid") or ""),
            annual_income=float(source_data["annual_income"]) if source_data.get("annual_income") is not None else None,
            income_category=source_data.get("income_category"),
            land_owned_sqft=float(source_data["land_owned_sqft"]) if source_data.get("land_owned_sqft") is not None else None,
            property_tax_paid=source_data.get("property_tax_paid"),
            bpl_status=source_data.get("bpl_status"),
            state=source_data.get("state"),
            district=source_data.get("district"),
            last_assessment_year=source_data.get("last_assessment_year"),
        )

        return CanonicalEnvelope(
            cdm_type="Revenue",
            cdm_data=rev_cdm.model_dump(),
            raw_data=untouched_raw,
            source_system=source_system,
            source_protocol="DATABASE",
            transformation_rules_applied=[
                "uid -> Revenue.person_id",
                "annual_income -> Revenue.annual_income",
                "income_category -> Revenue.income_category",
                "land_owned_sqft -> Revenue.land_owned_sqft",
            ],
        )

    @classmethod
    def transform_welfare(cls, raw: Dict[str, Any], source_system: str = "Welfare Registry") -> CanonicalEnvelope:
        untouched_raw = copy.deepcopy(raw)
        source_data = raw.get("data", raw) if isinstance(raw, dict) else {}

        welfare_cdm = WelfareCDM(
            person_id=str(source_data.get("uid") or ""),
            schemes_enrolled=source_data.get("schemes_enrolled") or [],
            ration_card=source_data.get("ration_card"),
            ration_card_number=source_data.get("ration_card_number"),
            pmjay_enrolled=source_data.get("pmjay_enrolled"),
            jan_dhan_account=source_data.get("jan_dhan_account"),
            pension_enrolled=source_data.get("pension_enrolled"),
            disability_certificate=source_data.get("disability_certificate"),
        )

        return CanonicalEnvelope(
            cdm_type="Welfare",
            cdm_data=welfare_cdm.model_dump(),
            raw_data=untouched_raw,
            source_system=source_system,
            source_protocol="REST_JSON",
            transformation_rules_applied=[
                "uid -> Welfare.person_id",
                "schemes_enrolled -> Welfare.schemes_enrolled",
                "ration_card -> Welfare.ration_card",
            ],
        )

    @classmethod
    def auto_transform(cls, raw: Any, system_type: str, source_system: str = "External Registry") -> CanonicalEnvelope:
        """Route to appropriate transformer based on system type or connector code"""
        st = system_type.lower()
        if "employ" in st:
            return cls.transform_employment(raw, source_system)
        elif "skill" in st:
            return cls.transform_skill(raw, source_system)
        elif "ident" in st:
            return cls.transform_identity(raw, source_system)
        elif "educat" in st:
            return cls.transform_education(raw, source_system)
        elif "revenue" in st or "land" in st:
            return cls.transform_revenue(raw, source_system)
        elif "welfare" in st:
            return cls.transform_welfare(raw, source_system)
        else:
            # Fallback envelope
            return CanonicalEnvelope(
                cdm_type="Generic",
                cdm_data=raw if isinstance(raw, dict) else {"content": str(raw)},
                raw_data=raw,
                source_system=source_system,
                source_protocol="UNKNOWN",
                transformation_rules_applied=["pass_through"],
            )
