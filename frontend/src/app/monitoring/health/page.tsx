"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, ProtocolBadge } from "@/components/StatusBadge";
import { connectorsApi, type Connector, type ConnectorHealth } from "@/lib/api";
import { api } from "@/lib/api";

interface SystemHealth {
  status: string;
  service: string;
  version: string;
  components: { database: string; redis: string };
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [healthHistory, setHealthHistory] = useState<Record<string, ConnectorHealth[]>>({});
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, connRes] = await Promise.all([
        api.get<SystemHealth>("/health"),
        connectorsApi.list(),
      ]);
      setHealth(healthRes.data);
      setConnectors(connRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const pingAll = async () => {
    for (const c of connectors) {
      setPinging(c.id);
      try {
        const res = await connectorsApi.ping(c.id);
        setHealthHistory((prev) => ({
          ...prev,
          [c.id]: [res.data, ...(prev[c.id] || [])].slice(0, 5),
        }));
      } catch { }
    }
    setPinging(null);
    loadData();
  };

  return (
    <AppShell
      title="System Health"
      subtitle="Live health status of all GovBridge components"
      requiredRoles={["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"]}
    >
      <div className="page-header">
        <div>
          <h1 className="page-header-title">System Health</h1>
          <p className="page-header-subtitle">Real-time monitoring across all connected systems</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={loadData}>↻ Refresh</button>
          <button className="btn btn-primary" onClick={pingAll} disabled={!!pinging}>
            {pinging ? "Pinging All…" : "Ping All Connectors"}
          </button>
        </div>
      </div>

      {/* Backend Health */}
      {health && (
        <div className="grid-cols-3" style={{ marginBottom: 24 }}>
          {[
            { label: "API Gateway", status: health.status === "healthy" ? "ACTIVE" : "DEGRADED", detail: `v${health.version}` },
            { label: "PostgreSQL", status: health.components.database === "ok" ? "ACTIVE" : "ERROR", detail: "Primary database" },
            { label: "Redis", status: health.components.redis === "ok" ? "ACTIVE" : "ERROR", detail: "Cache & queue" },
          ].map(({ label, status, detail }) => (
            <div key={label} className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{detail}</div>
                </div>
                <StatusBadge status={status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connector Health */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Connector Status</div>
          <div className="card-subtitle">6 mock government system connectors</div>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Connector</th>
                  <th>Protocol</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Mock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{c.code}</div>
                    </td>
                    <td><ProtocolBadge protocol={c.protocol} /></td>
                    <td style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>
                      {c.base_url || "—"}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.is_mock && (
                        <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c", fontSize: 10 }}>MOCK</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={async () => {
                          setPinging(c.id);
                          try {
                            const res = await connectorsApi.ping(c.id);
                            setHealthHistory((prev) => ({
                              ...prev,
                              [c.id]: [res.data, ...(prev[c.id] || [])].slice(0, 5),
                            }));
                            await loadData();
                          } finally { setPinging(null); }
                        }}
                        disabled={pinging === c.id}
                      >
                        {pinging === c.id ? "…" : "Ping"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
