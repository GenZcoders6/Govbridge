"use client";

interface BadgeProps {
  status: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  // Application statuses
  DRAFT: { cls: "badge-gray", label: "Draft" },
  SUBMITTED: { cls: "badge-info", label: "Submitted" },
  IN_REVIEW: { cls: "badge-warning", label: "In Review" },
  PENDING_DATA: { cls: "badge-warning", label: "Pending Data" },
  APPROVED: { cls: "badge-success", label: "Approved" },
  REJECTED: { cls: "badge-error", label: "Rejected" },
  CANCELLED: { cls: "badge-gray", label: "Cancelled" },
  // Connector statuses
  ACTIVE: { cls: "badge-success", label: "Active" },
  INACTIVE: { cls: "badge-gray", label: "Inactive" },
  DEGRADED: { cls: "badge-warning", label: "Degraded" },
  ERROR: { cls: "badge-error", label: "Error" },
  // Event severities
  INFO: { cls: "badge-info", label: "Info" },
  WARNING: { cls: "badge-warning", label: "Warning" },
  CRITICAL: { cls: "badge-error", label: "Critical" },
  // Consent
  PENDING: { cls: "badge-warning", label: "Pending" },
  GRANTED: { cls: "badge-success", label: "Granted" },
  DENIED: { cls: "badge-error", label: "Denied" },
  REVOKED: { cls: "badge-gray", label: "Revoked" },
  EXPIRED: { cls: "badge-gray", label: "Expired" },
  // Step status
  COMPLETED: { cls: "badge-success", label: "Completed" },
  FAILED: { cls: "badge-error", label: "Failed" },
  SKIPPED: { cls: "badge-gray", label: "Skipped" },
  IN_PROGRESS: { cls: "badge-info", label: "In Progress" },
};

export function StatusBadge({ status, showDot = true, size = "md" }: BadgeProps) {
  const config = STATUS_MAP[status] || { cls: "badge-gray", label: status };
  return (
    <span className={`badge ${config.cls}`} style={size === "sm" ? { fontSize: 10, padding: "2px 6px" } : {}}>
      {showDot && <span className="badge-dot" />}
      {config.label}
    </span>
  );
}

interface ProtocolBadgeProps {
  protocol: string;
}

const PROTOCOL_MAP: Record<string, { label: string; color: string; bg: string }> = {
  REST_JSON: { label: "REST/JSON", color: "#0369a1", bg: "#e0f2fe" },
  SOAP_XML: { label: "SOAP/XML", color: "#92400e", bg: "#fef3c7" },
  DATABASE: { label: "DB Connector", color: "#6d28d9", bg: "#ede9fe" },
  WEBHOOK: { label: "Webhook", color: "#15803d", bg: "#dcfce7" },
  GRAPHQL: { label: "GraphQL", color: "#be185d", bg: "#fce7f3" },
};

export function ProtocolBadge({ protocol }: ProtocolBadgeProps) {
  const cfg = PROTOCOL_MAP[protocol] || { label: protocol, color: "#475569", bg: "#f1f5f9" };
  return (
    <span
      className="badge"
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontFamily: "'SF Mono', 'Consolas', monospace",
        fontSize: 10,
      }}
    >
      {cfg.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    CITIZEN: { label: "Citizen", color: "#2563eb" },
    DEPARTMENT_OFFICER: { label: "Officer", color: "#7c3aed" },
    INTEGRATION_ADMIN: { label: "Admin", color: "#dc2626" },
    AUDITOR: { label: "Auditor", color: "#d97706" },
  };
  const cfg = map[role] || { label: role, color: "#475569" };
  return (
    <span
      className="badge"
      style={{
        background: cfg.color + "1a",
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
      }}
    >
      {cfg.label}
    </span>
  );
}
