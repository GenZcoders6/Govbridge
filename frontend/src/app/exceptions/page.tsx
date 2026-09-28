"use client";
import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function ExceptionsPage() {
  const exceptions = [
    {
      ref: "EXC-2026-001",
      appNo: "APP-2026-1048",
      system: "Revenue Registry (CBDT)",
      error: "Connection Timeout (5000ms threshold breached)",
      time: "10:32 AM",
      retries: 2,
      status: "Retrying",
      badge: "gov-badge-warning",
    },
    {
      ref: "EXC-2026-002",
      appNo: "APP-2026-1055",
      system: "MSRTC Transport Gateway",
      error: "UDISE Institution Code Verification Failed",
      time: "09:15 AM",
      retries: 3,
      status: "Manual Review",
      badge: "gov-badge-error",
    },
    {
      ref: "EXC-2026-003",
      appNo: "APP-2026-1042",
      system: "DigiLocker NAD Connector",
      error: "Certificate Hash Mismatch (Revoked Record)",
      time: "Yesterday",
      retries: 1,
      status: "Assigned",
      badge: "gov-badge-info",
    },
  ];

  return (
    <AppShell title="System Exceptions" breadcrumb={["Home", "Department Officer", "System Exceptions"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">System Exceptions</h1>
          <div className="gov-page-subtitle">Interoperability Failure Register &amp; Exception Handling</div>
        </div>
      </div>

      {/* Filter Form */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">FILTER EXCEPTIONS</div>
        <div className="gov-panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Status:</label>
              <select className="gov-select">
                <option value="ALL">All Statuses</option>
                <option value="Retrying">Retrying</option>
                <option value="Manual Review">Manual Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Department:</label>
              <select className="gov-select">
                <option value="ALL">All Departments</option>
                <option value="CBDT">Income Tax / CBDT</option>
                <option value="MSRTC">State Transport</option>
                <option value="DigiLocker">DigiLocker NAD</option>
              </select>
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Service:</label>
              <input type="text" className="gov-input" placeholder="Service name or code..." />
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Date:</label>
              <input type="date" className="gov-input" />
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="gov-btn">Filter Exceptions</button>
            <button className="gov-btn gov-btn-secondary">Reset</button>
          </div>
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>System Exception Register</span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>Showing {exceptions.length} active exceptions</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Application</th>
                <th>System</th>
                <th>Error Message</th>
                <th>Time</th>
                <th>Retry Count</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((exc) => (
                <tr key={exc.ref}>
                  <td><strong>{exc.ref}</strong></td>
                  <td><Link href={`/applications/${exc.appNo}`}>{exc.appNo}</Link></td>
                  <td>{exc.system}</td>
                  <td style={{ color: "#721c24", fontWeight: 600 }}>{exc.error}</td>
                  <td>{exc.time}</td>
                  <td style={{ textAlign: "center" }}>{exc.retries}</td>
                  <td>
                    <span className={`gov-badge ${exc.badge}`}>{exc.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="gov-btn gov-btn-sm">Retry</button>
                      <button className="gov-btn gov-btn-secondary gov-btn-sm">Manual Review</button>
                    </div>
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
