"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuthStore } from "@/store/authStore";
import { useDepartmentStore, DEPARTMENTS, type DepartmentCode } from "@/store/departmentStore";

interface DepartmentPreset {
  serviceName: string;
  deptName: string;
  subsystem: string;
  sla: string;
  checkCategory: string;
  registry: string;
  matchScore: string;
}

const DEPT_PRESETS: Record<DepartmentCode, DepartmentPreset> = {
  ALL: {
    serviceName: "Unified Skill Benefit & Stipend Allowance",
    deptName: "Ministry of Skill Development & Entrepreneurship (MSDE)",
    subsystem: "Skill India Digital Hub & PFMS DBT",
    sla: "48 Hours (2 Business Days)",
    checkCategory: "Skill & DBT Verification",
    registry: "NSDC / PFMS Gateway",
    matchScore: "Verified (SHA-256)",
  },
  MSRTC: {
    serviceName: "Student & Senior Citizen Concession Bus Pass",
    deptName: "Maharashtra State Road Transport Corporation (MSRTC)",
    subsystem: "MSRTC Bus Depot Concession Subsystem",
    sla: "24 Hours (Next Day Dispatch)",
    checkCategory: "Depot Route & Concession Verification",
    registry: "MSRTC Transit Depot Register",
    matchScore: "Route Pass Validated (100%)",
  },
  UIDAI: {
    serviceName: "UIDAI Aadhaar E-KYC Authentication Service",
    deptName: "Unique Identification Authority of India (UIDAI)",
    subsystem: "UIDAI CIDR Gateway & Aadhaar Tokenizer",
    sla: "Instant (0 Seconds Sync)",
    checkCategory: "Demographic & Biometric E-KYC",
    registry: "UIDAI Aadhaar CIDR Gateway",
    matchScore: "Token Matched (SHA-256)",
  },
  CBDT: {
    serviceName: "PAN Card & Income Criteria Verification Portal",
    deptName: "Income Tax Department / Central Board of Direct Taxes (CBDT)",
    subsystem: "ITD Taxpayer Vault & PAN Linking Engine",
    sla: "5 Minutes Real-time Check",
    checkCategory: "Income Slab & Tax Threshold Assessment",
    registry: "CBDT Tax Assessment Connector",
    matchScore: "Under ₹2.5L Threshold (Verified)",
  },
  ECI: {
    serviceName: "Electoral Roll & Voter ID (EPIC) Validation",
    deptName: "Election Commission of India (ECI)",
    subsystem: "ERONET Electoral Register Sync Gateway",
    sla: "Instant Real-time Sync",
    checkCategory: "EPIC Voter ID & Part Serial Validation",
    registry: "ERONET National Voter Service Portal",
    matchScore: "EPIC Record Active & Matched",
  },
  EDU: {
    serviceName: "University Degree & Marksheet Verification",
    deptName: "Higher & Technical Education Department / NAD",
    subsystem: "DigiLocker NAD Academic Repository Vault",
    sla: "12 Hours (Academic Sync)",
    checkCategory: "University Marksheet & Degree Hash Audit",
    registry: "National Academic Depository (NAD)",
    matchScore: "Degree Hash Match 100%",
  },
  SKILL: {
    serviceName: "Unified Skill Benefit & Stipend Allowance",
    deptName: "Ministry of Skill Development & Entrepreneurship (MSDE)",
    subsystem: "Skill India Digital Hub & PFMS DBT Subsystem",
    sla: "48 Hours (2 Business Days)",
    checkCategory: "NSQF Certification & PFMS Penny-Drop",
    registry: "NSDC Skill India Digital Subsystem",
    matchScore: "Candidate ID Valid (94% Attendance)",
  },
  ULB: {
    serviceName: "Municipal Property Tax & Utility Clearance NOC",
    deptName: "Urban Local Body (ULB / Municipal Corporation)",
    subsystem: "Municipal Property Tax & Water Dues Engine",
    sla: "72 Hours (3 Business Days)",
    checkCategory: "Property Tax No-Dues & Civic Utility NOC",
    registry: "Municipal Revenue Database",
    matchScore: "Zero Dues Clearance Certificate Ready",
  },
};

