"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { useDepartmentStore, DEPARTMENTS } from "@/store/departmentStore";
import Link from "next/link";

interface DeptAppMock {
  id: string;
  deptCode: string;
  service: string;
  applicant: string;
  date: string;
  status: "Pending Review" | "Under Verification" | "Approved" | "Rejected";
  badgeClass: string;
}

const ALL_DEPARTMENT_APPS: DeptAppMock[] = [
  // UIDAI Applications
  { id: "APP-UIDAI-101", deptCode: "UIDAI", service: "UIDAI Aadhaar E-KYC Authentication Service", applicant: "Ramesh K. Kulkarni", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-UIDAI-102", deptCode: "UIDAI", service: "Biometric Demographic Identity Verification", applicant: "Priya V. Sharma", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-UIDAI-103", deptCode: "UIDAI", service: "OTP Factor Authentication Check", applicant: "Sanjay G. Deshmukh", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // CBDT Applications
  { id: "APP-CBDT-201", deptCode: "CBDT", service: "PAN Card & Income Criteria Verification Portal", applicant: "Meera N. Nair", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-CBDT-202", deptCode: "CBDT", service: "Below ₹2.5L Income Threshold Assessment", applicant: "Vikram S. Patil", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-CBDT-203", deptCode: "CBDT", service: "Aadhaar-PAN Link Discrepancy Verification", applicant: "Alok M. Joshi", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // ECI Applications
  { id: "APP-ECI-301", deptCode: "ECI", service: "Electoral Roll & Voter ID (EPIC) Validation", applicant: "Suresh P. Kulkarni", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-ECI-302", deptCode: "ECI", service: "Voter Identity Card Registration Audit", applicant: "Sunita R. Bhosale", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-ECI-303", deptCode: "ECI", service: "Assembly Constituency Part Serial Verification", applicant: "Deepak T. Gaikwad", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // MSRTC Applications
  { id: "APP-MSRTC-401", deptCode: "MSRTC", service: "Student & Senior Citizen Concession Bus Pass", applicant: "Ananya M. Deshmukh", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-MSRTC-402", deptCode: "MSRTC", service: "Senior Citizen 50% Transit Concession Pass", applicant: "Eknath G. Shinde", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-MSRTC-403", deptCode: "MSRTC", service: "Inter-District Monthly Transit Pass Renewal", applicant: "Rahul K. Tambe", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // EDU Applications
  { id: "APP-EDU-501", deptCode: "EDU", service: "University Degree & Marksheet Verification", applicant: "Pooja V. Jadhav", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-EDU-502", deptCode: "EDU", service: "Diploma Marksheet Authentication via NAD", applicant: "Nilesh A. Chavan", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-EDU-503", deptCode: "EDU", service: "Post-Graduate Transcript Registrar Audit", applicant: "Archana S. Pawar", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // SKILL Applications
  { id: "APP-SKILL-601", deptCode: "SKILL", service: "Unified Skill Benefit & Stipend Allowance", applicant: "Rajesh B. Sharma", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-SKILL-602", deptCode: "SKILL", service: "Training Attendance 94% Audit & Verification", applicant: "Kavita D. Salunkhe", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-SKILL-603", deptCode: "SKILL", service: "PFMS Bank Account Penny-Drop Confirm", applicant: "Ganesh R. Mane", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // ULB Applications
  { id: "APP-ULB-701", deptCode: "ULB", service: "Municipal Property Tax & Utility Clearance NOC", applicant: "Amit K. Verma", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-ULB-702", deptCode: "ULB", service: "Residential Property Tax No-Dues Certificate", applicant: "Sarita V. Thorat", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-ULB-703", deptCode: "ULB", service: "Civic Water Utility Assessment NOC Audit", applicant: "Nitin P. Shinde", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },
];

export default function OfficerDashboardPage() {
  const { activeDepartment } = useDepartmentStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load officer stats", err);
      }
    }
    loadStats();
  }, []);

  const currentDeptInfo = DEPARTMENTS[activeDepartment] || DEPARTMENTS.ALL;

  const filteredApps = activeDepartment === "ALL"
    ? ALL_DEPARTMENT_APPS
    : ALL_DEPARTMENT_APPS.filter((a) => a.deptCode === activeDepartment);

  const pendingCount = filteredApps.filter((a) => a.status === "Pending Review").length;
  const underVerifyCount = filteredApps.filter((a) => a.status === "Under Verification").length;
  const approvedCount = filteredApps.filter((a) => a.status === "Approved").length;

  return (
    <AppShell title={`${currentDeptInfo.shortName} Dashboard`} breadcrumb={["Home", "Department Officer", `${currentDeptInfo.shortName} Dashboard`]}>
      {/* ── 1. Hero Monument Banner Section ────────────────── */}
      <div
        style={{
          borderRadius: 20,
          backgroundImage: "linear-gradient(135deg, rgba(7, 21, 41, 0.94) 0%, rgba(12, 32, 68, 0.95) 100%), url('/hero_bg_india_gate.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#ffffff",
          padding: "36px 32px",
          marginBottom: 28,
          boxShadow: "0 10px 30px rgba(7, 21, 41, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, maxWidth: 900 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{currentDeptInfo.sealEmoji}</span>
            <span style={{ fontSize: 11, fontWeight: 900, background: "#10b981", color: "#ffffff", padding: "3px 10px", borderRadius: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              OFFICER PORTAL ACTIVE
            </span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 6, lineHeight: 1.2 }}>
            GovBridge<span style={{ color: "#38bdf8" }}>.gov.in</span> — {currentDeptInfo.fullName}
          </h1>
          <p style={{ fontSize: 14, color: "#cbd5e1", fontWeight: 500, marginBottom: 20 }}>
            Where Government Information &amp; Instant Services Converge &bull; Authority: <strong style={{ color: "#ffffff" }}>{currentDeptInfo.authority}</strong>
          </p>

          {/* Unified Search Bar */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              padding: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              maxWidth: 760,
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 18, marginLeft: 10, color: "#64748b" }}>🔍</span>
            <input
              type="text"
              placeholder="Search for schemes, applications, PAN, Voter ID, Aadhaar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 13.5,
                color: "#0f172a",
                padding: "8px 4px",
                background: "transparent",
              }}
            />
            <select
              style={{
                border: "none",
                outline: "none",
                background: "#f1f5f9",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <option>All Categories</option>
              <option>Public Transport</option>
              <option>Identity Verification</option>
              <option>Taxation &amp; Revenue</option>
              <option>Academic Credentials</option>
            </select>
            <button
              style={{
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)",
              }}
            >
              Search
            </button>
          </div>

          {/* Trending Searches */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11.5, color: "#cbd5e1" }}>
            <span style={{ fontWeight: 800, color: "#ffffff" }}>Trending Searches :</span>
            {["Aadhaar E-KYC", "Bus Concession", "PAN Validation", "School Degree Vault", "Property NOC"].map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  padding: "3px 10px",
                  borderRadius: 12,
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. DPI Quotes Banner ─────────────────────────────── */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          borderLeft: "5px solid #dc2626",
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ fontSize: 24, lineHeight: 1 }}>💬</div>
        <div style={{ flex: 1, fontSize: 12.5, color: "#334155", fontStyle: "italic", lineHeight: 1.5 }}>
          "India's Digital Public Infrastructure has demonstrated how technology can expand opportunity, improve governance, boost financial inclusion and deliver services for hundreds of millions of people."
        </div>
        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>Prime Minister of India</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Digital India Governance Vision</div>
        </div>
      </div>

      {/* ── 3. Key Metric Stat Counters Section ────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { icon: "🪪", count: "13,989+", label: "Online Services" },
          { icon: "🏛️", count: "750+", label: "Central Schemes" },
          { icon: "👥", count: "32+", label: "Citizen Consultations" },
          { icon: "🎓", count: "1,207+", label: "Academic Credentials" },
          { icon: "🚌", count: "4,003+", label: "Transit Passes Issued" },
          { icon: "🗳️", count: "18", label: "Civic Registries" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#ffffff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              padding: "14px 16px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 2 }}>{item.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{item.count}</div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* ── 4. Persona Governance Services Section ─────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            TAILORED GOVERNANCE SERVICES
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
            Tailored Governance Services for Every Citizen &amp; Department
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { title: "General Citizen", icon: "👤", desc: "Aadhaar E-KYC, PAN & Electoral Voter Registration", badge: "Essential Identity", color: "#dc2626" },
            { title: "Student & Youth", icon: "🎓", desc: "Concession Bus Pass, Marksheet Verification & Skill Missions", badge: "Student Benefit", color: "#1d4ed8" },
            { title: "Farmers & Workers", icon: "🌾", desc: "DBT Direct Benefit Transfer, PM-Kisan & Skill Stipend", badge: "DBT Allowance", color: "#15803d" },
            { title: "Senior Citizens", icon: "👴", desc: "PMSBY ₹20/yr Insurance, Pension & Utility Clearance", badge: "Welfare & Pension", color: "#7c3aed" },
          ].map((persona) => (
            <div
              key={persona.title}
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: `1px solid ${persona.color}30`,
                borderTop: `4px solid ${persona.color}`,
                padding: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{persona.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 800, background: `${persona.color}15`, color: persona.color, padding: "2px 8px", borderRadius: 8 }}>
                  {persona.badge}
                </span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{persona.title}</h3>
              <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4, marginBottom: 14 }}>{persona.desc}</p>
              <Link
                href="/services"
                style={{
                  display: "inline-block",
                  width: "100%",
                  textAlign: "center",
                  background: persona.color,
                  color: "#ffffff",
                  padding: "7px 12px",
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Access {persona.title} Services &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Official Departmental Services Grid ─────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            OFFICIAL DEPARTMENTAL SERVICES &amp; SCHEMES DIRECTORY
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
            Official Inter-Departmental Integrated Services
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {[
            { title: "UIDAI Aadhaar E-KYC Service", icon: "🪪", dept: "Unique Identification Authority of India (UIDAI)", sla: "Instant (0s)", desc: "Biometric & OTP demographic identity verification across central registries.", href: "/services/aadhaar-kyc" },
            { title: "PAN Card & Income Verification", icon: "₹", dept: "Income Tax Department / CBDT", sla: "5 Mins SLA", desc: "Verify PAN validity and tax-assessed income threshold for welfare eligibility.", href: "/services/pan-verification" },
            { title: "Electoral Roll & Voter ID Validation", icon: "🗳️", dept: "Election Commission of India (ECI)", sla: "Instant Sync", desc: "Verify voter EPIC status, assembly constituency, and voter registration record.", href: "/services/voter-id" },
            { title: "Student & Citizen Concession Bus Pass", icon: "🚌", dept: "State Road Transport Corporation (MSRTC)", sla: "24 Hours SLA", desc: "Apply and renew student concession pass with instant UIDAI & school code validation.", href: "/services/bus-pass" },
            { title: "University Degree & Marksheet Verification", icon: "🎓", dept: "Higher & Technical Education Dept / NAD", sla: "12 Hours SLA", desc: "Verify university degrees and academic marksheets instantly via DigiLocker NAD.", href: "/services/education-degree" },
            { title: "Unified Skill Benefit & Stipend Allowance", icon: "⚡", dept: "Department of Skill & Employment (MSDE)", sla: "48 Hours SLA", desc: "Direct benefit transfer (DBT) for certified skill training candidates via PFMS.", href: "/services/skill-employment" },
            { title: "Municipal Property Tax & Utility Clearance NOC", icon: "🏙️", dept: "Urban Local Bodies / Municipal Corporation", sla: "72 Hours SLA", desc: "Digital No-Dues Certificate (NOC) for residential property tax and municipal dues.", href: "/services/property-noc" },
          ].map((service) => (
            <div
              key={service.title}
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                padding: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>{service.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, background: "#f0fdf4", color: "#16a34a", padding: "3px 8px", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                    {service.sla}
                  </span>
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{service.title}</h3>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>{service.dept}</div>
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45, marginBottom: 16 }}>{service.desc}</p>
              </div>

              <Link
                href={service.href}
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "#059669",
                  color: "#ffffff",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Apply Now &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Department Applications Register & Queue ─────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>📋</span>
            <span>APPLICATIONS REQUIRING ACTION ({currentDeptInfo.shortName})</span>
          </div>
          <Link href="/applications" className="gov-btn gov-btn-secondary gov-btn-sm">
            View Full Register &rarr;
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Application No</th>
                <th>Department Service Name</th>
                <th>Applicant Name</th>
                <th>Date Received</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong style={{ color: "#2563eb", fontFamily: "var(--font-mono)" }}>{app.id}</strong>
                  </td>
                  <td style={{ fontWeight: 600 }}>{app.service}</td>
                  <td>{app.applicant}</td>
                  <td style={{ color: "#64748b", fontSize: 12 }}>{app.date}</td>
                  <td>
                    <span className={`gov-badge ${app.badgeClass}`}>{app.status}</span>
                  </td>
                  <td>
                    <Link href={`/applications/${app.id}`} className="gov-btn gov-btn-primary gov-btn-sm">
                      View Application
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
