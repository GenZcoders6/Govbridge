"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";

export default function ReportsPage() {
  const [reportCategory, setReportCategory] = useState("Application Report");
  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState("2026-09-27");
  const [service, setService] = useState("ALL");
  const [generated, setGenerated] = useState(true);

  const categories = [
    "Application Report",
    "Service Performance Report",
    "SLA Report",
    "Verification Report",
    "Connector Availability Report",
    "Exception Report",
    "Audit Report",
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerated(true);
  };

  return (
    <AppShell title="Department Reports" breadcrumb={["Home", "Department Officer", "Department Reports"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">Department Reports</h1>
          <div className="gov-page-subtitle">Official Management Information System (MIS) Reports &amp; Analytics</div>
        </div>
      </div>

      {/* Report Generation Form */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">REPORT SELECTION &amp; PARAMETERS</div>
        <div className="gov-panel-body">
          <form onSubmit={handleGenerate}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div className="gov-form-group" style={{ margin: 0 }}>
                <label className="gov-form-label">Report Category:</label>
                <select className="gov-select" value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="gov-form-group" style={{ margin: 0 }}>
                <label className="gov-form-label">From Date:</label>
                <input type="date" className="gov-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>

              <div className="gov-form-group" style={{ margin: 0 }}>
                <label className="gov-form-label">To Date:</label>
                <input type="date" className="gov-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>

              <div className="gov-form-group" style={{ margin: 0 }}>
                <label className="gov-form-label">Service:</label>
                <select className="gov-select" value={service} onChange={(e) => setService(e.target.value)}>
                  <option value="ALL">All Services</option>
                  <option value="Aadhaar">UIDAI Aadhaar E-KYC</option>
                  <option value="PAN">CBDT PAN &amp; Income</option>
                  <option value="Bus">MSRTC Bus Pass</option>
                  <option value="Skill">Skill &amp; Stipend DBT</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button type="submit" className="gov-btn">
                Generate Report
              </button>
              <button type="button" className="gov-btn gov-btn-secondary" onClick={() => alert("Downloading PDF Report...")}>
                Download PDF
              </button>
              <button type="button" className="gov-btn gov-btn-secondary" onClick={() => alert("Exporting CSV File...")}>
                Export Excel / CSV
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Generated Report Data Table */}
      {generated && (
        <div className="gov-panel">
          <div className="gov-panel-header">
            <span>Generated MIS Report: {reportCategory} ({fromDate} to {toDate})</span>
            <span style={{ fontSize: 11, fontWeight: 400 }}>Official Government Report #MIS-2026-0927</span>
          </div>
          <div className="gov-panel-body" style={{ padding: 0 }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Department / Authority</th>
                  <th>Total Received</th>
                  <th>Automated Verified</th>
                  <th>Officer Approved</th>
                  <th>Rejected</th>
                  <th>Avg SLA Time</th>
                  <th>Compliance Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>UIDAI Identity Gateway</strong></td>
                  <td>1,420</td>
                  <td>1,418</td>
                  <td>1,410</td>
                  <td>10</td>
                  <td>1.2 sec</td>
                  <td><span className="gov-badge gov-badge-success">99.8%</span></td>
                </tr>
                <tr>
                  <td><strong>Income Tax Department (CBDT)</strong></td>
                  <td>850</td>
                  <td>840</td>
                  <td>825</td>
                  <td>15</td>
                  <td>3.4 min</td>
                  <td><span className="gov-badge gov-badge-success">98.2%</span></td>
                </tr>
                <tr>
                  <td><strong>Election Commission (ECI)</strong></td>
                  <td>610</td>
                  <td>610</td>
                  <td>605</td>
                  <td>5</td>
                  <td>1.8 sec</td>
                  <td><span className="gov-badge gov-badge-success">99.1%</span></td>
                </tr>
                <tr>
                  <td><strong>State Transport Corporation (MSRTC)</strong></td>
                  <td>540</td>
                  <td>512</td>
                  <td>490</td>
                  <td>22</td>
                  <td>14.2 hrs</td>
                  <td><span className="gov-badge gov-badge-info">95.9%</span></td>
                </tr>
                <tr>
                  <td><strong>DigiLocker NAD Ecosystem</strong></td>
                  <td>920</td>
                  <td>915</td>
                  <td>900</td>
                  <td>15</td>
                  <td>4.5 hrs</td>
                  <td><span className="gov-badge gov-badge-success">98.3%</span></td>
                </tr>
                <tr>
                  <td><strong>Skill India Hub &amp; PFMS DBT</strong></td>
                  <td>380</td>
                  <td>360</td>
                  <td>340</td>
                  <td>20</td>
                  <td>28.0 hrs</td>
                  <td><span className="gov-badge gov-badge-warning">94.7%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
