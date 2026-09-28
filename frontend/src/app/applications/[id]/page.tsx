"use client";
import { useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const appId = resolvedParams.id || "APP-2026-1048";

  const [decision, setDecision] = useState("Approve");
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AppShell title="Application Review" breadcrumb={["Home", "Department Officer", "Applications", appId]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">Application Review</h1>
          <div className="gov-page-subtitle">Application Reference Number: <code>{appId}</code></div>
        </div>
        <Link href="/applications" className="gov-btn gov-btn-secondary">
          &larr; Back to Applications Register
        </Link>
      </div>

      {submitted && (
        <div className="gov-notice-banner" style={{ background: "#d4edda", borderColor: "#c3e6cb", color: "#155724" }}>
          <span>✓</span>
          <span>
            <strong>Decision Submitted:</strong> Application <strong>{appId}</strong> has been marked as <strong>{decision}</strong>. Audit trail updated under DPDP guidelines.
          </span>
        </div>
      )}

      {/* 1. Applicant Details - Formal Two-Column Table */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">APPLICANT DETAILS</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-detail-table">
            <tbody>
              <tr>
                <th>Applicant Name</th>
                <td>Rajesh Sharma</td>
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
                <td>+91 98765 43210</td>
                <th>Email Address</th>
                <td>rajesh.sharma@example.gov.in</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Service Details */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">SERVICE DETAILS</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-detail-table">
            <tbody>
              <tr>
                <th>Service Name</th>
                <td>Unified Skill Benefit &amp; Stipend Allowance</td>
                <th>Application Date</th>
                <td>27/09/2026 09:42 AM</td>
              </tr>
              <tr>
                <th>Owning Department</th>
                <td>Ministry of Skill Development &amp; Entrepreneurship (MSDE)</td>
                <th>Service SLA</th>
                <td>48 Hours (2 Business Days)</td>
              </tr>
              <tr>
                <th>Current Status</th>
                <td><span className="gov-badge gov-badge-warning">Pending Officer Review</span></td>
                <th>Executing Subsystem</th>
                <td>Skill India Digital Hub &amp; PFMS DBT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Automated Interoperability Verification Results */}
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
                <td>Skill Verification</td>
                <td>NSDC Certification Register</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td>Candidate ID Valid</td>
              </tr>
              <tr>
                <td>Employment Verification</td>
                <td>PFMS / Skill Portal Registry</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td>Training Attendance 92%</td>
              </tr>
              <tr>
                <td>Income Verification</td>
                <td>CBDT Tax Assessment Connector</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td>Under ₹2.5L Threshold</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DPDP Consent Status */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">CITIZEN CONSENT STATUS (DPDP ACT 2023)</div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-detail-table">
            <tbody>
              <tr>
                <th>Consent Granted</th>
                <td><span className="gov-badge gov-badge-success">YES (EXPLICIT)</span></td>
                <th>Purpose Code</th>
                <td><code>SKILL-STIPEND-VERIFY-2026</code></td>
              </tr>
              <tr>
                <th>Consent Timestamp</th>
                <td>27/09/2026 09:40:12 IST</td>
                <th>Consent Expiry</th>
                <td>27/10/2026 (30 Days)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Submitted Verification Documents */}
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
                <td>Aadhaar E-KYC Token Record</td>
                <td>27/09/2026</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td><a href="#doc1" className="gov-btn gov-btn-secondary gov-btn-sm">View Document</a></td>
              </tr>
              <tr>
                <td>NSQF Skill Certificate (PDF)</td>
                <td>27/09/2026</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td><a href="#doc2" className="gov-btn gov-btn-secondary gov-btn-sm">View Document</a></td>
              </tr>
              <tr>
                <td>Bank Passbook / IFSC Verification</td>
                <td>27/09/2026</td>
                <td><span className="gov-badge gov-badge-success">VERIFIED</span></td>
                <td><a href="#doc3" className="gov-btn gov-btn-secondary gov-btn-sm">View Document</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Officer Decision Form */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>OFFICER DECISION &amp; APPROVAL FORM</span>
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
                  <strong>Approve:</strong> Approve application &amp; trigger automated PFMS stipend settlement
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
    </AppShell>
  );
}
