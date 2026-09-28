"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useDepartmentStore, DEPARTMENTS, type DepartmentCode } from "@/store/departmentStore";

interface NavItem {
  label: string;
  href: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { activeDepartment } = useDepartmentStore();

  const userRole = user?.role || "DEPARTMENT_OFFICER";
  const deptInfo = DEPARTMENTS[activeDepartment] || DEPARTMENTS.ALL;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // Determine Sidebar Header Title and Menu Items dynamically based on Role + Active Department
  let sidebarTitle = "DEPARTMENTAL MENU";
  let navItems: NavItem[] = [];

  if (userRole === "CITIZEN") {
    sidebarTitle = "CITIZEN PORTAL";
    navItems = [
      { label: "Citizen Home", href: "/dashboard" },
      { label: "Browse Services", href: "/services" },
      { label: "My Applications", href: "/applications" },
      { label: "Apply New Service", href: "/applications/new" },
      { label: "Federated Identity", href: "/identity" },
      { label: "Consent & Privacy", href: "/consents" },
      { label: "Help & Support", href: "/contact" },
    ];
  } else if (userRole === "INTEGRATION_ADMIN") {
    sidebarTitle = "ADMIN GATEWAY MENU";
    navItems = [
      { label: "System Overview", href: "/dashboard" },
      { label: "Department Registry", href: "/connectors" },
      { label: "Connector Registry", href: "/connectors" },
      { label: "Service Specifications", href: "/services/specifications" },
      { label: "System Exceptions", href: "/exceptions" },
      { label: "System Status", href: "/monitoring" },
      { label: "Global Audit Trail", href: "/audit" },
      { label: "MIS Reports", href: "/reports" },
    ];
  } else if (userRole === "AUDITOR") {
    sidebarTitle = "AUDIT & COMPLIANCE";
    navItems = [
      { label: "Audit Overview", href: "/dashboard" },
      { label: "Immutable Audit Trail", href: "/audit" },
      { label: "DPDP Consent Register", href: "/consents" },
      { label: "System Exceptions Audit", href: "/exceptions" },
      { label: "SLA Compliance Audit", href: "/monitoring" },
      { label: "Compliance Reports", href: "/reports" },
    ];
  } else {
    // DEPARTMENT_OFFICER (or default officer view) - Custom menu per department!
    switch (activeDepartment) {
      case "UIDAI":
        sidebarTitle = "UIDAI AADHAAR MENU";
        navItems = [
          { label: "UIDAI Overview", href: "/dashboard" },
          { label: "Aadhaar E-KYC Queue", href: "/applications" },
          { label: "Demographic Auth Specs", href: "/services/specifications" },
          { label: "mTLS Security Policy", href: "/connectors" },
          { label: "CIDR Audit Logs", href: "/audit" },
          { label: "Department Reports", href: "/reports" },
        ];
        break;
      case "CBDT":
        sidebarTitle = "CBDT TAX REVENUE MENU";
        navItems = [
          { label: "Income Tax Overview", href: "/dashboard" },
          { label: "PAN Verification Queue", href: "/applications" },
          { label: "Tax Assessment Rules", href: "/services/specifications" },
          { label: "ITD Gateway Status", href: "/connectors" },
          { label: "Income Threshold Audit", href: "/audit" },
          { label: "Tax Scheme Reports", href: "/reports" },
        ];
        break;
      case "ECI":
        sidebarTitle = "ECI ELECTORAL MENU";
        navItems = [
          { label: "Electoral Overview", href: "/dashboard" },
          { label: "EPIC Validation Queue", href: "/applications" },
          { label: "Constituency Rules", href: "/services/specifications" },
          { label: "ERONET Sync Status", href: "/connectors" },
          { label: "Electoral Audit Logs", href: "/audit" },
        ];
        break;
      case "MSRTC":
        sidebarTitle = "MSRTC BUS DEPOT MENU";
        navItems = [
          { label: "Bus Depot Overview", href: "/dashboard" },
          { label: "Pass Application Queue", href: "/applications" },
          { label: "Concession Rules", href: "/services/specifications" },
          { label: "Depot Gateway Status", href: "/connectors" },
          { label: "Pass Subsidy Reports", href: "/reports" },
        ];
        break;
      case "EDU":
        sidebarTitle = "DIGILOCKER NAD MENU";
        navItems = [
          { label: "NAD Registrar Overview", href: "/dashboard" },
          { label: "Degree Verification Queue", href: "/applications" },
          { label: "Marksheet Vault Rules", href: "/services/specifications" },
          { label: "NAD Blockchain Status", href: "/connectors" },
          { label: "Academic Audit Logs", href: "/audit" },
        ];
        break;
      case "SKILL":
        sidebarTitle = "MSDE SKILL & DBT MENU";
        navItems = [
          { label: "Skill & DBT Overview", href: "/dashboard" },
          { label: "Stipend Application Queue", href: "/applications" },
          { label: "NSQF Stipend Rules", href: "/services/specifications" },
          { label: "PFMS Bank Subsystem", href: "/connectors" },
          { label: "DBT Disbursement Reports", href: "/reports" },
        ];
        break;
      case "ULB":
        sidebarTitle = "ULB MUNICIPAL MENU";
        navItems = [
          { label: "Municipal Revenue Overview", href: "/dashboard" },
          { label: "NOC Clearance Queue", href: "/applications" },
          { label: "Property Tax Rules", href: "/services/specifications" },
          { label: "ULB ERP Engine Status", href: "/connectors" },
          { label: "Clearance Audit Logs", href: "/audit" },
        ];
        break;
      default:
        sidebarTitle = "STATE INTEROPERABILITY MENU";
        navItems = [
          { label: "Dashboard Overview", href: "/dashboard" },
          { label: "Applications Register", href: "/applications" },
          { label: "Service Management", href: "/services" },
          { label: "Service Specifications", href: "/services/specifications" },
          { label: "Workflow Processing", href: "/workflows" },
          { label: "Connector Registry", href: "/connectors" },
          { label: "Department Reports", href: "/reports" },
          { label: "Audit & Logs", href: "/audit" },
          { label: "System Status", href: "/monitoring" },
          { label: "System Exceptions", href: "/exceptions" },
        ];
        break;
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          {sidebarTitle}
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>
          {deptInfo.sealEmoji} {deptInfo.fullName}
        </div>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.label}>
              <Link href={item.href} className={`sidebar-item ${active ? "active" : ""}`}>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Official Department Context Badge */}
      <div
        style={{
          marginTop: "auto",
          padding: "16px 18px",
          background: "rgba(0, 0, 0, 0.25)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: 11.5,
          color: "#cbd5e1",
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 800, color: "#ffffff", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{deptInfo.sealEmoji}</span>
          <span>{deptInfo.shortName} Authority</span>
        </div>
        <div>Active Role: <strong style={{ color: "#38bdf8" }}>{userRole.replace("_", " ")}</strong></div>
        <div style={{ fontSize: 10.5, color: "#34d399", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <span>🟢</span> DPDP Act 2023 Compliant
        </div>
      </div>
    </aside>
  );
}
