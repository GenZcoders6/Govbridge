"use client";
import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function ConnectorsPage() {
  const connectors = [
    {
      name: "Identity Registry",
      dept: "UIDAI / MeitY",
      type: "API Connector",
      protocol: "REST / JSON (mTLS)",
      status: "Active",
      lastChecked: "10:32 AM",
    },
    {
      name: "Education Registry",
      dept: "Education Department / UGC",
      type: "API Gateway",
      protocol: "REST / JSON (DigiLocker)",
      status: "Active",
      lastChecked: "10:31 AM",
    },
    {
      name: "Skill Registry",
      dept: "Skill Development & Entrepreneurship",
      type: "SOAP Service",
      protocol: "SOAP / XML (PFMS)",
      status: "Active",
      lastChecked: "10:31 AM",
    },
    {
      name: "Revenue Registry",
      dept: "Income Tax Department / CBDT",
      type: "Database Integration",
      protocol: "Government Connector",
      status: "Active",
      lastChecked: "10:30 AM",
    },
    {
      name: "Electoral Registry",
      dept: "Election Commission of India",
      type: "API Connector",
      protocol: "REST / JSON (OIDC)",
      status: "Active",
      lastChecked: "10:28 AM",
    },
    {
      name: "Transport Registry",
      dept: "State Transport Corporation (MSRTC)",
      type: "Multi-Registry API",
      protocol: "HTTPS / REST",
      status: "Active",
      lastChecked: "10:25 AM",
    },
    {
      name: "Municipal Revenue Engine",
      dept: "Urban Local Body (ULB)",
      type: "ERP Adapter",
      protocol: "SOAP / REST",
      status: "Active",
      lastChecked: "10:20 AM",
    },
  ];

  return (
    <AppShell title="Department System Integration" breadcrumb={["Home", "Department Officer", "Connector Registry"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">Department System Integration</h1>
          <div className="gov-page-subtitle">Official Interoperability Connectors &amp; External Registry Interfaces</div>
        </div>
      </div>

      {/* Connectors Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>Registered Department Interoperability Connectors</span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>Total Active Connectors: {connectors.length}</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>System Name</th>
                <th>Department / Agency</th>
                <th>Integration Type</th>
                <th>Protocol</th>
                <th>Status</th>
                <th>Last Checked</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {connectors.map((c) => (
                <tr key={c.name}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.dept}</td>
                  <td>{c.type}</td>
                  <td><code>{c.protocol}</code></td>
                  <td>
                    <span className="gov-badge gov-badge-success">{c.status}</span>
                  </td>
                  <td>{c.lastChecked}</td>
                  <td>
                    <button className="gov-btn gov-btn-secondary gov-btn-sm">
                      Details
                    </button>
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
