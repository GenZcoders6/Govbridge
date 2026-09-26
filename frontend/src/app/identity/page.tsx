"use client";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { identityApi, type MasterIdentity, type IdentityMapping } from "@/lib/api";

const SYSTEM_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  education:  { icon: "🎓", color: "var(--violet-600)", bg: "var(--violet-100)", label: "Education Registry" },
  employment: { icon: "💼", color: "var(--green-700)",  bg: "var(--green-50)",   label: "Employment Registry" },
  skill:      { icon: "⚡", color: "var(--amber-700)",  bg: "var(--amber-50)",   label: "NSDC Skill Registry" },
  revenue:    { icon: "₹",  color: "#be185d",            bg: "#fdf2f8",           label: "Revenue Authority" },
  welfare:    { icon: "🛡", color: "var(--navy-600)",   bg: "var(--navy-50)",    label: "Welfare Department" },
};

const DEMO_IDS = ["MAHA-CIT-10284", "MAHA-CIT-10001", "DL-CIT-20039"];

export default function IdentityPage() {
  const [masterId, setMasterId] = useState("MAHA-CIT-10284");
  const [inputId, setInputId] = useState("MAHA-CIT-10284");
  const [identity, setIdentity] = useState<MasterIdentity | null>(null);
  const [mappings, setMappings] = useState<IdentityMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIdentityData = useCallback(async (targetId: string) => {
    setLoading(true);
    setError("");
    setIdentity(null);
    setMappings([]);
    try {
      const [idRes, mapRes] = await Promise.all([
        identityApi.get(targetId),
        identityApi.getMappings(targetId),
      ]);
      setIdentity(idRes.data);
      setMappings(mapRes.data);
    } catch {
      setError(`No identity record found for '${targetId}'. Try MAHA-CIT-10284 (demo account).`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadIdentityData(masterId); }, [loadIdentityData, masterId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputId.trim()) {
      setMasterId(inputId.trim());
    }
  };

  return (
    <AppShell title="Master Identity" subtitle="Cross-Department Identity Resolution & Federation">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Master Identity Registry</h1>
          <p className="page-header-subtitle">
            Federated citizen identity — single truth mapped across all government department registries
          </p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            className="form-input monospace"
            style={{ width: 220, fontSize: 13 }}
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="MAHA-CIT-10284"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Resolve
          </button>
        </form>
      </div>

      {/* Demo ID quick selects */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600 }}>Demo IDs:</span>
        {DEMO_IDS.map((id) => (
          <button
            key={id}
            className="btn btn-sm btn-secondary monospace"
            style={{ fontSize: 12, padding: "4px 10px" }}
            onClick={() => { setInputId(id); setMasterId(id); }}
          >
            {id}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 14 }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Resolving identity…</div>
        </div>
      ) : identity ? (
        <>
          {/* Master Profile Card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div
              style={{
                background: "linear-gradient(135deg, var(--navy-900), var(--navy-700))",
                padding: "24px 28px",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                display: "flex",
                alignItems: "center",
                gap: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background decoration */}
              <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(37,99,235,0.15)" }} />

              {/* Avatar */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  color: "#fff",
                  fontWeight: 800,
                  flexShrink: 0,
                  border: "3px solid rgba(255,255,255,0.2)",
                  zIndex: 1,
                }}
              >
                {identity.full_name?.[0] || "?"}
              </div>

              {/* Info */}
              <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                  {identity.full_name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span
                    className="monospace"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#93c5fd",
                      background: "rgba(37,99,235,0.2)",
                      border: "1px solid rgba(96,165,250,0.3)",
                      padding: "2px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {identity.master_citizen_id}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#4ade80",
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    ✓ Verified
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 24, zIndex: 1 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{mappings.length}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Registries</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
                    {Math.round((identity.confidence_score ?? 0.97) * 100)}%
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confidence</div>
                </div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                {[
                  { label: "Masked ID", value: identity.masked_id || "MAHA-CIT-*****", mono: true },
                  { label: "Gender", value: identity.gender || "Male" },
                  { label: "Contact", value: identity.masked_phone || "+91 ******284", mono: true },
                  { label: "Email", value: identity.masked_email || "s***@gov.in", mono: true },
                  { label: "District", value: identity.district || "Pune" },
                  { label: "State", value: identity.state || "Maharashtra" },
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
            </div>
          </div>

          {/* Mappings Grid */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Connected Department Identifiers</div>
                <div className="card-subtitle">
                  Cross-registry identity resolution — {mappings.length} department systems linked
                </div>
              </div>
              <span className="badge badge-success"><span className="badge-dot" />{mappings.length} Active</span>
            </div>

            {mappings.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 36, marginBottom: 8 }}>◎</div>
                <div className="empty-state-title">No registry mappings found</div>
                <div className="empty-state-text">Run the backend seeder to add identity mappings</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0 }}>
                {mappings.map((m, i) => {
                  const sys = SYSTEM_CONFIG[m.source_system?.toLowerCase()] || {
                    icon: "🏛",
                    color: "var(--gray-600)",
                    bg: "var(--gray-100)",
                    label: `${m.source_system} Registry`,
                  };
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--gray-100)",
                        borderRight: i % 2 === 0 ? "1px solid var(--gray-100)" : "none",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--navy-50)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: sys.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {sys.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {sys.label}
                        </div>
                        <div
                          className="monospace"
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: sys.color,
                            marginTop: 3,
                          }}
                        >
                          {m.source_id}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                          <span className="tag" style={{ fontSize: 10 }}>
                            {m.source_schema || "standard_v1"}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--green-700)",
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-500)", display: "inline-block" }} />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
