"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useDepartmentStore, DEPARTMENTS } from "@/store/departmentStore";

interface AppRecord {
  id: string;
  deptCode: string;
  applicant: string;
  service: string;
  date: string;
  stage: string;
  status: "Pending Review" | "Under Verification" | "Approved" | "Rejected";
  badgeClass: string;
}

const APPLICATIONS_DATA: AppRecord[] = [
  // UIDAI
  { id: "APP-UIDAI-101", deptCode: "UIDAI", applicant: "Ramesh K. Kulkarni", service: "UIDAI Aadhaar E-KYC Authentication Service", date: "27/09/2026", stage: "Demographic Auth", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-UIDAI-102", deptCode: "UIDAI", applicant: "Priya V. Sharma", service: "Biometric Demographic Identity Verification", date: "27/09/2026", stage: "CIDR Verified", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-UIDAI-103", deptCode: "UIDAI", applicant: "Sanjay G. Deshmukh", service: "OTP Factor Authentication Check", date: "26/09/2026", stage: "OTP Verification", status: "Under Verification", badgeClass: "gov-badge-info" },

  // CBDT
  { id: "APP-CBDT-201", deptCode: "CBDT", applicant: "Meera N. Nair", service: "PAN Card & Income Criteria Verification Portal", date: "27/09/2026", stage: "Income Assessment", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-CBDT-202", deptCode: "CBDT", applicant: "Vikram S. Patil", service: "Below ₹2.5L Income Threshold Assessment", date: "27/09/2026", stage: "Tax Threshold Verified", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-CBDT-203", deptCode: "CBDT", applicant: "Alok M. Joshi", service: "Aadhaar-PAN Link Discrepancy Verification", date: "26/09/2026", stage: "ITD Database Match", status: "Under Verification", badgeClass: "gov-badge-info" },

  // ECI
  { id: "APP-ECI-301", deptCode: "ECI", applicant: "Suresh P. Kulkarni", service: "Electoral Roll & Voter ID (EPIC) Validation", date: "27/09/2026", stage: "EPIC Verified", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-ECI-302", deptCode: "ECI", applicant: "Sunita R. Bhosale", service: "Voter Identity Card Registration Audit", date: "27/09/2026", stage: "ERO Review", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-ECI-303", deptCode: "ECI", applicant: "Deepak T. Gaikwad", service: "Assembly Constituency Part Serial Verification", date: "26/09/2026", stage: "ERONET Sync", status: "Under Verification", badgeClass: "gov-badge-info" },

  // MSRTC
  { id: "APP-MSRTC-401", deptCode: "MSRTC", applicant: "Ananya M. Deshmukh", service: "Student & Senior Citizen Concession Bus Pass", date: "27/09/2026", stage: "Depot Verification", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-MSRTC-402", deptCode: "MSRTC", applicant: "Eknath G. Shinde", service: "Senior Citizen 50% Transit Concession Pass", date: "27/09/2026", stage: "Pass Issued", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-MSRTC-403", deptCode: "MSRTC", applicant: "Rahul K. Tambe", service: "Inter-District Monthly Transit Pass Renewal", date: "26/09/2026", stage: "Route Validation", status: "Under Verification", badgeClass: "gov-badge-info" },

  // EDU
  { id: "APP-EDU-501", deptCode: "EDU", applicant: "Pooja V. Jadhav", service: "University Degree & Marksheet Verification", date: "27/09/2026", stage: "NAD Sync Verified", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-EDU-502", deptCode: "EDU", applicant: "Nilesh A. Chavan", service: "Diploma Marksheet Authentication via NAD", date: "27/09/2026", stage: "Registrar Review", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-EDU-503", deptCode: "EDU", applicant: "Archana S. Pawar", service: "Post-Graduate Transcript Registrar Audit", date: "26/09/2026", stage: "Degree Vault Check", status: "Under Verification", badgeClass: "gov-badge-info" },

  // SKILL
  { id: "APP-SKILL-601", deptCode: "SKILL", applicant: "Rajesh B. Sharma", service: "Unified Skill Benefit & Stipend Allowance", date: "27/09/2026", stage: "Officer Review", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-SKILL-602", deptCode: "SKILL", applicant: "Kavita D. Salunkhe", service: "Training Attendance 94% Audit & Verification", date: "27/09/2026", stage: "PFMS Dispatched", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-SKILL-603", deptCode: "SKILL", applicant: "Ganesh R. Mane", service: "PFMS Bank Account Penny-Drop Confirm", date: "26/09/2026", stage: "Bank Penny Drop", status: "Under Verification", badgeClass: "gov-badge-info" },

  // ULB
  { id: "APP-ULB-701", deptCode: "ULB", applicant: "Amit K. Verma", service: "Municipal Property Tax & Utility Clearance NOC", date: "27/09/2026", stage: "NOC Certificate Issued", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-ULB-702", deptCode: "ULB", applicant: "Sarita V. Thorat", service: "Residential Property Tax No-Dues Certificate", date: "27/09/2026", stage: "Revenue Audit", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-ULB-703", deptCode: "ULB", applicant: "Nitin P. Shinde", service: "Civic Water Utility Assessment NOC Audit", date: "26/09/2026", stage: "Utility Dues Check", status: "Under Verification", badgeClass: "gov-badge-info" },
];

