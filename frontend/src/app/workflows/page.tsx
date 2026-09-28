"use client";
import { AppShell } from "@/components/AppShell";

export default function WorkflowsPage() {
  const steps = [
    { step: 1, name: "Application Received", date: "27/09/2026", time: "09:40:12", dept: "Citizen Portal Gateway", actor: "System Gateway", status: "Completed", remarks: "Application payload received & hashed" },
    { step: 2, name: "Identity Verification", date: "27/09/2026", time: "09:40:15", dept: "UIDAI CIDR Service", actor: "Automated API", status: "Completed", remarks: "Aadhaar demographic token validated" },
    { step: 3, name: "Consent Verification", date: "27/09/2026", time: "09:40:18", dept: "DPDP Consent Gateway", actor: "Consent Manager", status: "Completed", remarks: "Explicit citizen consent verified" },
    { step: 4, name: "Department Verification", date: "27/09/2026", time: "09:40:22", dept: "DigiLocker NAD / NSDC", actor: "Connector Subsystem", status: "Completed", remarks: "Academic & skill certificate verified" },
    { step: 5, name: "Eligibility Assessment", date: "27/09/2026", time: "09:40:25", dept: "Income Tax Dept / CBDT", actor: "Automated Connector", status: "Completed", remarks: "Tax-assessed income threshold met" },
    { step: 6, name: "Officer Review", date: "27/09/2026", time: "10:15:00", dept: "State Transport / Skill Dept", actor: "Department Officer", status: "CURRENT", remarks: "Application assigned for final officer sign-off" },
    { step: 7, name: "Final Decision", date: "Pending", time: "-", dept: "Competent Authority", actor: "Sanctioning Officer", status: "Pending", remarks: "Awaiting decision submission" },
    { step: 8, name: "Certificate / Benefit Issue", date: "Pending", time: "-", dept: "PFMS DBT / Depot Engine", actor: "Automated Dispatch", status: "Pending", remarks: "Stipend / pass dispatch queued" },
  ];

  return (
    <AppShell title="Application Processing Workflow" breadcrumb={["Home", "Department Officer", "Workflow"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">Application Processing Workflow</h1>
          <div className="gov-page-subtitle">Standard 8-Step Inter-Departmental Service Orchestration Lifecycle</div>
        </div>
      </div>

      {/* Numbered Workflow Status Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>Workflow Execution Lifecycle (Reference: APP-2026-1048)</span>
          <span className="gov-badge gov-badge-warning">STEP 6 IN PROGRESS</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Step No</th>
                <th>Process Stage Name</th>
                <th>Execution Date</th>
                <th>Time</th>
                <th>Responsible Department</th>
                <th>Actor / System</th>
                <th>Status</th>
                <th>Remarks &amp; Audit Log</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.step} style={{ background: s.status === "CURRENT" ? "var(--gov-blue-light)" : undefined }}>
                  <td style={{ textAlign: "center" }}><strong>Step {s.step}</strong></td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.date}</td>
                  <td>{s.time}</td>
                  <td>{s.dept}</td>
                  <td>{s.actor}</td>
                  <td>
                    {s.status === "Completed" && <span className="gov-badge gov-badge-success">&check; Completed</span>}
                    {s.status === "CURRENT" && <span className="gov-badge gov-badge-warning">&rarr; CURRENT</span>}
                    {s.status === "Pending" && <span className="gov-badge gov-badge-muted">Pending</span>}
                  </td>
                  <td>{s.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
