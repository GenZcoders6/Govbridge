"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

interface ServiceItem {
  id: string;
  title: string;
  department: string;
  category: string;
  description: string;
  sla: string;
  protocol: string;
  icon: string;
  href: string;
  docs: string[];
  badge: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "aadhaar-kyc",
    title: "UIDAI Aadhaar E-KYC Service",
    department: "Unique Identification Authority of India (UIDAI)",
    category: "Identity & Verification",
    description: "Instant biometric and OTP-based demographic identity verification across official government registries.",
    sla: "Instant (Real-time API)",
    protocol: "REST / JSON API",
    icon: "🪪",
    href: "/services/aadhaar-kyc",
    docs: ["Aadhaar Number (12 Digits)", "Registered Mobile Number"],
    badge: "Essential Identity",
  },
  {
    id: "pan-verification",
    title: "PAN Card & Income Verification Portal",
    department: "Income Tax Department / Central Board of Direct Taxes",
    category: "Revenue & Taxation",
    description: "Verify Permanent Account Number (PAN) validity and tax-assessed income eligibility for government benefits.",
    sla: "5 Minutes (Automated Check)",
    protocol: "Direct Database Adapter",
    icon: "₹",
    href: "/services/pan-verification",
    docs: ["PAN Number (10 Alphanumeric)", "Financial Year Assessment"],
    badge: "Financial Status",
  },
  {
    id: "voter-id",
    title: "Electoral Roll & Voter ID Validation",
    department: "Election Commission of India (ECI)",
    category: "Citizenship & Electoral",
    description: "Verify voter identity card details, electoral constituency registration, and polling station location.",
    sla: "Instant (Real-time Sync)",
    protocol: "REST / JSON API",
    icon: "🗳️",
    href: "/services/voter-id",
    docs: ["EPIC Voter ID Number", "State & Assembly District"],
    badge: "Civic Registry",
  },
  {
    id: "bus-pass",
    title: "Student & Senior Citizen Concession Bus Pass",
    department: "State Road Transport Corporation (MSRTC)",
    category: "Public Transport",
    description: "Apply for subsidized monthly transit bus passes with automatic school/college enrollment & age verification.",
    sla: "24 Hours (1 Business Day)",
    protocol: "Multi-Registry API (Education + Transport)",
    icon: "🚌",
    href: "/services/bus-pass",
    docs: ["Aadhaar / ID Card", "Bonafide Student Certificate / Age Proof"],
    badge: "Public Transport",
  },
  {
    id: "education-degree",
    title: "University Degree & Marksheet Verification",
    department: "Higher & Technical Education Department",
    category: "Education & Academics",
    description: "Cross-verify university degrees, diploma certificates, and academic marksheets directly from state university servers.",
    sla: "12 Hours (Database Sync)",
    protocol: "REST / JSON API",
    icon: "🎓",
    href: "/services/education-degree",
    docs: ["PRN / Enrollment Number", "University Name & Passing Year"],
    badge: "Academic Credential",
  },
  {
    id: "skill-employment",
    title: "Unified Skill Benefit & Apprenticeship Allowance",
    department: "Department of Skill Development & Employment",
    category: "Skill & Employment",
    description: "Integrated application for NSQF skill certification verification, employment exchange status, and monthly stipend disbursement.",
    sla: "48 Hours (2 Business Days)",
    protocol: "SOAP / XML + REST Adapter",
    icon: "⚡",
    href: "/services/skill-employment",
    docs: ["Skill Certificate Number", "Employment Registration ID", "Bank Account Details"],
    badge: "DBT Allowance",
  },
  {
    id: "property-noc",
    title: "Municipal Property Tax & Utility Clearance NOC",
    department: "Urban Local Body / Municipal Corporation",
    category: "Urban Local Governance",
    description: "Obtain no-dues certificate for property taxes, water charges, and civic utility assessments for municipal services.",
    sla: "72 Hours (3 Business Days)",
    protocol: "Direct Database Query",
    icon: "🏛️",
    href: "/services/property-noc",
    docs: ["Property Assessment ID", "Latest Utility Bill Receipt"],
    badge: "Civic Clearance",
  },
];

export default function ServicesPage() {
  return (
    <AppShell title="Departmental Services Catalogue" subtitle="Official Government e-Services Portal">
      {/* Header Banner */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            State e-Governance Services Portal
          </div>
          <h1 className="page-header-title" style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
            Departmental Services Catalogue
          </h1>
          <p className="page-header-subtitle">
            Apply directly for official government certificates, concession passes, and verified benefit schemes powered by GovBridge API Interoperability.
          </p>
        </div>
      </div>

      {/* Grid of Services */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {SERVICES.map((s) => (
          <div
            key={s.id}
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <div className="card-body" style={{ padding: 20 }}>
              {/* Header Icon + Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  {s.icon}
                </div>
                <span className="badge badge-info" style={{ fontSize: 11, fontWeight: 600 }}>
                  {s.badge}
                </span>
              </div>

              {/* Title & Department */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4, lineHeight: 1.3 }}>
                {s.title}
              </h3>
              <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, marginBottom: 10 }}>
                {s.department}
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 16 }}>
                {s.description}
              </p>

              {/* Metadata: SLA & Protocol */}
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>Turnaround SLA:</span>
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>{s.sla}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Connector Protocol:</span>
                  <span style={{ fontWeight: 600, fontFamily: "monospace", color: "#475569", fontSize: 11 }}>{s.protocol}</span>
                </div>
              </div>

              {/* Required Documents */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                  Required Information:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#475569" }}>
                  {s.docs.map((doc, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Footer */}
            <div
              style={{
                padding: "14px 20px",
                background: "#fafafa",
                borderTop: "1px solid #f1f5f9",
                borderRadius: "0 0 14px 14px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Link href={s.href} className="btn btn-primary btn-sm" style={{ padding: "8px 16px" }}>
                Apply for Service →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
