"""
GovBridge Privacy & Data Masking Module
SIH26129 Governance, Privacy & Security
Provides synthetic data anonymization, selective masking, and DPDP-compliant redaction.
"""
import re
from typing import Any, Dict, List, Optional


def mask_phone(phone: Optional[str]) -> str:
    """
    Mask phone number to privacy standard.
    Example: '+91 9876543284' -> '+91 ******284'
    """
    if not phone:
        return "+91 ******000"
    
    # Extract digits
    digits = re.sub(r"\D", "", phone)
    if len(digits) >= 10:
        last3 = digits[-3:]
        return f"+91 ******{last3}"
    elif len(digits) >= 3:
        return f"******{digits[-3:]}"
    return "******000"


def mask_citizen_id(citizen_id: Optional[str]) -> str:
    """
    Mask Master Citizen ID.
    Example: 'MAHA-CIT-10284' -> 'MAHA-****-10284'
    """
    if not citizen_id:
        return "CIT-****-00000"
    
    parts = citizen_id.split("-")
    if len(parts) >= 3:
        prefix = parts[0]
        suffix = parts[-1]
        return f"{prefix}-****-{suffix}"
    elif len(parts) == 2:
        return f"{parts[0]}-****"
    elif len(citizen_id) > 5:
        return f"{citizen_id[:2]}****{citizen_id[-3:]}"
    return f"{citizen_id}****"


def mask_email(email: Optional[str]) -> str:
    """
    Mask email address to privacy standard.
    Example: 'sunil.patil@example.gov.in' -> 's***@example.gov.in'
    """
    if not email or "@" not in email:
        return "user@example.gov.in"
    
    local_part, domain = email.split("@", 1)
    if len(local_part) <= 1:
        masked_local = f"{local_part}***"
    else:
        masked_local = f"{local_part[0]}***"
    return f"{masked_local}@{domain}"


def mask_aadhaar(aadhaar: Optional[str]) -> str:
    """
    Mask Aadhaar / National ID.
    Example: '1234 5678 9012' -> '****-****-9012'
    """
    if not aadhaar:
        return "****-****-0000"
    digits = re.sub(r"\D", "", str(aadhaar))
    if len(digits) >= 4:
        return f"****-****-{digits[-4:]}"
    return "****-****-0000"


def mask_sensitive_payload(data: Any, disallowed_fields: Optional[List[str]] = None) -> Any:
    """
    Recursively redacts or masks sensitive synthetic citizen information.
    Removes strictly prohibited fields like salary, detailed ledger, or private contact details.
    """
    disallowed = set(f.lower() for f in (disallowed_fields or []))

    if isinstance(data, dict):
        cleaned = {}
        for k, v in data.items():
            k_lower = k.lower()
            # If field is explicitly disallowed, strip it
            if any(dis in k_lower for dis in disallowed):
                continue
            
            # Mask recognized sensitive fields
            if "phone" in k_lower or "mobile" in k_lower:
                cleaned[k] = mask_phone(str(v)) if v else None
            elif "email" in k_lower:
                cleaned[k] = mask_email(str(v)) if v else None
            elif "aadhaar" in k_lower or "uidai" in k_lower:
                cleaned[k] = mask_aadhaar(str(v)) if v else None
            elif k_lower in ("master_uid", "citizen_uid", "master_id") and isinstance(v, str):
                cleaned[k] = mask_citizen_id(v)
            else:
                cleaned[k] = mask_sensitive_payload(v, disallowed_fields)
        return cleaned

    elif isinstance(data, list):
        return [mask_sensitive_payload(item, disallowed_fields) for item in data]
    
    return data
