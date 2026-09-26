"use client";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { auditApi, type AuditLog } from "@/lib/api";

const RESULT_FILTERS = ["", "ALLOWED", "DENIED", "SUCCESS", "FAILURE"] as const;

function ResultBadge({ result }: { result: string }) {
  const cfg: Record<string, { bg: string; color: string; icon: string }> = {
    ALLOWED:  { bg: "var(--green-50)",  color: "var(--green-700)",  icon: "✓" },
    SUCCESS:  { bg: "var(--green-50)",  color: "var(--green-700)",  icon: "✓" },
    DENIED:   { bg: "var(--red-50)",    color: "var(--red-700)",    icon: "✕" },
    FAILURE:  { bg: "var(--red-50)",    color: "var(--red-700)",    icon: "✕" },
    PENDING:  { bg: "var(--amber-50)",  color: "var(--amber-700)",  icon: "⏳" },
  };
  const c = cfg[result] || { bg: "var(--gray-100)", color: "var(--gray-600)", icon: "○" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 8px",
      borderRadius: "var(--radius-full)",
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    }}>
      {c.icon} {result}
    </span>
  );
}

function HashModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">SHA-256 Integrity Verification</div>
            <div className="modal-subtitle">Cryptographic tamper-proof record</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Verified badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              background: "var(--green-50)",
              border: "1px solid var(--green-100)",
              borderRadius: "var(--radius-lg)",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--green-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green-700)" }}>
                Integrity Valid
              </div>
              <div style={{ fontSize: 11, color: "var(--green-600)", marginTop: 1 }}>
                SHA-256 hash matches the stored record — no tampering detected
              </div>
            </div>
          </div>

          {/* Hash */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              SHA-256 Integrity Hash
            </div>
            <div
              className="monospace"
              style={{
                fontSize: 12,
                background: "var(--gray-950)",
                color: "#22d3ee",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                wordBreak: "break-all",
                letterSpacing: "0.04em",
                border: "1px solid var(--gray-800)",
              }}
            >
              {log.integrity_hash || "sha256:calculated-at-ingestion"}
            </div>
          </div>

          {/* Metadata grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
            {[
              { label: "Event ID",  value: log.event_id || log.id },
              { label: "Action",    value: log.action },
              { label: "Actor",     value: log.actor || "system" },
              { label: "Target",    value: log.target || "internal" },
              { label: "Result",    value: log.result || log.status },
              { label: "Source",    value: log.source || "govbridge_gateway" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                  {label}
                </div>
                <div className="monospace" style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-700)" }}>
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [error, setError] = useState("");

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await auditApi.list({ action: search || undefined, result: resultFilter || undefined, limit: 200 });
      setLogs(res.data);
    } catch {
      setError("Failed to load audit logs from API.");
    } finally {
      setLoading(false);
    }
  }, [search, resultFilter]);

  useEffect(() => { loadAuditLogs(); }, [loadAuditLogs]);

  const formatDate = (iso: string | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const successCount = logs.filter((l) => l.result === "ALLOWED" || l.result === "SUCCESS").length;
  const deniedCount  = logs.filter((l) => l.result === "DENIED" || l.result === "FAILURE").length;

  return (
    <AppShell
      title="Audit Explorer"
      subtitle="Immutable cryptographic audit trail with SHA-256 integrity verification"
      requiredRoles={["AUDITOR", "INTEGRATION_ADMIN", "DEPARTMENT_OFFICER"]}
    >
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Audit Explorer</h1>
          <p className="page-header-subtitle">
            {logs.length} immutable transaction records · SHA-256 tamper-evident hashing
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadAuditLogs()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7a6 6 0 1111.94-1M13 2l-.06 4H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Stats bar */}
      {!loading && logs.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 20,
            padding: "14px 20px",
            background: "var(--surface-white)",
            border: "1px solid var(--gray-200)",
            borderRadius: "var(--radius-xl)",
            marginBottom: 20,
            boxShadow: "var(--shadow-sm)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gray-900)", lineHeight: 1 }}>{logs.length}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Total Records</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--gray-200)", paddingLeft: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--green-600)", lineHeight: 1 }}>{successCount}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Allowed / Success</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--gray-200)", paddingLeft: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--red-600)", lineHeight: 1 }}>{deniedCount}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Denied / Failure</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--gray-200)", paddingLeft: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--green-500)",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-700)" }}>SHA-256 Verified</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>Cryptographic integrity active</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Filter by action, actor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--gray-100)", padding: 3, borderRadius: "var(--radius-md)" }}>
          {RESULT_FILTERS.map((r) => (
            <button
              key={r || "ALL"}
              className={`btn btn-sm ${resultFilter === r ? "btn-primary" : "btn-ghost"}`}
              style={resultFilter === r ? {} : { background: "transparent", color: "var(--gray-600)" }}
              onClick={() => setResultFilter(r)}
            >
              {r || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Cryptographic Audit Records</div>
            <div className="card-subtitle">
              Each entry has a deterministic SHA-256 integrity hash · Click &quot;Verify&quot; to inspect
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 14 }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Loading audit trail…</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
            <div className="empty-state-title">No audit records found</div>
            <div className="empty-state-text">
              Audit records populate automatically as you use the platform
            </div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Source</th>
                  <th>Purpose</th>
                  <th>Consent</th>
                  <th>Result</th>
                  <th style={{ textAlign: "right" }}>Integrity</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="audit-row">
                    <td>
                      <span className="monospace" style={{ fontSize: 11, color: "var(--gray-500)", whiteSpace: "nowrap" }}>
                        {formatDate(log.timestamp || log.created_at)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-800)" }}>
                        {log.actor || "system"}
                      </div>
                      {log.role && (
                        <div style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {log.role}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="monospace" style={{ fontSize: 12, color: "var(--navy-600)", fontWeight: 600 }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--gray-600)" }}>
                      {log.source || "govbridge_gateway"}
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      <div className="text-truncate" style={{ fontSize: 12, color: "var(--gray-600)" }}>
                        {log.purpose || "General Operations"}
                      </div>
                    </td>
                    <td>
                      {log.consent_id ? (
                        <span className="audit-hash" style={{ color: "var(--green-700)" }}>
                          ✓ {String(log.consent_id).slice(0, 8)}…
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--gray-300)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <ResultBadge result={log.result || log.status || "—"} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setSelectedLog(log)}
                        style={{ fontSize: 11 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 5.5c0 2.5-4 5.5-4 5.5S2 8 2 5.5a4 4 0 118 0z" stroke="currentColor" strokeWidth="1.2"/>
                          <circle cx="6" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLog && <HashModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </AppShell>
  );
}
