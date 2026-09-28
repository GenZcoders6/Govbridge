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
          background: "#050d1f",
          color: "#cbd5e1",
          padding: "6px 24px",
          fontSize: 11,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-sans)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#ffffff", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span>🇮🇳</span> GOVERNMENT OF INDIA
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ fontWeight: 600, color: "#94a3b8" }}>Government of Maharashtra</span>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <a href="#main-content" style={{ color: "#cbd5e1", textDecoration: "none" }} className="hover:text-white">
            Skip to Main Content
          </a>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ cursor: "pointer" }}>Screen Reader Access</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <div style={{ display: "flex", gap: 4, fontWeight: 700 }}>
            <button style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 11 }}>A-</button>
            <button style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", fontSize: 11, fontWeight: 800 }}>A</button>
            <button style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 11 }}>A+</button>
          </div>
          <span style={{ opacity: 0.4 }}>|</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontWeight: 800, color: "#4ade80", cursor: "pointer" }}>English</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ cursor: "pointer", color: "#cbd5e1" }}>मराठी</span>
          </div>
        </div>
      </div>

      {/* 2. Main Official Identity Banner */}
      <div
        style={{
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #071529 0%, #0c2044 50%, #0f2d5e 100%)",
          color: "#ffffff",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Left: Government Emblem & GovBridge Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Ashoka Emblem Badge */}
              <div
                style={{
                  height: 44,
                  padding: "4px 10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ fontSize: 20 }}>🏛️</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#ffffff", lineHeight: 1.1 }}>
                    भारत सरकार
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#34d399", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Government of India
                  </span>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                    GovBridge<span style={{ color: "#38bdf8" }}>.gov.in</span>
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 800, background: "#10b981", color: "#ffffff", padding: "2px 8px", borderRadius: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    DPDP 2023 LIVE
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 1 }}>
                  Inter-Departmental e-Governance &amp; Service Integration Portal
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: User Role Badge & Authenticated Session Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Active Portal Role Pill */}
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            {user?.role === "CITIZEN" ? "CITIZEN PORTAL" : `${currentDept.shortName} OFFICER PORTAL`}
          </div>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "#e2e8f0" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#ffffff" }}>{user.full_name || "Official"}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{user.role?.replace("_", " ")}</div>
              </div>
              <button
                onClick={logout}
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "5px 12px",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 11.5,
                  transition: "all 0.15s ease",
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                background: "#059669",
                color: "#ffffff",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Officer Login &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* 3. Horizontal Main Navigation Bar */}
      <nav
        style={{
          background: "#0c2044",
          padding: "0 24px",
          display: "flex",
          gap: 6,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            padding: "10px 18px",
            color: isNavActive("/dashboard") ? "#34d399" : "#cbd5e1",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: isNavActive("/dashboard") ? 800 : 600,
            borderBottom: isNavActive("/dashboard") ? "3px solid #10b981" : "3px solid transparent",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>🏠</span> Home
        </Link>
        <Link
          href="/services"
          style={{
            padding: "10px 18px",
            color: isNavActive("/services") ? "#34d399" : "#cbd5e1",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: isNavActive("/services") ? 800 : 600,
            borderBottom: isNavActive("/services") ? "3px solid #10b981" : "3px solid transparent",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>⚙️</span> Services
        </Link>
        <Link
          href="/applications"
          style={{
            padding: "10px 18px",
            color: isNavActive("/applications") ? "#34d399" : "#cbd5e1",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: isNavActive("/applications") ? 800 : 600,
            borderBottom: isNavActive("/applications") ? "3px solid #10b981" : "3px solid transparent",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>📋</span> Applications
        </Link>
        <Link
          href="/connectors"
          style={{
            padding: "10px 18px",
            color: isNavActive("/connectors") ? "#34d399" : "#cbd5e1",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: isNavActive("/connectors") ? 800 : 600,
            borderBottom: isNavActive("/connectors") ? "3px solid #10b981" : "3px solid transparent",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>🔌</span> Gateways &amp; Connectors
        </Link>
        <Link
          href="/reports"
          style={{
            padding: "10px 18px",
            color: isNavActive("/reports") ? "#34d399" : "#cbd5e1",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: isNavActive("/reports") ? 800 : 600,
            borderBottom: isNavActive("/reports") ? "3px solid #10b981" : "3px solid transparent",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>📊</span> Reports
        </Link>
        <Link
          href="/audit"
          style={{
            padding: "10px 18px",
            color: isNavActive("/audit") ? "#34d399" : "#cbd5e1",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: isNavActive("/audit") ? 800 : 600,
            borderBottom: isNavActive("/audit") ? "3px solid #10b981" : "3px solid transparent",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>🛡️</span> Audit Trail
        </Link>
        <Link
          href="/contact"
          style={{
            padding: "10px 18px",
            color: isNavActive("/contact") ? "#34d399" : "#cbd5e1",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: isNavActive("/contact") ? 800 : 600,
            borderBottom: isNavActive("/contact") ? "3px solid #10b981" : "3px solid transparent",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>❓</span> Help &amp; Support
        </Link>
      </nav>
    </header>
  );
}
