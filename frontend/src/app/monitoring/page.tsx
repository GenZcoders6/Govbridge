"use client";
import { AppShell } from "@/components/AppShell";

export default function SystemStatusPage() {
  const components = [
    { component: "API Gateway", status: "Operational", lastChecked: "10:35 AM", latency: "42 ms", badge: "gov-badge-success" },
    { component: "Primary Interoperability Database", status: "Operational", lastChecked: "10:35 AM", latency: "18 ms", badge: "gov-badge-success" },
    { component: "Identity Connector (UIDAI CIDR)", status: "Operational", lastChecked: "10:35 AM", latency: "42 ms", badge: "gov-badge-success" },
    { component: "Education Connector (DigiLocker NAD)", status: "Operational", lastChecked: "10:35 AM", latency: "55 ms", badge: "gov-badge-success" },
    { component: "Revenue Connector (CBDT ITD)", status: "Warning", lastChecked: "10:35 AM", latency: "5000 ms", badge: "gov-badge-warning" },
    { component: "Electoral Connector (ECI ERONET)", status: "Operational", lastChecked: "10:35 AM", latency: "64 ms", badge: "gov-badge-success" },
    { component: "Transport Connector (MSRTC Depot)", status: "Operational", lastChecked: "10:34 AM", latency: "110 ms", badge: "gov-badge-success" },
    { component: "Skill & PFMS DBT Subsystem", status: "Operational", lastChecked: "10:34 AM", latency: "88 ms", badge: "gov-badge-success" },
  ];

  return (
    <AppShell title="System Status" breadcrumb={["Home", "Department Officer", "System Status"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">System Status</h1>
          <div className="gov-page-subtitle">Real-Time Operational Monitoring of State Interoperability Components</div>
        </div>
      </div>

      {/* System Status Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>Component Operational Health Register</span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>All Systems Monitored via SDC Gateway</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Component / Registry Interface</th>
                <th>Operational Status</th>
                <th>Last Checked (IST)</th>
                <th>API Response Time (SLA)</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.component}>
                  <td><strong>{c.component}</strong></td>
                  <td>
                    <span className={`gov-badge ${c.badge}`}>{c.status}</span>
                  </td>
                  <td>{c.lastChecked}</td>
                  <td><code>{c.latency}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
