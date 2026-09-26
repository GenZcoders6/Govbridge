"use client";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, ProtocolBadge } from "@/components/StatusBadge";
import { connectorsApi, type Connector } from "@/lib/api";

const PROTOCOL_ICONS: Record<string, string> = {
  REST_JSON: "🌐",
  SOAP_XML:  "📄",
  DATABASE:  "🗄",
  WEBHOOK:   "📡",
  GRAPHQL:   "🔷",
};

const PROTOCOL_DESC: Record<string, string> = {
  REST_JSON: "REST / JSON",
  SOAP_XML:  "SOAP / XML",
  DATABASE:  "DB Connector",
  WEBHOOK:   "Event Webhook",
  GRAPHQL:   "GraphQL",
};

function ConnectorCard({
  connector,
  onHealthCheck,
  probing,
  onDetails,
}: {
  connector: Connector;
  onHealthCheck: () => void;
  probing: boolean;
  onDetails: () => void;
}) {
  const isHealthy  = connector.status === "ACTIVE";
  const isDegraded = connector.status === "DEGRADED";
  const isError    = connector.status === "ERROR" || connector.status === "INACTIVE";

  const accentClass = isHealthy ? "connector-card-healthy" : isDegraded ? "connector-card-degraded" : "connector-card-error";
  const statusDotColor = isHealthy ? "var(--green-500)" : isDegraded ? "var(--amber-500)" : "var(--red-500)";

  return (
    <div className={`connector-card ${accentClass}`}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "var(--gray-50)",
            border: "1px solid var(--gray-200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {PROTOCOL_ICONS[connector.protocol] || "🔗"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)", lineHeight: 1.2 }}>
            {connector.name}
          </div>
          <div
            className="monospace"
            style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}
          >
            {connector.code}
          </div>
        </div>
        {/* Live status dot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px",
            borderRadius: "var(--radius-full)",
            background: isHealthy ? "var(--green-50)" : isDegraded ? "var(--amber-50)" : "var(--red-50)",
            border: `1px solid ${isHealthy ? "var(--green-100)" : isDegraded ? "var(--amber-100)" : "var(--red-100)"}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusDotColor,
              animation: isHealthy ? "pulse 2s infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: isHealthy ? "var(--green-700)" : isDegraded ? "var(--amber-700)" : "var(--red-700)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {connector.status || "Unknown"}
          </span>
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <ProtocolBadge protocol={connector.protocol} />
        {connector.tags?.slice(0, 2).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>

      {/* Metadata grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 12px",
          padding: "12px",
          background: "var(--gray-50)",
          borderRadius: 8,
          border: "1px solid var(--gray-100)",
          marginBottom: 14,
          fontSize: 12,
        }}
      >
        <div>
          <div style={{ color: "var(--gray-400)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Protocol</div>
          <div style={{ fontWeight: 600, color: "var(--gray-700)", marginTop: 2 }}>
            {PROTOCOL_DESC[connector.protocol] || connector.protocol}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--gray-400)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auth</div>
          <div style={{ fontWeight: 600, color: "var(--gray-700)", marginTop: 2 }}>
            {connector.authentication || connector.auth_type || "None"}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--gray-400)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>System</div>
          <div style={{ fontWeight: 600, color: "var(--gray-700)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {connector.system_type || connector.tags?.[0] || "Gov Registry"}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--gray-400)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Timeout</div>
          <div style={{ fontWeight: 600, color: "var(--gray-700)", marginTop: 2 }}>
            {connector.timeout_seconds}s
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={onHealthCheck}
          disabled={probing}
          style={{ flex: 1 }}
        >
          {probing ? (
            <>
              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
              Probing…
            </>
          ) : (
            "Health Probe"
          )}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onDetails}
        >
          Details
        </button>
      </div>
    </div>
  );
}

/* ── Details Modal ──────────────────────────────────────────── */
function ConnectorModal({
  connector,
  onClose,
  onProbe,
  probing,
}: {
  connector: Connector;
  onClose: () => void;
  onProbe: () => void;
  probing: boolean;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{connector.name}</div>
            <div className="modal-subtitle">Connector Code: {connector.code}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 20 }}>
            {[
              { label: "Connector Code", value: connector.code, mono: true },
              { label: "Protocol", value: PROTOCOL_DESC[connector.protocol] || connector.protocol },
              { label: "Authentication", value: connector.authentication || connector.auth_type || "None" },
              { label: "Timeout", value: `${connector.timeout_seconds}s` },
              { label: "Status", value: <StatusBadge status={connector.status} /> },
              { label: "System Type", value: connector.system_type || connector.tags?.[0] || "Government Registry" },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {label}
                </div>
                <div className={mono ? "monospace" : ""} style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Base URL */}
          {connector.base_url && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Endpoint URL
              </div>
              <div
                className="monospace"
                style={{
                  fontSize: 12,
                  color: "var(--navy-600)",
                  background: "var(--navy-50)",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--navy-100)",
                  wordBreak: "break-all",
                }}
              >
                {connector.base_url}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Description
            </div>
            <div style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.6 }}>
              {connector.description || "Simulated government registry adapter. Connects GovBridge to external department systems."}
            </div>
          </div>

          {/* Tags */}
          {connector.tags?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Tags
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {connector.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { onProbe(); onClose(); }}
            disabled={probing}
          >
            Trigger Health Probe
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [probingId, setProbingId] = useState<string | null>(null);
  const [activeModalConnector, setActiveModalConnector] = useState<Connector | null>(null);
  const [probeResult, setProbeResult] = useState<{ name: string; status: string; latency: number } | null>(null);
  const [error, setError] = useState("");

  const loadConnectors = useCallback(async () => {
    try {
      const res = await connectorsApi.list();
      setConnectors(res.data);
    } catch {
      setError("Failed to fetch connector registry from API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConnectors(); }, [loadConnectors]);

  const handleHealthCheck = async (id: string, name: string) => {
    setProbingId(id);
    setProbeResult(null);
    try {
      const res = await connectorsApi.healthCheck(id);
      setProbeResult({ name, status: res.data.status, latency: res.data.latency_ms ?? -1 });
      await loadConnectors();
    } catch {
      setProbeResult({ name, status: "ERROR", latency: -1 });
    } finally {
      setProbingId(null);
    }
  };

  const healthy   = connectors.filter((c) => c.status === "ACTIVE").length;
  const degraded  = connectors.filter((c) => c.status === "DEGRADED").length;
  const errored   = connectors.filter((c) => c.status === "ERROR" || c.status === "INACTIVE").length;

  return (
    <AppShell title="Connector Registry" subtitle="Heterogeneous Government System Interoperability Adapters">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Connector Registry</h1>
          <p className="page-header-subtitle">
            {connectors.length} registered departmental adapters · REST/JSON, SOAP/XML, Database
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => loadConnectors()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7a6 6 0 1111.94-1M13 2l-.06 4H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh All
          </button>
        </div>
      </div>

      {/* Probe Result */}
      {probeResult && (
        <div
          className={`alert ${probeResult.status === "ERROR" ? "alert-error" : "alert-success"}`}
          style={{ marginBottom: 16 }}
        >
          <span style={{ fontSize: 16 }}>{probeResult.status === "ERROR" ? "⚠️" : "✓"}</span>
          <div>
            <strong>{probeResult.name}</strong> · Health probe complete ·{" "}
            Status: <strong>{probeResult.status}</strong>
            {probeResult.latency > 0 && ` · Latency: ${probeResult.latency}ms`}
          </div>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Summary Stats */}
      {!loading && connectors.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            padding: "14px 16px",
            background: "var(--surface-white)",
            border: "1px solid var(--gray-200)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {[
            { label: "Total Connectors", value: connectors.length, color: "var(--navy-600)" },
            { label: "Healthy", value: healthy, color: "var(--green-600)" },
            { label: "Degraded", value: degraded, color: "var(--amber-600)" },
            { label: "Error / Offline", value: errored, color: "var(--red-600)" },
          ].map(({ label, value, color }, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                paddingRight: 20,
                borderRight: i < 3 ? "1px solid var(--gray-200)" : "none",
                flex: 1,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", marginLeft: "auto", gap: 8, paddingLeft: 8 }}>
            <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Protocols supported:</span>
            {["REST_JSON", "SOAP_XML", "DATABASE"].map((p) => (
              <ProtocolBadge key={p} protocol={p} />
            ))}
          </div>
        </div>
      )}

      {/* Connector Cards */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 14 }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Loading connector registry…</div>
        </div>
      ) : connectors.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔗</div>
            <div className="empty-state-title">No connectors registered</div>
            <div className="empty-state-text">Run the backend seeder to register demo connectors</div>
          </div>
        </div>
      ) : (
        <div className="grid-cols-3">
          {connectors.map((c) => (
            <ConnectorCard
              key={c.id}
              connector={c}
              onHealthCheck={() => handleHealthCheck(c.id, c.name)}
              probing={probingId === c.id}
              onDetails={() => setActiveModalConnector(c)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {activeModalConnector && (
        <ConnectorModal
          connector={activeModalConnector}
          onClose={() => setActiveModalConnector(null)}
          onProbe={() => handleHealthCheck(activeModalConnector.id, activeModalConnector.name)}
          probing={probingId === activeModalConnector.id}
        />
      )}
    </AppShell>
  );
}
