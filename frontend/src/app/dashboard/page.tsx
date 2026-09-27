"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { InteroperabilityDemoModal } from "@/components/InteroperabilityDemoModal";
import { ConnectedSystemsTopology } from "@/components/ConnectedSystemsTopology";
import Link from "next/link";

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  accent,
  iconBg,
  sub,
  href,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent: string;
  iconBg: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="stat-card" style={{ ["--stat-accent" as string]: accent }}>
      <div className="stat-card-icon" style={{ background: iconBg }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-trend">{sub}</div>}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

/* ── Architecture Diagram ───────────────────────────────────── */
const ARCH_LAYERS = [
  { label: "Gov Systems", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", icon: "🏛" },
  { label: "Connectors", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd", icon: "🔗" },
  { label: "API Gateway", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", icon: "⚡" },
  { label: "Validation", color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc", icon: "✓" },
  { label: "Transform", color: "#2563eb", bg: "#eff6ff", border: "#93c5fd", icon: "⇌" },
  { label: "Identity", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd", icon: "◎" },
  { label: "Consent+RBAC", color: "#16a34a", bg: "#f0fdf4", border: "#86efac", icon: "🔐" },
  { label: "Workflow", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⚙" },
  { label: "Events", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", icon: "📡" },
  { label: "Audit+Monitor", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1", icon: "📊" },
];

function ArchitectureDiagram() {
  return (
    <div className="card section-gap">
      <div className="card-header">
        <div>
          <div className="card-title">GovBridge Interoperability Architecture</div>
          <div className="card-subtitle">
            Core data flow — Existing Gov Systems → Connectors → Gateway → Validation → Transform → Identity → Consent → Workflow → Events → Audit
          </div>
        </div>
        <span className="badge badge-info">
          <span className="badge-dot" />
          SIH26129
        </span>
      </div>
      <div className="card-body">
        {/* Horizontal flow with arrows */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {ARCH_LAYERS.map((layer, idx) => (
            <div key={layer.label} style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    background: layer.bg,
                    border: `1.5px solid ${layer.border}`,
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    color: layer.color,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    minWidth: 80,
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <span style={{ fontSize: 16 }}>{layer.icon}</span>
                  {layer.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--gray-400)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Layer {idx + 1}
                </div>
              </div>
              {idx < ARCH_LAYERS.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    padding: "0 6px",
                    marginBottom: 20,
                  }}
                >
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                    <path d="M0 6h14M9 1l6 5-6 5" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load dashboard statistics. Ensure the backend is running."))
      .finally(() => setLoading(false));

    // Check if opened via query parameter ?demo=1
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1" || params.get("demo") === "true") {
        setDemoStep(1);
        setDemoModalOpen(true);
      }
    }

    const handleOpenDemo = () => {
      setDemoStep(1);
      setDemoModalOpen(true);
    };

    window.addEventListener("open-govbridge-demo", handleOpenDemo);
    return () => window.removeEventListener("open-govbridge-demo", handleOpenDemo);
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isCitizen = (user?.role || "CITIZEN") === "CITIZEN";
  const isOfficer = user?.role === "DEPARTMENT_OFFICER";

  return (
    <AppShell
      title={isCitizen ? "Citizen e-Services Portal" : isOfficer ? "Department Review Portal" : "Dashboard"}
      subtitle={isCitizen ? "Official State e-Governance Services & Application Tracker" : "Government Interoperability Platform — Live System Overview"}
    >
      {/* ── Citizen Role Hero Banner ── */}
      {isCitizen ? (
        <div
          style={{
            padding: "24px 28px",
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #0284c7 100%)",
            borderRadius: "16px",
            color: "#ffffff",
            marginBottom: "24px",
            border: "1.5px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 10px 30px -8px rgba(30, 58, 138, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  background: "rgba(255,255,255,0.2)",
                  padding: "3px 10px",
                  borderRadius: 20,
                  color: "#e0f2fe",
                }}
              >
                Citizen Portal · Master ID: MAHA-CIT-10284
              </span>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 8, marginBottom: 4, color: "#ffffff" }}>
                Welcome, {user?.full_name || "Sunil Patil"}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: 620 }}>
                Access verified state e-governance services, apply for certificates and concession passes, and track cross-departmental application progress in real time.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/services"
                className="btn"
                style={{ background: "#ffffff", color: "#1e3a8a", fontWeight: 800, padding: "10px 20px" }}
              >
                Browse Services Catalogue →
              </Link>
              <Link
                href="/applications"
                className="btn"
                style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 18px" }}
              >
                My Applications
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ── SIH Hackathon Judge Demonstration Hero Banner (Admin & Officer) ── */
        <div
          style={{
            padding: "28px 32px",
            background: "linear-gradient(135deg, #071529 0%, #0c2044 50%, #0f2d5e 100%)",
            borderRadius: "16px",
            color: "#ffffff",
            marginBottom: "24px",
            border: "1.5px solid rgba(56, 189, 248, 0.25)",
            boxShadow: "0 12px 36px -10px rgba(7, 21, 41, 0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
        {/* Decorative background glow */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(0, 0, 0, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Top Pill / Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                background: "rgba(37, 99, 235, 0.3)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#38bdf8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
              Smart India Hackathon · SIH26129 Platform
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500,
              }}
            >
              Government Interoperability &amp; Service Orchestration Platform
            </span>
          </div>

          {/* EXACT Required SIH Headline */}
          <h1
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 900,
              lineHeight: 1.18,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: "0 0 12px 0",
            }}
          >
            One request.
            <br />
            <span style={{ color: "#38bdf8" }}>Multiple departments.</span>
            <br />
            One governed interoperability layer.
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.6,
              maxWidth: "760px",
              margin: "0 0 22px 0",
            }}
          >
            GovBridge connects fragmented government registries without replacing them — unifying modern REST/JSON,
            legacy SOAP/XML, and direct database adapters with DPDP citizen consent, 11-step cross-department orchestration,
            and cryptographic SHA-256 auditability.
          </p>

          {/* Prominent Action Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {/* PROMINENT RUN INTEROPERABILITY DEMO BUTTON */}
            <button
              id="run-demo-button"
              onClick={() => {
                setDemoStep(1);
                setDemoModalOpen(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 26px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #0284c7 100%)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                borderRadius: "10px",
                border: "1.5px solid rgba(255, 255, 255, 0.35)",
                boxShadow: "0 6px 24px rgba(37, 99, 235, 0.55), 0 0 0 1px rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "all 0.18s ease",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(37, 99, 235, 0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(37, 99, 235, 0.55)";
              }}
            >
              <span style={{ fontSize: 18 }}>🚀</span>
              <span>RUN INTEROPERABILITY DEMO</span>
              <span
                style={{
                  fontSize: "11px",
                  background: "rgba(255, 255, 255, 0.22)",
                  padding: "3px 8px",
                  borderRadius: "5px",
                  fontWeight: 800,
                }}
              >
                12 STAGES
              </span>
            </button>

            {/* Quick Link to Ready Demo Application APP-2026-1048 */}
            <Link
              href="/applications/APP-2026-1048"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 22px",
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                textDecoration: "none",
                backdropFilter: "blur(6px)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
              }}
            >
              <span>📋</span>
              <span>Ready Demo Application: <strong>APP-2026-1048</strong></span>
              <span
                style={{
                  fontSize: "10px",
                  background: "rgba(34, 197, 94, 0.25)",
                  color: "#4ade80",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  fontWeight: 800,
                  border: "1px solid rgba(34, 197, 94, 0.4)",
                }}
              >
                ● COMPLETED (DBT SANCTIONED)
              </span>
            </Link>

            {/* + New Application */}
            <Link
              href="/applications/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "13px 18px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "13px",
                fontWeight: 600,
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              + New Application
            </Link>
          </div>

          {/* Five Pillars Bar for SIH Judges */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            {[
              { num: "1", title: "Fragmented Systems", desc: "Siloed departmental registries unified" },
              { num: "2", title: "Connect Without Replacing", desc: "No database migration needed" },
              { num: "3", title: "Disparate Technologies", desc: "REST/JSON & SOAP/XML adapters" },
              { num: "4", title: "Coordinated Workflows", desc: "11-step cross-dept orchestration" },
              { num: "5", title: "Consent & Auditability", desc: "DPDP tokens & SHA-256 ledger" },
            ].map((p) => (
              <div
                key={p.num}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(56, 189, 248, 0.2)",
                    color: "#38bdf8",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {p.num}
                </span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>{p.title}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.55)" }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── Connected Systems Topology around GovBridge (Admin & Officer only) ── */}
      {!isCitizen && (
        <ConnectedSystemsTopology onOpenDemo={(step) => { setDemoStep(step); setDemoModalOpen(true); }} />
      )}

      {/* ── Pre-Seeded Demo Spotlight: APP-2026-1048 ── */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
          border: "1.5px solid #86efac",
          borderRadius: "14px",
          padding: "18px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "#dcfce7",
                color: "#15803d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              ✅
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#14532d" }}>
                  Pre-Configured SIH Demonstration Application: APP-2026-1048
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "#22c55e",
                    color: "#ffffff",
                  }}
                >
                  COMPLETED
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#166534", marginTop: 3 }}>
                Applicant: <strong>Sunil Patil</strong> (Master ID: <code style={{ fontWeight: 700 }}>MAHA-CIT-10284</code>) ·
                Benefit: <strong>Apprenticeship Stipend (₹8,000/mo DBT Approved)</strong> · 11/11 Cross-Registry Steps Verified
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => { setDemoStep(1); setDemoModalOpen(true); }}
              className="btn btn-sm btn-secondary"
              style={{ borderColor: "#86efac", color: "#15803d" }}
            >
              Run 12-Step Walkthrough
            </button>
            <Link
              href="/applications/APP-2026-1048"
              className="btn btn-sm btn-primary"
              style={{ background: "#16a34a", borderColor: "#16a34a" }}
            >
              Open Live Tracking View →
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 14 }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Loading platform statistics…</div>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : stats ? (
        <>
          {/* Stat Grid */}
          <div className="grid-cols-4 stagger-children" style={{ marginBottom: 24 }}>
            <StatCard
              label="Total Applications"
              value={stats.total_applications}
              icon="📋"
              accent="var(--navy-400)"
              iconBg="var(--navy-50)"
              sub={`${stats.pending_applications} pending review`}
              href="/applications"
            />
            <StatCard
              label="Approved"
              value={stats.approved_applications}
              icon="✅"
              accent="var(--green-500)"
              iconBg="var(--green-50)"
              sub="Successfully processed"
              href="/applications"
            />
            <StatCard
              label="Active Connectors"
              value={`${stats.active_connectors}/${stats.total_connectors}`}
              icon="🔗"
              accent="var(--violet-600)"
              iconBg="var(--violet-100)"
              sub="Government registries"
              href="/connectors"
            />
            <StatCard
              label="Active Workflows"
              value={stats.active_workflows}
              icon="⚙️"
              accent="var(--sky-500)"
              iconBg="var(--sky-100)"
              href="/workflows"
            />
            <StatCard
              label="Citizens Registered"
              value={stats.total_citizens}
              icon="👤"
              accent="var(--sky-600)"
              iconBg="var(--sky-100)"
            />
            <StatCard
              label="Events Today"
              value={stats.events_today}
              icon="📡"
              accent="var(--amber-600)"
              iconBg="var(--amber-50)"
              href="/monitoring/events"
            />
            <StatCard
              label="Pending Consents"
              value={stats.pending_consents}
              icon="🔐"
              accent="#db2777"
              iconBg="#fdf2f8"
              href="/consents"
            />
            <StatCard
              label="SLA Compliance"
              value="97.2%"
              icon="💚"
              accent="var(--green-500)"
              iconBg="var(--green-50)"
              sub="Last 30 days"
            />
          </div>

          {/* Two Column */}
          <div className="grid-cols-2">
            {/* Recent Applications */}
            <div className="card fade-in-up">
              <div className="card-header">
                <div>
                  <div className="card-title">Recent Applications</div>
                  <div className="card-subtitle">Latest citizen service requests across GovBridge</div>
                </div>
                <Link href="/applications" className="btn btn-sm btn-secondary">View All</Link>
              </div>
              {stats.recent_applications.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                  <div className="empty-state-title">No applications yet</div>
                  <div className="empty-state-text">Submit a new application to see it here</div>
                  <Link href="/applications/new" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
                    + New Application
                  </Link>
                </div>
              ) : (
                <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_applications.map((app) => (
                        <tr key={app.id} style={{ cursor: "pointer" }}>
                          <td>
                            <Link href={`/applications/${app.id}`}>
                              <span className="monospace" style={{ fontSize: 12, color: "var(--navy-500)", fontWeight: 600 }}>
                                {app.reference_number}
                              </span>
                            </Link>
                          </td>
                          <td style={{ maxWidth: 160 }}>
                            <span className="text-truncate" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--gray-800)" }}>
                              {app.title || "—"}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={app.status} />
                          </td>
                          <td style={{ fontSize: 12, color: "var(--gray-500)" }}>
                            {formatDate(app.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Connector Health */}
            <div className="card fade-in-up" style={{ animationDelay: "60ms" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Connector Health</div>
                  <div className="card-subtitle">Real-time registry status · REST &amp; SOAP adapters</div>
                </div>
                <Link href="/connectors" className="btn btn-sm btn-secondary">View All</Link>
              </div>
              {stats.connector_health.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🔗</div>
                  <div className="empty-state-title">No health data</div>
                  <div className="empty-state-text">Run a connector ping to see status</div>
                </div>
              ) : (
                <div>
                  {stats.connector_health.slice(0, 6).map((h) => {
                    const isHealthy = h.status === "HEALTHY";
                    const isDegraded = h.status === "DEGRADED";
                    const dotColor = isHealthy ? "var(--green-500)" : isDegraded ? "var(--amber-500)" : "var(--red-500)";
                    const latencyColor =
                      h.latency_ms == null ? "var(--gray-400)"
                        : h.latency_ms < 100 ? "var(--green-600)"
                        : h.latency_ms < 500 ? "var(--amber-600)"
                        : "var(--red-600)";
                    return (
                      <div
                        key={h.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "11px 20px",
                          borderBottom: "1px solid var(--gray-100)",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--navy-50)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        {/* Status dot */}
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: dotColor,
                            flexShrink: 0,
                            boxShadow: `0 0 0 3px ${dotColor}22`,
                          }}
                        />
                        {/* Connector ID */}
                        <span
                          className="monospace"
                          style={{
                            fontSize: 12,
                            color: "var(--gray-700)",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h.connector_id.slice(0, 20)}…
                        </span>
                        {/* Latency */}
                        {h.latency_ms != null && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: latencyColor, flexShrink: 0 }}>
                            {h.latency_ms}ms
                          </span>
                        )}
                        {/* Status badge */}
                        <StatusBadge status={h.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Architecture Diagram */}
          <ArchitectureDiagram />

          {/* Bottom Row: Key Features */}
          <div className="grid-cols-3 section-gap">
            {[
              {
                icon: "🔗",
                title: "Multi-Protocol Connectors",
                desc: "REST, SOAP/XML, Database — seamlessly bridging Education, Employment, Skill, Revenue, Health & Welfare registries",
                color: "var(--violet-600)",
                bg: "var(--violet-100)",
                link: "/connectors",
                linkLabel: "View Connectors",
              },
              {
                icon: "⚙️",
                title: "11-Step Workflow Engine",
                desc: "Cross-department orchestration for Unified Skill & Employment Benefit with parallel verification and retry logic",
                color: "var(--amber-700)",
                bg: "var(--amber-50)",
                link: "/workflows",
                linkLabel: "Active Workflows",
              },
              {
                icon: "🔐",
                title: "Cryptographic Audit Trail",
                desc: "SHA-256 tamper-proof audit logs with RBAC enforcement, consent lifecycle management, and integrity verification",
                color: "var(--navy-600)",
                bg: "var(--navy-50)",
                link: "/audit",
                linkLabel: "Audit Explorer",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card"
                style={{ transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <div className="card-body">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: f.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      marginBottom: 14,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 14 }}>{f.desc}</div>
                  <Link href={f.link} className="btn btn-sm btn-secondary">
                    {f.linkLabel} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* ── 12-Stage Interoperability Demo Modal ── */}
      <InteroperabilityDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialStep={demoStep}
      />
    </AppShell>
  );
}
