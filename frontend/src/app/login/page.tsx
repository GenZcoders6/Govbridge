"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const DEMO_ACCOUNTS = [
  { email: "citizen@govbridge.demo", password: "citizen123", role: "Citizen", roleKey: "citizen" },
  { email: "officer@govbridge.demo", password: "officer123", role: "Officer", roleKey: "officer" },
  { email: "admin@govbridge.demo", password: "admin123", role: "Admin", roleKey: "admin" },
  { email: "auditor@govbridge.demo", password: "auditor123", role: "Auditor", roleKey: "auditor" },
];

const FEATURES = [
  {
    icon: "🔗",
    title: "Reusable Connector Adapters",
    desc: "REST, SOAP, DB — all government registries bridged via a unified abstraction layer",
  },
  {
    icon: "⚙️",
    title: "Workflow Orchestration Engine",
    desc: "11-step parallel verification across 6 government departments",
  },
  {
    icon: "🔐",
    title: "Identity Mapping + Consent",
    desc: "Master Citizen ID with cryptographic audit trails and RBAC enforcement",
  },
  {
    icon: "📊",
    title: "Real-Time Monitoring",
    desc: "Live event bus, queue management, and SLA compliance tracking",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.user, res.data.access_token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="login-page">
      {/* Left Brand Panel */}
      <div className="login-brand-panel">
        <div>
          {/* Logo */}
          <div className="login-logo-mark">GB</div>

          {/* Brand */}
          <h1 className="login-brand-title">GovBridge</h1>
          <p className="login-brand-subtitle">
            The secure interoperability layer that connects government digital platforms
            — without replacing them.
          </p>

          {/* Feature list */}
          <div className="login-brand-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="login-brand-feature">
                <div className="login-brand-feature-icon">{f.icon}</div>
                <div>
                  <div className="login-brand-feature-title">{f.title}</div>
                  <div className="login-brand-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* SIH Badge */}
          <div className="login-sih-badge">
            <div className="login-sih-badge-box">
              <div className="login-sih-badge-title">Smart India Hackathon 2026</div>
              <div className="login-sih-badge-sub">Problem ID: SIH26129 · System Integration & Interoperability</div>
            </div>
          </div>

          {/* Architecture layers */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {[
              "Existing Gov Systems",
              "→",
              "Connectors",
              "→",
              "API Gateway",
              "→",
              "Schema Transform",
              "→",
              "Identity Mapping",
              "→",
              "Consent + RBAC",
              "→",
              "Workflow Engine",
              "→",
              "Audit + Monitor",
            ].map((item, i) =>
              item === "→" ? (
                <span key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>→</span>
              ) : (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.55)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "3px 9px",
                    borderRadius: 5,
                    letterSpacing: "0.02em",
                  }}
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        {/* Form logo */}
        <div className="login-form-logo">
          <div className="login-form-logo-mark">GB</div>
          <span className="login-form-logo-name">GovBridge</span>
        </div>

        <h2 className="login-form-title">Sign in</h2>
        <p className="login-form-subtitle">
          Access the Government Interoperability Platform
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@govbridge.demo"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M8 2L2 14h12L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="12" r="0.75" fill="currentColor"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "11px", fontSize: 14, marginTop: 4, borderRadius: "var(--radius-lg)" }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign In to GovBridge
              </>
            )}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="login-demo-section">
          <div className="login-demo-label">⚡ Demo Accounts — click to autofill</div>
          {DEMO_ACCOUNTS.map((acc) => (
            <div
              key={acc.email}
              className="demo-account-btn"
              onClick={() => quickLogin(acc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && quickLogin(acc)}
            >
              <div>
                <div className="demo-account-email">{acc.email}</div>
                <div style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 1 }}>{acc.password}</div>
              </div>
              <span className={`demo-role-pill demo-role-${acc.roleKey}`}>{acc.role}</span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--gray-100)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--green-500)",
              flexShrink: 0,
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--gray-400)" }}>
            All systems operational · Secure demo environment · Data is ephemeral
          </span>
        </div>
      </div>
    </div>
  );
}
