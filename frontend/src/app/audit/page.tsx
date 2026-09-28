"use client";
import { AppShell } from "@/components/AppShell";

export default function AuditPage() {
  const auditLogs = [
    {
      timestamp: "27/09/2026 10:35:12",
      user: "Department Officer (Sunil Patil)",
      action: "Application Reviewed & Approved",
      application: "APP-2026-1048",
      source: "10.14.82.102 (Department Portal)",
      result: "SUCCESS",
    },
    {
      timestamp: "27/09/2026 09:40:25",
      user: "System (CBDT Connector)",
      action: "Tax Income Criteria Verification",
      application: "APP-2026-1048",
      source: "API Gateway (SDC Mantralaya)",
      result: "SUCCESS",
    },
    {
      timestamp: "27/09/2026 09:40:22",
      user: "System (DigiLocker NAD Connector)",
      action: "Degree Marksheet Hash Validation",
      application: "APP-2026-1048",
      source: "API Gateway (SDC Mantralaya)",
      result: "SUCCESS",
    },
    {
      timestamp: "27/09/2026 09:40:15",
      user: "System (UIDAI Gateway)",
      action: "Aadhaar E-KYC Token Authentication",
      application: "APP-2026-1048",
      source: "AUA Gateway (MeitY Network)",
      result: "SUCCESS",
    },
    {
      timestamp: "27/09/2026 09:40:12",
      user: "Citizen (Rajesh Sharma)",
      action: "Application Submission & DPDP Consent",
      application: "APP-2026-1048",
      source: "Citizen Portal (Web Browser)",
      result: "SUCCESS",
    },
  ];

  return (
    <AppShell title="Audit Trail" breadcrumb={["Home", "Department Officer", "Audit Trail"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">Audit Trail</h1>
          <div className="gov-page-subtitle">Immutable Audit Log Register under DPDP Act 2023 &amp; IT Act 2000</div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>Official System Audit Log Register</span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>Cryptographically Hashed SHA-256 Audit Trail</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>User / System Actor</th>
                <th>Action Performed</th>
                <th>Application Reference</th>
                <th>IP / Source Gateway</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr key={idx}>
                  <td><code>{log.timestamp}</code></td>
                  <td><strong>{log.user}</strong></td>
                  <td>{log.action}</td>
                  <td><code>{log.application}</code></td>
                  <td>{log.source}</td>
                  <td>
                    <span className="gov-badge gov-badge-success">{log.result}</span>
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