export default function ApplicationsPage() {
  const { activeDepartment } = useDepartmentStore();
  const currentDept = DEPARTMENTS[activeDepartment] || DEPARTMENTS.ALL;

  const [appNo, setAppNo] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [status, setStatus] = useState("ALL");
  const [localApps, setLocalApps] = useState<AppRecord[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("gb_local_applications") || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        const mapped: AppRecord[] = stored.map((item: { id?: string; department_id?: string; form_data?: { full_name?: string; service?: string }; title?: string; submitted_at?: string; created_at?: string }) => ({
          id: item.id || "APP-2026-NEW",
          deptCode: item.department_id || "MSRTC",
          applicant: item.form_data?.full_name || "Sunil Patil",
          service: item.form_data?.service || item.title || "Government Service",
          date: new Date(item.submitted_at || item.created_at || Date.now()).toLocaleDateString("en-IN"),
          stage: "Automated Verifications",
          status: "Pending Review",
          badgeClass: "gov-badge-warning",
        }));
        setLocalApps(mapped);
      }
    } catch {
      // ignore
    }
  }, []);

  const allApps = useMemo(() => [...localApps, ...APPLICATIONS_DATA], [localApps]);

  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      const matchDept = activeDepartment === "ALL" || app.deptCode === activeDepartment;
      const matchNo = !appNo || app.id.toLowerCase().includes(appNo.toLowerCase());
      const matchName = !applicantName || app.applicant.toLowerCase().includes(applicantName.toLowerCase());
      const matchStatus = status === "ALL" || app.status === status;
      return matchDept && matchNo && matchName && matchStatus;
    });
  }, [allApps, activeDepartment, appNo, applicantName, status]);

  const handleReset = () => {
    setAppNo("");
    setApplicantName("");
    setStatus("ALL");
  };

  return (
    <AppShell title={`${currentDept.shortName} Applications`} breadcrumb={["Home", "Department Officer", "Applications", currentDept.shortName]}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>{currentDept.sealEmoji}</span>
            <h1 className="page-header-title" style={{ margin: 0 }}>
              {currentDept.fullName} — Applications
            </h1>
            <span className="gov-badge gov-badge-info" style={{ borderRadius: 12 }}>
              REGISTER VIEW
            </span>
          </div>
          <div className="page-header-subtitle">
            Official Applications Processing &amp; Verification Register ({currentDept.serviceCode})
          </div>
        </div>
      </div>

      {/* Filter Form Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ background: "#f8fafc", color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔍</span>
            <span>FILTER DEPARTMENT APPLICATIONS ({currentDept.shortName})</span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Application Reference No:</label>
              <input
                type="text"
                className="gov-input"
                placeholder="e.g. APP-UIDAI-101"
                value={appNo}
                onChange={(e) => setAppNo(e.target.value)}
              />
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Applicant Name:</label>
              <input
                type="text"
                className="gov-input"
                placeholder="Enter applicant name..."
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
              />
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Status:</label>
              <select className="gov-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button className="gov-btn gov-btn-primary">Filter Register</button>
            <button className="gov-btn gov-btn-secondary" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      {/* Applications Register Table Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>📋</span>
            <span>{currentDept.shortName} Application Register</span>
          </div>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Showing {filteredApps.length} applications</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Application No</th>
                <th>Applicant</th>
                <th>Department Service Name</th>
                <th>Submission Date</th>
                <th>Current Stage</th>
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
                  <td style={{ fontWeight: 600 }}>{app.applicant}</td>
                  <td>{app.service}</td>
                  <td style={{ color: "#64748b", fontSize: 12 }}>{app.date}</td>
                  <td><span className="gov-badge gov-badge-muted">{app.stage}</span></td>
                  <td>
                    <span className={`gov-badge ${app.badgeClass}`}>{app.status}</span>
                  </td>
                  <td>
                    <Link href={`/applications/${app.id}`} className="gov-btn gov-btn-primary gov-btn-sm">
                      Action / Review
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
