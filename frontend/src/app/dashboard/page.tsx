"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { useDepartmentStore, DEPARTMENTS } from "@/store/departmentStore";
import Link from "next/link";

interface DeptAppMock {
  id: string;
  deptCode: string;
  service: string;
  applicant: string;
  date: string;
  status: "Pending Review" | "Under Verification" | "Approved" | "Rejected";
  badgeClass: string;
}

const ALL_DEPARTMENT_APPS: DeptAppMock[] = [
  // UIDAI Applications
  { id: "APP-UIDAI-101", deptCode: "UIDAI", service: "UIDAI Aadhaar E-KYC Authentication Service", applicant: "Ramesh K. Kulkarni", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-UIDAI-102", deptCode: "UIDAI", service: "Biometric Demographic Identity Verification", applicant: "Priya V. Sharma", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-UIDAI-103", deptCode: "UIDAI", service: "OTP Factor Authentication Check", applicant: "Sanjay G. Deshmukh", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // CBDT Applications
  { id: "APP-CBDT-201", deptCode: "CBDT", service: "PAN Card & Income Criteria Verification Portal", applicant: "Meera N. Nair", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-CBDT-202", deptCode: "CBDT", service: "Below ₹2.5L Income Threshold Assessment", applicant: "Vikram S. Patil", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-CBDT-203", deptCode: "CBDT", service: "Aadhaar-PAN Link Discrepancy Verification", applicant: "Alok M. Joshi", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // ECI Applications
  { id: "APP-ECI-301", deptCode: "ECI", service: "Electoral Roll & Voter ID (EPIC) Validation", applicant: "Suresh P. Kulkarni", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-ECI-302", deptCode: "ECI", service: "Voter Identity Card Registration Audit", applicant: "Sunita R. Bhosale", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-ECI-303", deptCode: "ECI", service: "Assembly Constituency Part Serial Verification", applicant: "Deepak T. Gaikwad", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // MSRTC Applications
  { id: "APP-MSRTC-401", deptCode: "MSRTC", service: "Student & Senior Citizen Concession Bus Pass", applicant: "Ananya M. Deshmukh", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-MSRTC-402", deptCode: "MSRTC", service: "Senior Citizen 50% Transit Concession Pass", applicant: "Eknath G. Shinde", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-MSRTC-403", deptCode: "MSRTC", service: "Inter-District Monthly Transit Pass Renewal", applicant: "Rahul K. Tambe", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // EDU Applications
  { id: "APP-EDU-501", deptCode: "EDU", service: "University Degree & Marksheet Verification", applicant: "Pooja V. Jadhav", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-EDU-502", deptCode: "EDU", service: "Diploma Marksheet Authentication via NAD", applicant: "Nilesh A. Chavan", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-EDU-503", deptCode: "EDU", service: "Post-Graduate Transcript Registrar Audit", applicant: "Archana S. Pawar", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // SKILL Applications
  { id: "APP-SKILL-601", deptCode: "SKILL", service: "Unified Skill Benefit & Stipend Allowance", applicant: "Rajesh B. Sharma", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-SKILL-602", deptCode: "SKILL", service: "Training Attendance 94% Audit & Verification", applicant: "Kavita D. Salunkhe", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-SKILL-603", deptCode: "SKILL", service: "PFMS Bank Account Penny-Drop Confirm", applicant: "Ganesh R. Mane", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },

  // ULB Applications
  { id: "APP-ULB-701", deptCode: "ULB", service: "Municipal Property Tax & Utility Clearance NOC", applicant: "Amit K. Verma", date: "27/09/2026", status: "Approved", badgeClass: "gov-badge-success" },
  { id: "APP-ULB-702", deptCode: "ULB", service: "Residential Property Tax No-Dues Certificate", applicant: "Sarita V. Thorat", date: "27/09/2026", status: "Pending Review", badgeClass: "gov-badge-warning" },
  { id: "APP-ULB-703", deptCode: "ULB", service: "Civic Water Utility Assessment NOC Audit", applicant: "Nitin P. Shinde", date: "26/09/2026", status: "Under Verification", badgeClass: "gov-badge-info" },
];

export default function OfficerDashboardPage() {
  const { activeDepartment } = useDepartmentStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load officer stats", err);
      }
    }
    loadStats();
  }, []);

  const currentDeptInfo = DEPARTMENTS[activeDepartment] || DEPARTMENTS.ALL;

  const filteredApps = activeDepartment === "ALL"
    ? ALL_DEPARTMENT_APPS
    : ALL_DEPARTMENT_APPS.filter((a) => a.deptCode === activeDepartment);

  const pendingCount = filteredApps.filter((a) => a.status === "Pending Review").length;
  const underVerifyCount = filteredApps.filter((a) => a.status === "Under Verification").length;
  const approvedCount = filteredApps.filter((a) => a.status === "Approved").length;

  return (
    <AppShell title={`${currentDeptInfo.shortName} Dashboard`} breadcrumb={["Home", "Department Officer", `${currentDeptInfo.shortName} Dashboard`]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">
            {currentDeptInfo.sealEmoji} {currentDeptInfo.fullName} — Officer Dashboard
          </h1>
          <div className="gov-page-subtitle">
            Authority: <strong>{currentDeptInfo.authority}</strong> | Ministry: <strong>{currentDeptInfo.ministry}</strong>
          </div>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>{currentDeptInfo.shortName} — Application Summary</span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>Refreshed: 27/09/2026 10:35 AM IST</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Status Category</th>
                <th style={{ textAlign: "right" }}>Total Volume</th>
                <th>Percentage</th>
                <th>Processing SLA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Total Applications Received</strong></td>
                <td style={{ textAlign: "right" }}><strong>{filteredApps.length}</strong></td>
                <td>100%</td>
                <td>Standard SLA ({currentDeptInfo.serviceCode})</td>
              </tr>
              <tr>
                <td>Pending Review</td>
                <td style={{ textAlign: "right" }}>{pendingCount}</td>
                <td>{((pendingCount / (filteredApps.length || 1)) * 100).toFixed(1)}%</td>
                <td><span className="gov-badge gov-badge-warning">Action Required</span></td>
              </tr>
              <tr>
                <td>Under Verification</td>
                <td style={{ textAlign: "right" }}>{underVerifyCount}</td>
                <td>{((underVerifyCount / (filteredApps.length || 1)) * 100).toFixed(1)}%</td>
                <td><span className="gov-badge gov-badge-info">In Progress</span></td>
              </tr>
              <tr>
                <td>Approved &amp; Issued</td>
                <td style={{ textAlign: "right" }}>{approvedCount}</td>
                <td>{((approvedCount / (filteredApps.length || 1)) * 100).toFixed(1)}%</td>
                <td><span className="gov-badge gov-badge-success">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications Requiring Action */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>APPLICATIONS REQUIRING ACTION ({currentDeptInfo.shortName})</span>
          <Link href="/applications" className="gov-btn gov-btn-secondary gov-btn-sm" style={{ textDecoration: "none" }}>
            View Department Register &rarr;
          </Link>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Application No</th>
                <th>Department Service Name</th>
                <th>Applicant Name</th>
                <th>Date Received</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td><strong>{app.id}</strong></td>
                  <td>{app.service}</td>
                  <td>{app.applicant}</td>
                  <td>{app.date}</td>
                  <td>
                    <span className={`gov-badge ${app.badgeClass}`}>{app.status}</span>
                  </td>
                  <td>
                    <Link href={`/applications/${app.id}`} className="gov-btn gov-btn-sm">
                      View Application
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Specific Important Notices */}
      <div className="gov-panel">
        <div className="gov-panel-header-secondary">
          DEPARTMENT NOTICES &amp; INTEROPERABILITY CIRCULARS ({currentDeptInfo.shortName})
        </div>
        <div className="gov-panel-body">
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>
              <a href="#notice-1">
                {activeDepartment === "UIDAI" && "UIDAI Circular 2026/04: Enforce mandatory mTLS v1.3 handshake & explicit 30-day DPDP consent token validation."}
                {activeDepartment === "CBDT" && "CBDT Circular: Automatic tax-assessed income threshold queries enabled for welfare scheme eligibility under IT Act Sec 138."}
                {activeDepartment === "ECI" && "ECI Guideline: ERONET real-time voter ID API validation active. Match assembly constituency serial numbers."}
                {activeDepartment === "MSRTC" && "MSRTC Depot Circular: College student concession requires automated UDISE school code verification before issuing QR Pass Token."}
                {activeDepartment === "EDU" && "DigiLocker NAD Order: SHA-256 certificate hashes verified directly against issuing university registrar blockchain vaults."}
                {activeDepartment === "SKILL" && "MSDE Circular: Monthly stipend payments require mandatory attendance check (min 85%) and PFMS bank penny-drop confirmation."}
                {activeDepartment === "ULB" && "ULB Revenue Order: Digital No-Dues NOC auto-issued upon zero arrears confirmation for property tax and water bills."}
                {activeDepartment === "ALL" && "GovBridge State Gateway: Inter-departmental API interoperability active across all 7 state government service registries."}
              </a>
            </li>
            <li>
              <a href="#notice-2">Data protection, citizen consent verification protocol, and mTLS audit trail guidelines under DPDP Act 2023</a>
            </li>
            <li>
              <a href="#notice-3">Scheduled maintenance notice: State Data Centre gateway upgrade on 28/09/2026 02:00 IST</a>
            </li>
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
