"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AshokaEmblemLogo } from "@/components/GovLogos";

const DEMO_ACCOUNTS = [
  { email: "citizen@govbridge.demo", password: "citizen123", role: "Citizen", roleKey: "citizen" },
  { email: "officer@govbridge.demo", password: "officer123", role: "Officer", roleKey: "officer" },
  { email: "admin@govbridge.demo", password: "admin123", role: "Admin", roleKey: "admin" },
  { email: "auditor@govbridge.demo", password: "auditor123", role: "Auditor", roleKey: "auditor" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [activeTab, setActiveTab] = useState<"mobile" | "username" | "other">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pinlessAuth, setPinlessAuth] = useState(false);
  const [consentTerms, setConsentTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentTerms) {
      setError("You must accept the terms of use consent to proceed.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (activeTab === "mobile" || activeTab === "other") {
        const res = await authApi.login("citizen@govbridge.demo", "citizen123");
        setAuth(res.data.user, res.data.access_token);
      } else {
        const targetEmail = username.includes("@") ? username : `${username}@govbridge.demo`;
        const res = await authApi.login(targetEmail, password || "citizen123");
        setAuth(res.data.user, res.data.access_token);
      }
      router.replace("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setActiveTab("username");
    setUsername(acc.email);
    setPassword(acc.password);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9", // Off-white grayish light background matching screenshot
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 16px",
      }}
    >
      {/* Top Header Back Navigation */}
      <div style={{ width: "100%", maxWidth: 480, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}>
          ← Back to GovBridge Portal
        </Link>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
          DPDP Act 2023 Compliant
        </span>
      </div>

      {/* ── 1. Top Centered Meri Pehchaan SSO Header Logo ── */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          {/* Official Ashoka Emblem Badge */}
          <AshokaEmblemLogo height={44} darkBackground={false} />
          <div style={{ textAlign: "left", borderLeft: "2px solid #cbd5e1", paddingLeft: 12 }}>
            <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
              <span style={{ color: "#ea580c" }}>Meri</span>{" "}
              <span style={{ color: "#16a34a" }}>Pehchaan</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
              SINGLE SIGN-ON SERVICE
            </div>
          </div>
        </div>

        {/* Sub Identity Logos (DigiLocker, e-Pramaan, JAN PARICHAY) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 11, fontWeight: 800, color: "#475569", marginTop: 4 }}>
          <span style={{ color: "#2563eb", background: "#dbeafe", padding: "2px 8px", borderRadius: 4 }}>DigiLocker</span>
          <span style={{ color: "#c2410c", background: "#ffedd5", padding: "2px 8px", borderRadius: 4 }}>e-Pramaan</span>
          <span style={{ color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: 4 }}>JAN PARICHAY</span>
        </div>
      </div>

      {/* ── 2. White Card Container (exact screenshot matching layout) ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0,0,0,0.04)",
          borderBottom: "4px solid #6366f1", // Purple/blue accent line bottom border matching screenshot
          padding: "36px 36px 28px",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 24 }}>
          Sign In to your account via <span style={{ color: "#2563eb" }}>DigiLocker</span>
        </h2>

        {/* Navigation Tabs (Mobile, Username, Other ID) */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => setActiveTab("mobile")}
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              background: activeTab === "mobile" ? "#2563eb" : "transparent",
              color: activeTab === "mobile" ? "#ffffff" : "#64748b",
              cursor: "pointer",
            }}
          >
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("username")}
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              background: activeTab === "username" ? "#2563eb" : "transparent",
              color: activeTab === "username" ? "#ffffff" : "#64748b",
              cursor: "pointer",
            }}
          >
            Username
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("other")}
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              background: activeTab === "other" ? "#2563eb" : "transparent",
              color: activeTab === "other" ? "#ffffff" : "#64748b",
              cursor: "pointer",
            }}
          >
            Other ID
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {activeTab === "mobile" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Mobile*"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN*"
                  maxLength={6}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
            </>
          )}

          {activeTab === "username" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or Email*"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password*"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
            </>
          )}

          {activeTab === "other" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Aadhaar Number / PAN / Driving License*"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <input
                  type="password"
                  placeholder="PIN*"
                  maxLength={6}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
            </>
          )}

          {/* Right aligned Forgot security PIN link */}
          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <a href="#" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
              Forgot security PIN?
            </a>
          </div>

          {/* Checkbox 1: PIN less authentication */}
          <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              id="pinlessAuth"
              type="checkbox"
              checked={pinlessAuth}
              onChange={(e) => setPinlessAuth(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="pinlessAuth" style={{ fontSize: 13, color: "#475569", cursor: "pointer" }}>
              PIN less authentication
            </label>
          </div>

          {/* Checkbox 2: Consent to terms of use */}
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              id="consentTerms"
              type="checkbox"
              checked={consentTerms}
              onChange={(e) => setConsentTerms(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="consentTerms" style={{ fontSize: 13, color: "#475569", cursor: "pointer" }}>
              I consent to <a href="/terms" style={{ color: "#2563eb", textDecoration: "none" }}>terms of use</a>.
            </label>
          </div>

          {error && (
            <div style={{ padding: 10, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Big Green Sign In Button (`#16a34a` / `#22c55e`) matching screenshot */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Bottom Link: New user? Sign up */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
          New user? <Link href="/login" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>Sign up</Link>
        </div>
      </div>

      {/* ── 3. Preserved Quick Demo Accounts Presets Box ── */}
      <div style={{ width: "100%", maxWidth: 480, marginTop: 24, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#16a34a", marginBottom: 10 }}>
          ⚡ ONE-CLICK DEMO LOGIN PRESETS:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => autofillDemo(acc)}
              style={{
                padding: "8px 10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "#1e293b" }}>{acc.role}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{acc.email}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
