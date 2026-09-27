"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  tag?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

// SVG icon components for crisp professional icons
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/>
    </svg>
  ),
  NewApp: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Applications: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Workflows: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="13" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8h3l2-3M5 8h3l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Exceptions: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L2 14h12L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Connectors: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="13" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 3h5M3 5v5M11 5l-5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Gateway: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="14" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 8h8M9 6.5L11 8l-2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Schema: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 4h4v4H3zM9 4h4v4H9zM5 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 8v4M11 8v4" stroke="currentColor" strokeWidth="1.3" strokeDasharray="1.5 1.5"/>
    </svg>
  ),
  Exchange: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5h12M2 5l3-2M2 5l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 11H2M14 11l-3-2M14 11l-3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Identity: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Consent: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Policy: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L2 4v5c0 3 2.7 5 6 6 3.3-1 6-3 6-6V4L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Health: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8h3l2-5 2 10 2-7 2 4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Events: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.3"/>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 2"/>
      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  ),
  Queues: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h9M2 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Audit: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11 2H5a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 7l1.5 1.5L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Dept: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l7 4v2H1V5l7-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M3 7v6M6 7v6M10 7v6M13 7v6M1 13h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12 7a2 2 0 100-4M15 14c0-2.2-1.3-4-3-4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Config: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Designer: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L6 4l4 4 2-3 2 7H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
};

const NAV: NavSection[] = [
  {
    section: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: <Icons.Dashboard /> }],
  },
  {
    section: "Departmental Services",
    items: [
      { label: "Services Catalogue", href: "/services", icon: <Icons.NewApp />, tag: "New" },
      { label: "My Applications", href: "/applications", icon: <Icons.Applications /> },
      { label: "New Application", href: "/applications/new", icon: <Icons.NewApp />, roles: ["CITIZEN", "INTEGRATION_ADMIN"] },
    ],
  },
  {
    section: "Workflow Center",
    items: [
      { label: "Active Workflows", href: "/workflows", icon: <Icons.Workflows />, roles: ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"] },
      { label: "Workflow Designer", href: "/workflows/designer", icon: <Icons.Designer />, roles: ["INTEGRATION_ADMIN"] },
      { label: "Exceptions", href: "/workflows/exceptions", icon: <Icons.Exceptions />, roles: ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"] },
    ],
  },
  {
    section: "Interoperability",
    items: [
      { label: "Connector Registry", href: "/connectors", icon: <Icons.Connectors />, roles: ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"] },
      { label: "API Gateway", href: "/connectors/gateway", icon: <Icons.Gateway />, roles: ["INTEGRATION_ADMIN"] },
      { label: "Schema Mapping", href: "/connectors/schema", icon: <Icons.Schema />, roles: ["INTEGRATION_ADMIN"] },
      { label: "Data Exchange", href: "/connectors/exchange", icon: <Icons.Exchange />, roles: ["INTEGRATION_ADMIN"] },
    ],
  },
  {
    section: "Identity & Consent",
    items: [
      { label: "Master Identity", href: "/identity", icon: <Icons.Identity />, roles: ["CITIZEN", "INTEGRATION_ADMIN"] },
      { label: "Consent Manager", href: "/consents", icon: <Icons.Consent />, roles: ["CITIZEN", "INTEGRATION_ADMIN"] },
      { label: "Access Policies", href: "/policies", icon: <Icons.Policy />, roles: ["INTEGRATION_ADMIN"] },
    ],
  },
  {
    section: "Monitoring",
    items: [
      { label: "System Health", href: "/monitoring/health", icon: <Icons.Health />, roles: ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"] },
      { label: "Events", href: "/monitoring/events", icon: <Icons.Events />, roles: ["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"] },
      { label: "Queues", href: "/monitoring/queues", icon: <Icons.Queues />, roles: ["INTEGRATION_ADMIN"] },
    ],
  },
  {
    section: "Audit",
    items: [
      { label: "Audit Explorer", href: "/audit", icon: <Icons.Audit />, roles: ["AUDITOR", "INTEGRATION_ADMIN"] },
    ],
  },
  {
    section: "Administration",
    items: [
      { label: "Departments", href: "/admin/departments", icon: <Icons.Dept />, roles: ["INTEGRATION_ADMIN"] },
      { label: "Users & Roles", href: "/admin/users", icon: <Icons.Users />, roles: ["INTEGRATION_ADMIN"] },
      { label: "Configuration", href: "/admin/config", icon: <Icons.Config />, roles: ["INTEGRATION_ADMIN"] },
    ],
  },
];

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  CITIZEN: {
    bg: "rgba(37,99,235,0.12)",
    border: "rgba(37,99,235,0.4)",
    text: "#60a5fa",
    label: "Citizen",
  },
  DEPARTMENT_OFFICER: {
    bg: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.4)",
    text: "#a78bfa",
    label: "Officer",
  },
  INTEGRATION_ADMIN: {
    bg: "rgba(220,38,38,0.12)",
    border: "rgba(220,38,38,0.4)",
    text: "#f87171",
    label: "Admin",
  },
  AUDITOR: {
    bg: "rgba(217,119,6,0.12)",
    border: "rgba(217,119,6,0.4)",
    text: "#fbbf24",
    label: "Auditor",
  },
};

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.25 2.5H3a1 1 0 00-1 1v7a1 1 0 001 1h2.25M9.5 9.5L12 7l-2.5-2.5M12 7H5.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const roleInfo = ROLE_COLORS[user?.role || "CITIZEN"] || ROLE_COLORS.CITIZEN;

  const isItemAllowed = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">GB</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">GovBridge</div>
          <div className="sidebar-logo-tagline">Interoperability Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map((section) => {
          const visibleItems = section.items.filter(isItemAllowed);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.tag && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        background: "rgba(34,197,94,0.2)",
                        color: "#4ade80",
                        padding: "1px 5px",
                        borderRadius: 3,
                        border: "1px solid rgba(34,197,94,0.25)",
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer — user info */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div
            className="sidebar-avatar"
            style={{
              background: roleInfo.bg,
              borderColor: roleInfo.border,
              color: roleInfo.text,
            }}
          >
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">
              {user?.full_name || "User"}
            </div>
            <div className="sidebar-user-role" style={{ color: roleInfo.text }}>
              {roleInfo.label}
            </div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={logout}
            title="Sign out"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* SIH Badge */}
        <div
          style={{
            marginTop: 10,
            padding: "6px 8px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              animation: "pulse 2s infinite",
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
            SIH26129 · Demo Environment
          </div>
        </div>
      </div>
    </aside>
  );
}
