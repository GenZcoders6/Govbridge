"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useDepartmentStore, DEPARTMENTS } from "@/store/departmentStore";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { activeDepartment } = useDepartmentStore();

  const currentDept = DEPARTMENTS[activeDepartment] || DEPARTMENTS.ALL;

  const isNavActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <header style={{ width: "100%", background: "#ffffff", borderBottom: "1px solid #cccccc" }}>
      {/* 1. Topmost Utility & Accessibility Bar */}
      <div
        style={{
          background: "#002147",
          color: "#ffffff",
          padding: "4px 20px",
          fontSize: 11,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span>Government of India</span>
          <span>|</span>
          <span style={{ fontWeight: 700 }}>Government of Maharashtra</span>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <a href="#main-content" style={{ color: "#ffffff", textDecoration: "none" }}>
            Skip to Main Content
          </a>
          <span>|</span>
          <span style={{ cursor: "pointer" }}>Screen Reader Access</span>
          <span>|</span>
          <div style={{ display: "flex", gap: 4, fontWeight: 700 }}>
            <span style={{ cursor: "pointer" }}>A-</span>
            <span style={{ cursor: "pointer" }}>A</span>
            <span style={{ cursor: "pointer" }}>A+</span>
          </div>
          <span>|</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontWeight: 700, cursor: "pointer" }}>English</span>
            <span>|</span>
            <span style={{ cursor: "pointer" }}>मराठी</span>
          </div>
        </div>
      </div>

      {/* 2. Main Official Identity Banner */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {/* Left: Government Seal & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Official Emblem Representation */}
          <div
            style={{
              width: 44,
              height: 48,
              border: "1.5px solid #003366",
              borderRadius: 2,
              background: "#f0f4f8",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 2,
            }}
          >
            <div style={{ fontSize: 16, lineHeight: 1 }}>🏛️</div>
            <div style={{ fontSize: 7, fontWeight: 900, color: "#003366", textTransform: "uppercase", marginTop: 2 }}>
              SATYAMEVA JAYATE
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#003366", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Government of Maharashtra
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#002147", lineHeight: 1.2 }}>
              GovBridge
            </div>
            <div style={{ fontSize: 11, color: "#555555", fontWeight: 600 }}>
              Inter-Departmental e-Governance &amp; Service Integration Portal
            </div>
          </div>
        </div>

        {/* Right: User Login & Department Details */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              background: "#003366",
              color: "#ffffff",
              padding: "2px 8px",
              borderRadius: 2,
              display: "inline-block",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 4,
            }}
          >
            {user?.role === "CITIZEN" ? "CITIZEN PORTAL" : `${currentDept.shortName} OFFICER PORTAL`}
          </div>

          {user ? (
            <div style={{ fontSize: 12, color: "#212529" }}>
              Logged in: <strong>{user.full_name || "Official"}</strong> ({user.role?.replace("_", " ")})
              <span style={{ margin: "0 6px", color: "#ccc" }}>|</span>
              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#721c24",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: 12,
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#003366", fontWeight: 700 }}>
              <Link href="/login" style={{ color: "#003366" }}>Officer Login</Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Horizontal Main Navigation Bar */}
      <nav
        style={{
          background: "#003366",
          padding: "0 20px",
          display: "flex",
          gap: 2,
          borderBottom: "2px solid #002147",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            padding: "9px 16px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: isNavActive("/dashboard") ? 800 : 600,
            background: isNavActive("/dashboard") ? "#002147" : "transparent",
            borderBottom: isNavActive("/dashboard") ? "3px solid #ffcc00" : "3px solid transparent",
          }}
        >
          Home
        </Link>
        <Link
          href="/about"
          style={{
            padding: "9px 16px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: isNavActive("/about") ? 800 : 600,
            background: isNavActive("/about") ? "#002147" : "transparent",
            borderBottom: isNavActive("/about") ? "3px solid #ffcc00" : "3px solid transparent",
          }}
        >
          About Department
        </Link>
        <Link
          href="/services"
          style={{
            padding: "9px 16px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: isNavActive("/services") ? 800 : 600,
            background: isNavActive("/services") ? "#002147" : "transparent",
            borderBottom: isNavActive("/services") ? "3px solid #ffcc00" : "3px solid transparent",
          }}
        >
          Services
        </Link>
        <Link
          href="/applications"
          style={{
            padding: "9px 16px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: isNavActive("/applications") ? 800 : 600,
            background: isNavActive("/applications") ? "#002147" : "transparent",
            borderBottom: isNavActive("/applications") ? "3px solid #ffcc00" : "3px solid transparent",
          }}
        >
          Applications
        </Link>
        <Link
          href="/reports"
          style={{
            padding: "9px 16px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: isNavActive("/reports") ? 800 : 600,
            background: isNavActive("/reports") ? "#002147" : "transparent",
            borderBottom: isNavActive("/reports") ? "3px solid #ffcc00" : "3px solid transparent",
          }}
        >
          Reports
        </Link>
        <Link
          href="/notifications"
          style={{
            padding: "9px 16px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: isNavActive("/notifications") ? 800 : 600,
            background: isNavActive("/notifications") ? "#002147" : "transparent",
            borderBottom: isNavActive("/notifications") ? "3px solid #ffcc00" : "3px solid transparent",
          }}
        >
          Notifications
        </Link>
        <Link
          href="/help"
          style={{
            padding: "9px 16px",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: isNavActive("/help") ? 800 : 600,
            background: isNavActive("/help") ? "#002147" : "transparent",
            borderBottom: isNavActive("/help") ? "3px solid #ffcc00" : "3px solid transparent",
          }}
        >
          Help
        </Link>
      </nav>
    </header>
  );
}
