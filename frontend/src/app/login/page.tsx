"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AshokaEmblemLogo, GovBridgeLogo } from "@/components/GovLogos";

const DEMO_ACCOUNTS = [
  { email: "citizen@govbridge.demo", password: "citizen123", role: "Citizen Portal", icon: "👤", badge: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { email: "officer@govbridge.demo", password: "officer123", role: "Officer Portal", icon: "🛡️", badge: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { email: "admin@govbridge.demo", password: "admin123", role: "System Admin", icon: "⚙️", badge: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { email: "auditor@govbridge.demo", password: "auditor123", role: "Compliance Audit", icon: "⚖️", badge: "#d97706", bg: "#fffbeb", border: "#fde68a" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [activeTab, setActiveTab] = useState<"mobile" | "username" | "aadhaar">("mobile");
  const [provider, setProvider] = useState<"digilocker" | "janparichay" | "epramaan">("digilocker");

  const [mobileNumber, setMobileNumber] = useState("");
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaarId, setAadhaarId] = useState("");

  const [showPassword, setShowPassword] = useState(false);
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
      if (activeTab === "mobile" || activeTab === "aadhaar") {
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
      setError(axiosErr?.response?.data?.detail || "Sign in failed. Please check your credentials.");
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
        background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 16px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Top Header Bar ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <GovBridgeLogo height={32} darkBackground={false} />
        </Link>
        <Link
          href="/"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2563eb",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← Back to GovBridge
        </Link>
      </div>

      {/* ── Main Unified Meri Pehchaan Card ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #cbd5e1",
          overflow: "hidden",
        }}
      >
        {/* Tricolor Indian Flag Accent Bar */}
        <div style={{ display: "flex", width: "100%", height: 5 }}>
          <div style={{ flex: 1, background: "#f97316" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#16a34a" }} />
        </div>

        <div style={{ padding: "32px 32px 28px" }}>
          {/* 1. Header Emblem & Meri Pehchaan SSO Title */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <AshokaEmblemLogo height={44} darkBackground={false} />
              <div style={{ height: 36, width: 2, background: "#cbd5e1" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>
                  <span style={{ color: "#ea580c" }}>Meri</span>{" "}
                  <span style={{ color: "#16a34a" }}>Pehchaan</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>
                  SINGLE SIGN-ON SERVICE
                </div>
              </div>
            </div>

            {/* Sub-identity badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setProvider("digilocker")}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  border: "none",
                  background: provider === "digilocker" ? "#dbeafe" : "#f1f5f9",
                  color: provider === "digilocker" ? "#1d4ed8" : "#64748b",
                  cursor: "pointer",
                }}
              >
                DigiLocker
              </button>
              <button
                type="button"
                onClick={() => setProvider("janparichay")}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  border: "none",
                  background: provider === "janparichay" ? "#dcfce7" : "#f1f5f9",
                  color: provider === "janparichay" ? "#15803d" : "#64748b",
                  cursor: "pointer",
                }}
              >
                JAN PARICHAY
              </button>
              <button
                type="button"
                onClick={() => setProvider("epramaan")}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  border: "none",
                  background: provider === "epramaan" ? "#ffedd5" : "#f1f5f9",
                  color: provider === "epramaan" ? "#c2410c" : "#64748b",
                  cursor: "pointer",
                }}
              >
                e-Pramaan
              </button>
            </div>
          </div>

          {/* 2. Sub Title */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
              Sign In to your account via <span style={{ color: "#2563eb" }}>{provider === "digilocker" ? "DigiLocker" : provider === "janparichay" ? "Jan Parichay" : "e-Pramaan"}</span>
            </h2>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              National Public Services Interoperability Portal
            </div>
          </div>

          {/* 3. Navigation Tabs (Mobile, Username, Aadhaar) */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: 4, borderRadius: 10, marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setActiveTab("mobile")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                background: activeTab === "mobile" ? "#2563eb" : "transparent",
                color: activeTab === "mobile" ? "#ffffff" : "#64748b",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("username")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                background: activeTab === "username" ? "#2563eb" : "transparent",
                color: activeTab === "username" ? "#ffffff" : "#64748b",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Username
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("aadhaar")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                background: activeTab === "aadhaar" ? "#2563eb" : "transparent",
                color: activeTab === "aadhaar" ? "#ffffff" : "#64748b",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Aadhaar / PAN
            </button>
          </div>

          {/* 4. Login Form */}
          <form onSubmit={handleLogin}>
            {activeTab === "mobile" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Mobile Number *
                  </label>
                  <div style={{ display: "flex", border: "1.5px solid #cbd5e1", borderRadius: 8, overflow: "hidden" }}>
                    <span style={{ background: "#f8fafc", padding: "12px 14px", fontSize: 14, fontWeight: 800, color: "#475569", borderRight: "1px solid #cbd5e1" }}>
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      style={{ flex: 1, padding: "12px 14px", border: "none", fontSize: 14, outline: "none" }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                      6-Digit Security PIN *
                    </label>
                    <a href="#" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>
                      Forgot PIN?
                    </a>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 6-digit security PIN"
                      maxLength={6}
                      style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #cbd5e1", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "username" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Username or Official Email *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. citizen@govbridge.demo"
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #cbd5e1", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                      Password *
                    </label>
                    <a href="#" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>
                      Forgot password?
                    </a>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #cbd5e1", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "aadhaar" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Aadhaar / PAN / Driving License Number *
                  </label>
                  <input
                    type="text"
                    value={aadhaarId}
                    onChange={(e) => setAadhaarId(e.target.value)}
                    placeholder="Enter 12-digit Aadhaar or PAN"
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #cbd5e1", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Security PIN *
                  </label>
                  <input
                    type="password"
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #cbd5e1", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </>
            )}

            {/* Checkboxes */}
            <div style={{ marginTop: 14, marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={pinlessAuth}
                  onChange={(e) => setPinlessAuth(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span>PIN-less / OTP Biometric authentication</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span>I consent to <a href="/terms" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>terms of use</a>.</span>
              </label>
            </div>

            {error && (
              <div style={{ padding: 10, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#991b1b", fontSize: 12, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Big Green Sign In Button */}
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

          {/* New user? Sign up */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" }}>
            New user? <Link href="/login" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>Sign up for Meri Pehchaan</Link>
          </div>

          {/* 5. 1-Click Demo Presets Bar inside Card */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>⚡ Evaluator Demo Login Accounts:</span>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Click to autofill</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => autofillDemo(acc)}
                  style={{
                    padding: "8px 10px",
                    background: acc.bg,
                    border: `1px solid ${acc.border}`,
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: acc.badge, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{acc.icon}</span>
                    <span>{acc.role}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {acc.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ textAlign: "center", fontSize: 12, color: "#64748b", margin: "16px 0 8px" }}>
        DPDP Act 2023 Compliant • Powered by Digital India Corporation (DIC) &amp; MeitY
      </footer>
    </div>
  );
}
