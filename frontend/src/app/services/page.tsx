"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

interface ServiceItem {
  code: string;
  name: string;
  department: string;
  type: string;
  status: "Active" | "Maintenance" | "Sandbox";
  sla: string;
  href: string;
}

const SERVICES: ServiceItem[] = [
  {
    code: "UIDAI-KYC-001",
    name: "Aadhaar e-KYC Authentication Service",
    department: "Unique Identification Authority of India (UIDAI)",
    type: "Identity Verification",
    status: "Active",
    sla: "Instant",
    href: "/services/specifications",
  },
  {
    code: "CBDT-PAN-002",
    name: "PAN & Income Verification Portal",
    department: "Income Tax Department / CBDT",
    type: "Financial Verification",
    status: "Active",
    sla: "5 Minutes",
    href: "/services/specifications",
  },
  {
    code: "ECI-VOTER-003",
    name: "Electoral Roll & EPIC Validation",
    department: "Election Commission of India (ECI)",
    type: "Civic Verification",
    status: "Active",
    sla: "Instant",
    href: "/services/specifications",
  },
  {
    code: "TRANS-BUSPASS-004",
    name: "Student & Senior Citizen Bus Concession Pass",
    department: "State Transport Department (MSRTC)",
    type: "Transit Scheme",
    status: "Active",
    sla: "24 Hours",
    href: "/services/specifications",
  },
  {
    code: "EDU-NAD-005",
    name: "University Degree & Marksheet Verification",
    department: "DigiLocker National Academic Depository",
    type: "Academic Credential",
    status: "Active",
    sla: "12 Hours",
    href: "/services/specifications",
  },
  {
    code: "SKILL-DBT-006",
    name: "Unified Skill Benefit & Stipend Allowance",
    department: "Ministry of Skill Development & PFMS",
    type: "DBT Allowance",
    status: "Sandbox",
    sla: "48 Hours",
    href: "/services/specifications",
  },
  {
    code: "ULB-NOC-007",
    name: "Municipal Property Tax & Utility Clearance NOC",
    department: "Urban Local Body (ULB / Municipal Corp)",
    type: "Municipal NOC",
    status: "Active",
    sla: "72 Hours",
    href: "/services/specifications",
  },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const filteredServices = useMemo(() => {
    return SERVICES.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "ALL" || s.department.includes(selectedDept);
      const matchesCat = selectedCategory === "ALL" || s.type === selectedCategory;
      const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;

      return matchesSearch && matchesDept && matchesCat && matchesStatus;
    });
  }, [searchQuery, selectedDept, selectedCategory, selectedStatus]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedDept("ALL");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
  };

  return (
    <AppShell title="Departmental Services" breadcrumb={["Home", "Department Officer", "Departmental Services"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">Departmental Services</h1>
          <div className="gov-page-subtitle">Official Directory of Interoperable e-Governance API Services &amp; Schemes</div>
        </div>
      </div>

      {/* Government Filter Form */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">
          SEARCH &amp; FILTER SERVICES
        </div>
        <div className="gov-panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Search Service:</label>
              <input
                type="text"
                className="gov-input"
                placeholder="Enter service code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Department:</label>
              <select className="gov-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="ALL">All Departments</option>
                <option value="UIDAI">UIDAI</option>
                <option value="Income Tax">Income Tax / CBDT</option>
                <option value="Election">Election Commission</option>
                <option value="Transport">State Transport</option>
                <option value="DigiLocker">DigiLocker NAD</option>
                <option value="Skill">Skill Development</option>
                <option value="Urban">Urban Local Body</option>
              </select>
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Service Category:</label>
              <select className="gov-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="Identity Verification">Identity Verification</option>
                <option value="Financial Verification">Financial Verification</option>
                <option value="Civic Verification">Civic Verification</option>
                <option value="Transit Scheme">Transit Scheme</option>
                <option value="Academic Credential">Academic Credential</option>
                <option value="DBT Allowance">DBT Allowance</option>
                <option value="Municipal NOC">Municipal NOC</option>
              </select>
            </div>

            <div className="gov-form-group" style={{ margin: 0 }}>
              <label className="gov-form-label">Status:</label>
              <select className="gov-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Sandbox">Sandbox</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="gov-btn" onClick={() => {}}>Search</button>
            <button className="gov-btn gov-btn-secondary" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      {/* Services Government Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>Service Directory Catalogue</span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>Showing {filteredServices.length} registered services</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Service Code</th>
                <th>Service Name</th>
                <th>Department</th>
                <th>Service Type</th>
                <th>Status</th>
                <th>SLA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s) => (
                <tr key={s.code}>
                  <td><strong>{s.code}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.department}</td>
                  <td>{s.type}</td>
                  <td>
                    <span className={`gov-badge ${s.status === "Active" ? "gov-badge-success" : "gov-badge-warning"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.sla}</td>
                  <td>
                    <Link href={s.href} className="gov-btn gov-btn-sm">
                      View Details
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
