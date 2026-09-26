"use client";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const BreadcrumbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GovBridgeLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="2" fill="#2563eb" opacity="0.9"/>
    <rect x="10" y="1" width="7" height="7" rx="2" fill="#2563eb" opacity="0.5"/>
    <rect x="1" y="10" width="7" height="7" rx="2" fill="#2563eb" opacity="0.5"/>
    <rect x="10" y="10" width="7" height="7" rx="2" fill="#2563eb" opacity="0.9"/>
  </svg>
);

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();

  const now = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="header">
      {/* Left: breadcrumb + title */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <GovBridgeLogo />
          <span style={{ fontSize: 12, color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 4 }}>
            GovBridge
            <BreadcrumbIcon />
            <span style={{ color: "var(--gray-600)", fontWeight: 500 }}>{title}</span>
          </span>
        </div>
        {subtitle && (
          <p className="header-subtitle">{subtitle}</p>
        )}
      </div>

      {/* Right: date + status */}
      <div className="header-right">
        {/* Quick Launch Demo Button */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("open-govbridge-demo"));
              if (window.location.pathname !== "/dashboard") {
                window.location.href = "/dashboard?demo=1";
              }
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.15))",
            border: "1.5px solid rgba(37,99,235,0.35)",
            borderRadius: "var(--radius-full)",
            color: "#1d4ed8",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(14,165,233,0.25))";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.15))";
            e.currentTarget.style.transform = "none";
          }}
        >
          <span>🚀</span>
          <span>Interoperability Demo</span>
        </button>

        {/* Environment badge */}
        <div className="header-env-badge">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Demo
        </div>

        {/* System status */}
        <div className="header-system-status">
          <span className="header-status-dot" />
          Systems Online
        </div>

        {/* Date */}
        <div className="header-date" style={{ borderLeft: "1px solid var(--gray-200)", paddingLeft: 12 }}>
          {now}
        </div>

        {/* User avatar chip */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px 5px 6px",
              background: "var(--gray-50)",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-700)" }}>
              {user.full_name?.split(" ")[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