export default function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const appId = resolvedParams.id || "APP-2026-1048";

  const { user } = useAuthStore();
  const { activeDepartment, setActiveDepartment } = useDepartmentStore();
  const isCitizen = user?.role === "CITIZEN";

  const [decision, setDecision] = useState("Approve");
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Dynamic application state loaded from localStorage or selected department
  const [applicantName, setApplicantName] = useState("Sunil Patil");
  const [mobile, setMobile] = useState("+91 98765 43284");
  const [email, setEmail] = useState("sunil.patil@govbridge.demo");
  const [appDate, setAppDate] = useState("28/09/2026 04:15 PM");
  const [submittedDept, setSubmittedDept] = useState<DepartmentCode | null>(null);

  // Load newly submitted application from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("gb_local_applications") || "[]");
        const found = stored.find(
          (a: { id?: string; reference_number?: string; department_id?: string; form_data?: Record<string, string>; submitted_at?: string }) =>
            a.id === appId || a.reference_number === appId
        );
        if (found) {
          if (found.form_data?.full_name) setApplicantName(found.form_data.full_name);
          if (found.form_data?.mobile) setMobile(found.form_data.mobile);
          if (found.form_data?.email) setEmail(found.form_data.email);
          if (found.submitted_at) setAppDate(new Date(found.submitted_at).toLocaleString("en-IN"));
          if (found.department_id && DEPT_PRESETS[found.department_id as DepartmentCode]) {
            setSubmittedDept(found.department_id as DepartmentCode);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [appId]);

  // Active department resolution: respects activeDepartment or submittedDept
  const effectiveDeptCode: DepartmentCode =
    activeDepartment !== "ALL"
      ? activeDepartment
      : submittedDept || "MSRTC";

  const deptPreset = DEPT_PRESETS[effectiveDeptCode] || DEPT_PRESETS.ALL;
  const currentDeptMeta = DEPARTMENTS[effectiveDeptCode] || DEPARTMENTS.ALL;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleDownloadReceipt = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <AppShell
      title={isCitizen ? "Application Tracking & Acknowledgment" : "Application Review"}
      breadcrumb={["Home", isCitizen ? "Citizen Portal" : "Department Officer", "Applications", appId]}
    >
      {/* ── Top Header ── */}
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">
            {isCitizen ? "Application Tracking & Acknowledgment" : "Officer Application Review"}
          </h1>
          <div className="gov-page-subtitle">
            Application Reference Number: <code>{appId}</code>
          </div>
        </div>
        <Link href="/applications" className="gov-btn gov-btn-secondary">
          &larr; {isCitizen ? "Back to My Applications" : "Back to Applications Register"}
        </Link>
      </div>

      {/* ── Department Switcher Notice Bar (Allows switching to other departments right here) ── */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1e293b", fontWeight: 700 }}>
          <span style={{ fontSize: 18 }}>{currentDeptMeta.sealEmoji}</span>
          <span>
            Active Department View: <strong style={{ color: "#1d4ed8" }}>{deptPreset.deptName}</strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Switch Department:</span>
          {(["MSRTC", "UIDAI", "CBDT", "ECI", "EDU", "SKILL", "ULB"] as DepartmentCode[]).map((code) => {
            const isSelected = effectiveDeptCode === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setActiveDepartment(code)}
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: isSelected ? 800 : 600,
                  borderRadius: 14,
                  border: isSelected ? "1px solid #2563eb" : "1px solid #cbd5e1",
                  background: isSelected ? "#2563eb" : "#f8fafc",
                  color: isSelected ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Citizen Success Submission Banner ── */}
      {isCitizen && (
        <div
          className="gov-notice-banner"
          style={{
            background: "#ecfdf5",
            borderColor: "#a7f3d0",
            color: "#065f46",
            marginBottom: 20,
            padding: "16px 20px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                Application Lodged Successfully!
              </div>
              <div style={{ fontSize: 12, color: "#047857", marginTop: 2 }}>
                Your application has been received by <strong>{deptPreset.deptName}</strong> under DPDP Act 2023 regulations.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="gov-btn gov-btn-primary"
            style={{ background: "#059669", borderColor: "#059669", fontSize: 12, padding: "8px 16px" }}
          >
            📥 Download Acknowledgment Receipt
          </button>
        </div>
      )}

      {downloadSuccess && (
        <div style={{ padding: 12, background: "#dbeafe", border: "1px solid #bfdbfe", color: "#1e40af", borderRadius: 6, fontSize: 12.5, fontWeight: 700, marginBottom: 16 }}>
          ✓ Official GovBridge e-Acknowledgment Receipt has been prepared and generated for {appId}.
        </div>
      )}

      {/* ── Officer Decision Notice (Only shown when officer submits decision) ── */}
      {!isCitizen && submitted && (
        <div className="gov-notice-banner" style={{ background: "#d4edda", borderColor: "#c3e6cb", color: "#155724", marginBottom: 20 }}>
          <span>✓</span>
          <span>
            <strong>Decision Submitted:</strong> Application <strong>{appId}</strong> has been marked as <strong>{decision}</strong>. Audit trail updated under DPDP guidelines.
          </span>
        </div>
      )}

      {/* ── 1. Applicant Details ── */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">APPLICANT DETAILS</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-detail-table">
            <tbody>
              <tr>
                <th>Applicant Name</th>
                <td>{applicantName}</td>
                <th>Master Citizen ID</th>
                <td><code>MAHA-CIT-10284</code></td>
              </tr>
              <tr>
                <th>District / Taluka</th>
                <td>Pune / Haveli</td>
                <th>State</th>
                <td>Maharashtra</td>
              </tr>
              <tr>
                <th>Mobile Number</th>
                <td>{mobile}</td>
                <th>Email Address</th>
                <td>{email}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2. Service Details (Reacts to Active Department) ── */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">SERVICE DETAILS</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-detail-table">
            <tbody>
              <tr>
                <th>Service Name</th>
                <td>{deptPreset.serviceName}</td>
                <th>Application Date</th>
                <td>{appDate}</td>
              </tr>
              <tr>
                <th>Owning Department</th>
                <td>{deptPreset.deptName}</td>
                <th>Service SLA</th>
                <td>{deptPreset.sla}</td>
              </tr>
              <tr>
                <th>Current Status</th>
                <td>
                  <span className="gov-badge gov-badge-warning" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706" }} />
                    Pending Department Verification
                  </span>
                </td>
                <th>Executing Subsystem</th>
                <td>{deptPreset.subsystem}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Automated Interoperability Verification Results ── */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">VERIFICATION RESULTS (INTEROPERABILITY ENGINE)</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Verification Check Category</th>
                <th>Source Registry / API</th>
                <th>Validation Status</th>
                <th>Match Score / Hash</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#f0fdf4" }}>
                <td><strong>{deptPreset.checkCategory}</strong></td>
                <td>{deptPreset.registry}</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED ✓</span></td>
                <td>{deptPreset.matchScore}</td>
              </tr>
              <tr>
                <td>Identity Verification</td>
                <td>UIDAI Aadhaar CIDR Gateway</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td>Token Matched (SHA-256)</td>
              </tr>
              <tr>
                <td>Education Verification</td>
                <td>DigiLocker NAD Ecosystem</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td>Degree Hash Match 100%</td>
              </tr>
              <tr>
                <td>Income &amp; Tax Criteria</td>
                <td>CBDT Tax Assessment Connector</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td>Under ₹2.5L Threshold</td>
              </tr>
              <tr>
                <td>Electoral Roll Validation</td>
                <td>ERONET National Voter Register</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td>EPIC Record Valid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. DPDP Consent Status ── */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">CITIZEN CONSENT STATUS (DPDP ACT 2023)</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-detail-table">
            <tbody>
              <tr>
                <th>Consent Granted</th>
                <td><span className="gov-badge gov-badge-success">YES (EXPLICIT)</span></td>
                <th>Purpose Code</th>
                <td><code>GOVBRIDGE-VERIFY-2026</code></td>
              </tr>
              <tr>
                <th>Consent Timestamp</th>
                <td>{appDate} IST</td>
                <th>Consent Expiry</th>
                <td>30 Days from Submission</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Submitted Verification Documents ── */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">SUBMITTED VERIFICATION DOCUMENTS</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Submitted Date</th>
                <th>Verification Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Official_Identity_Verification.pdf</td>
                <td>{appDate.split(" ")[0]}</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td><button type="button" onClick={() => alert("Document opened: Official_Identity_Verification.pdf (SHA-256 Verified)")} className="gov-btn gov-btn-secondary gov-btn-sm">View Document</button></td>
              </tr>
              <tr>
                <td>Service_Eligibility_Proof.pdf</td>
                <td>{appDate.split(" ")[0]}</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td><button type="button" onClick={() => alert("Document opened: Service_Eligibility_Proof.pdf (Digital Seal Verified)")} className="gov-btn gov-btn-secondary gov-btn-sm">View Document</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. CITIZEN VIEW: Tracker & Next Steps (Shown ONLY for Citizen) ── */}
      {isCitizen && (
        <div className="gov-panel" style={{ border: "1.5px solid #86efac", background: "#ffffff" }}>
          <div className="gov-panel-header" style={{ background: "#15803d", color: "#ffffff" }}>
            <span>CITIZEN TRACKING TIMELINE &amp; SERVICE GUARANTEE</span>
          </div>
          <div className="gov-panel-body" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Timeline Steps */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#16a34a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                  ✓
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Step 1: Application Received &amp; Digital File Generated</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Completed at {appDate} via Citizen Portal</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#16a34a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                  ✓
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Step 2: Automated DPDP Data Exchange Completed</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Cross-verification confirmed with DigiLocker, UIDAI &amp; State Registries</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                  ⏳
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1d4ed8" }}>Step 3: Department Officer Scrutiny ({deptPreset.deptName})</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Assigned to verification officer desk • Expected resolution within {deptPreset.sla}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#e2e8f0", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                  4
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Step 4: Certificate / Digital Benefit Dispatched</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Will be delivered to DigiLocker and citizen portal upon final approval</div>
                </div>
              </div>
            </div>

            {/* Citizen Action Buttons */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/applications" className="gov-btn gov-btn-secondary">
                📋 Back to My Applications
              </Link>
              <Link href="/consents" className="gov-btn gov-btn-secondary">
                🔒 Manage DPDP Consent
              </Link>
              <Link href="/applications/new" className="gov-btn gov-btn-primary" style={{ background: "#2563eb", borderColor: "#2563eb" }}>
                ➕ Apply for Another Service
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. OFFICER VIEW: Decision & Approval Form (Shown ONLY for Officers/Admins, NEVER for Citizen) ── */}
      {!isCitizen && (
        <div className="gov-panel">
          <div className="gov-panel-header">
            <span>OFFICER DECISION &amp; APPROVAL FORM ({effectiveDeptCode})</span>
          </div>
          <div className="gov-panel-body">
            <form onSubmit={handleSubmit}>
              <div className="gov-form-group">
                <label className="gov-form-label">Decision Remarks:</label>
                <textarea
                  className="gov-textarea"
                  rows={4}
                  placeholder="Enter official review remarks, verification note, or clarification reason..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Select Official Decision:</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="radio" name="decision" value="Approve" checked={decision === "Approve"} onChange={(e) => setDecision(e.target.value)} />
                    <strong>Approve:</strong> Approve application &amp; trigger automated settlement for {deptPreset.serviceName}
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="radio" name="decision" value="Reject" checked={decision === "Reject"} onChange={(e) => setDecision(e.target.value)} />
                    <strong>Reject:</strong> Reject application due to document discrepancy or eligibility failure
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="radio" name="decision" value="Send for Clarification" checked={decision === "Send for Clarification"} onChange={(e) => setDecision(e.target.value)} />
                    <strong>Send for Clarification:</strong> Request applicant to resubmit updated documents
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="radio" name="decision" value="Manual Verification" checked={decision === "Manual Verification"} onChange={(e) => setDecision(e.target.value)} />
                    <strong>Manual Verification:</strong> Escalated to District Officer for field inspection
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <button type="submit" className="gov-btn">
                  Submit Official Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
