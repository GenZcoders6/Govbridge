/**
 * Department Context Store (SIH26129)
 * Manages active department selection across the Officer Portal so that
 * every section (Dashboard, Applications, Services, Workflow, Connectors, Reports)
 * displays data specific to the selected department.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DepartmentCode = "ALL" | "UIDAI" | "CBDT" | "ECI" | "MSRTC" | "EDU" | "SKILL" | "ULB";

export interface DepartmentDetails {
  code: DepartmentCode;
  shortName: string;
  fullName: string;
  authority: string;
  ministry: string;
  serviceCode: string;
  serviceName: string;
  officerRole: string;
  sealEmoji: string;
}

export const DEPARTMENTS: Record<DepartmentCode, DepartmentDetails> = {
  ALL: {
    code: "ALL",
    shortName: "All Departments",
    fullName: "All Interoperable Government Departments",
    authority: "State Interoperability Governance Centre",
    ministry: "General Administration Department (IT), Govt of Maharashtra",
    serviceCode: "ALL-SERVICES",
    serviceName: "All Integrated Government Services",
    officerRole: "Interoperability Officer / Admin",
    sealEmoji: "🏛️",
  },
  UIDAI: {
    code: "UIDAI",
    shortName: "UIDAI (Aadhaar)",
    fullName: "Unique Identification Authority of India",
    authority: "UIDAI Central Identity Data Repository (CIDR)",
    ministry: "Ministry of Electronics & IT (MeitY), Govt of India",
    serviceCode: "UIDAI-KYC-001",
    serviceName: "UIDAI Aadhaar E-KYC Authentication Service",
    officerRole: "UIDAI Authentication Verification Officer",
    sealEmoji: "🪪",
  },
  CBDT: {
    code: "CBDT",
    shortName: "CBDT (Income Tax)",
    fullName: "Income Tax Department / Central Board of Direct Taxes",
    authority: "Central Board of Direct Taxes (CBDT)",
    ministry: "Ministry of Finance, Govt of India",
    serviceCode: "CBDT-PAN-002",
    serviceName: "PAN Card & Income Criteria Verification Portal",
    officerRole: "Income Tax Verification Officer",
    sealEmoji: "₹",
  },
  ECI: {
    code: "ECI",
    shortName: "ECI (Election Comm)",
    fullName: "Election Commission of India",
    authority: "Constitutional Electoral Authority & ERONET",
    ministry: "Election Commission of India",
    serviceCode: "ECI-VOTER-003",
    serviceName: "Electoral Roll & Voter ID (EPIC) Validation",
    officerRole: "Electoral Registration Officer (ERO)",
    sealEmoji: "🗳️",
  },
  MSRTC: {
    code: "MSRTC",
    shortName: "MSRTC (Transport)",
    fullName: "Maharashtra State Road Transport Corporation",
    authority: "State Transport Corporation & Depot Authority",
    ministry: "Ministry of Transport, Govt of Maharashtra",
    serviceCode: "TRANS-BUSPASS-004",
    serviceName: "Student & Senior Citizen Concession Bus Pass",
    officerRole: "MSRTC Bus Depot Pass Officer",
    sealEmoji: "🚌",
  },
  EDU: {
    code: "EDU",
    shortName: "EDU (DigiLocker NAD)",
    fullName: "DigiLocker National Academic Depository",
    authority: "University Grants Commission / DigiLocker NAD",
    ministry: "Ministry of Education, Govt of India",
    serviceCode: "EDU-NAD-005",
    serviceName: "University Degree & Marksheet Verification",
    officerRole: "University Academic Verification Registrar",
    sealEmoji: "🎓",
  },
  SKILL: {
    code: "SKILL",
    shortName: "SKILL (MSDE / PFMS)",
    fullName: "Ministry of Skill Development & Entrepreneurship",
    authority: "Skill India Digital Hub & PFMS Subsystem",
    ministry: "Ministry of Skill Development & Entrepreneurship",
    serviceCode: "SKILL-DBT-006",
    serviceName: "Unified Skill Benefit & Stipend Allowance",
    officerRole: "MSDE Skill Certification & DBT Officer",
    sealEmoji: "⚡",
  },
  ULB: {
    code: "ULB",
    shortName: "ULB (Municipal Corp)",
    fullName: "Urban Local Body (ULB / Municipal Corporation)",
    authority: "Municipal Revenue & Utility Billing Engine",
    ministry: "State Urban Development Department, Govt of Maharashtra",
    serviceCode: "ULB-NOC-007",
    serviceName: "Municipal Property Tax & Utility Clearance NOC",
    officerRole: "Municipal Revenue & Water Dues Inspector",
    sealEmoji: "🏛️",
  },
};

interface DepartmentStoreState {
  activeDepartment: DepartmentCode;
  setActiveDepartment: (code: DepartmentCode) => void;
}

export const useDepartmentStore = create<DepartmentStoreState>()(
  persist(
    (set) => ({
      activeDepartment: "ALL",
      setActiveDepartment: (activeDepartment) => set({ activeDepartment }),
    }),
    {
      name: "govbridge-department",
    }
  )
);
