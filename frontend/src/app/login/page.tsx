"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useDepartmentStore, DEPARTMENTS, type DepartmentCode } from "@/store/departmentStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActiveDepartment = useDepartmentStore((s) => s.setActiveDepartment);

  // SSO Service Provider Tabs: DigiLocker | JAN PARICHAY | e-Pramaan
  const [ssoProvider, setSsoProvider] = useState<"DigiLocker" | "JAN PARICHAY" | "e-Pramaan">("DigiLocker");

  // Auth Method Switcher: Mobile | Username | Aadhaar / PAN
  const [authMethod, setAuthMethod] = useState<"Mobile" | "Username" | "Aadhaar / PAN">("Username");

  // Form Fields
  const [username, setUsername] = useState("officer@govbridge.demo");
  const [password, setPassword] = useState("officer123");
  const [showPassword, setShowPassword] = useState(false);
  const [pinlessAuth, setPinlessAuth] = useState(false);
  const [consentTerms, setConsentTerms] = useState(true);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentTerms) {
      setError("You must consent to terms of use to proceed.");
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Sign in failed. Please check your credentials.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate realistic authenticated session with GovBridge stores
      const lowerUser = username.toLowerCase();

      if (lowerUser.includes("citizen") || lowerUser.includes("sunil")) {
        setActiveDepartment("ALL");
        const citizenUser = {
          id: "cit-101",
          email: username,
          role: "CITIZEN" as const,
          full_name: "Sunil Patil",
          is_active: true,
          department_id: null,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setAuth(citizenUser, "token-citizen");
      } else if (lowerUser.includes("admin")) {
        setActiveDepartment("ALL");
        const adminUser = {
          id: "adm-101",
          email: username,
          role: "INTEGRATION_ADMIN" as const,
          full_name: "State Interoperability Admin",
          is_active: true,
          department_id: null,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setAuth(adminUser, "token-admin");
      } else if (lowerUser.includes("auditor")) {
        setActiveDepartment("ALL");
        const auditorUser = {
          id: "aud-101",
          email: username,
          role: "AUDITOR" as const,
          full_name: "DPDP Compliance Auditor",
          is_active: true,
          department_id: null,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setAuth(auditorUser, "token-auditor");
      } else {
        // Department Officer (Default: MSRTC, UIDAI, CBDT, etc.)
        let deptCode: DepartmentCode = "MSRTC";
        if (lowerUser.includes("uidai")) deptCode = "UIDAI";
        else if (lowerUser.includes("cbdt") || lowerUser.includes("tax")) deptCode = "CBDT";
        else if (lowerUser.includes("eci") || lowerUser.includes("voter")) deptCode = "ECI";
        else if (lowerUser.includes("edu")) deptCode = "EDU";
        else if (lowerUser.includes("skill")) deptCode = "SKILL";
        else if (lowerUser.includes("ulb") || lowerUser.includes("prop")) deptCode = "ULB";

        setActiveDepartment(deptCode);
        const deptInfo = DEPARTMENTS[deptCode];

        const officerUser = {
          id: `off-${deptCode.toLowerCase()}-01`,
          email: username,
          role: "DEPARTMENT_OFFICER" as const,
          full_name: `${deptInfo?.shortName || "MSRTC"} Verification Officer`,
          is_active: true,
          department_id: deptCode,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setAuth(officerUser, `token-${deptCode.toLowerCase()}`);
      }

      router.replace("/dashboard");
    } catch {
      setError("Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const autofillAccount = (
    email: string,
    dept: DepartmentCode = "MSRTC"
  ) => {
    setUsername(email);
    setPassword("officer123");
    setError("");
    setActiveDepartment(dept);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f0f4f9 0%, #e8edf3 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "28px 16px 40px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Top Bar (GovBridge Logo + Back Link) ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          padding: "0 4px",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          <img
            src="/govbridge_logo_clean.png"
            alt="GovBridge - Public Services Interoperability"
            style={{ height: 38, width: "auto", display: "block" }}
          />
        </Link>
        <Link
          href="/"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1d4ed8",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>&larr;</span> Back to GovBridge
        </Link>
      </div>

      {/* ── Main Meri Pehchaan Card ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 10px 35px -5px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Tricolor Header Accent Top Stripes */}
        <div
          style={{
            height: 4,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "44%",
              height: 4,
              background: "#ea580c",
              borderTopLeftRadius: 24,
            }}
          />
          <div
            style={{
              width: "44%",
              height: 4,
              background: "#16a34a",
              borderTopRightRadius: 24,
            }}
          />
        </div>

        {/* Card Body */}
        <div style={{ padding: "30px 36px 28px" }}>
          {/* Header Row: Ashoka Emblem + Government of India | Meri Pehchaan */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Left: Ashoka Emblem & Government of India */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="/ashoka_emblem_official_dark.png"
                alt="Emblem of India"
                style={{
                  height: 46,
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#111827",
                    lineHeight: 1.15,
                  }}
                >
                  भारत सरकार
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#374151",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  GOVERNMENT OF INDIA
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div
              style={{
                width: 1.5,
                height: 38,
                background: "#d1d5db",
              }}
            />

            {/* Right: Meri Pehchaan Logo */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                }}
              >
                <span style={{ color: "#ea580c" }}>Meri </span>
                <span style={{ color: "#16a34a" }}>Pehchaan</span>
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "#1f2937",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                SINGLE SIGN-ON SERVICE
              </span>
            </div>
          </div>

          {/* SSO Service Provider Tabs: DigiLocker | JAN PARICHAY | e-Pramaan */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {(["DigiLocker", "JAN PARICHAY", "e-Pramaan"] as const).map((provider) => {
              const active = ssoProvider === provider;
              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setSsoProvider(provider)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    background: active ? "#e0edff" : "#f1f5f9",
                    color: active ? "#1d4ed8" : "#64748b",
                    transition: "all 0.15s ease",
                  }}
                >
                  {provider}
                </button>
              );
            })}
          </div>

          {/* Sign In Header */}
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 4px",
              }}
            >
              Sign In to your account via{" "}
              <span style={{ color: "#1d4ed8", fontWeight: 800 }}>{ssoProvider}</span>
            </h2>
            <p
              style={{
                fontSize: 12.5,
                color: "#6b7280",
                margin: 0,
              }}
            >
              National Public Services Interoperability Portal
            </p>
          </div>

          {/* Auth Method Switcher: Mobile | Username | Aadhaar / PAN */}
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: 10,
              padding: 4,
              display: "flex",
              marginBottom: 20,
            }}
          >
            {(["Mobile", "Username", "Aadhaar / PAN"] as const).map((method) => {
              const active = authMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setAuthMethod(method);
                    if (method === "Mobile") setUsername("9820123456");
                    else if (method === "Aadhaar / PAN") setUsername("2341 5678 9012");
                    else setUsername("officer@govbridge.demo");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: active ? 700 : 600,
                    borderRadius: active ? 8 : 0,
                    border: "none",
                    background: active ? "#2563eb" : "transparent",
                    color: active ? "#ffffff" : "#4b5563",
                    cursor: "pointer",
                    boxShadow: active ? "0 2px 6px rgba(37, 99, 235, 0.25)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {method}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Username / Identifier Input */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                {authMethod === "Mobile"
                  ? "Mobile Number *"
                  : authMethod === "Aadhaar / PAN"
                  ? "Aadhaar or PAN Number *"
                  : "Username or Official Email *"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  authMethod === "Mobile"
                    ? "Enter 10-digit mobile number..."
                    : authMethod === "Aadhaar / PAN"
                    ? "Enter 12-digit Aadhaar / 10-digit PAN..."
                    : "officer@govbridge.demo"
                }
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  fontSize: 14,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#111827",
                  background: "#ffffff",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link has been dispatched to official email.")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1d4ed8",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 14px",
                    fontSize: 14,
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#111827",
                    background: "#ffffff",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: 4,
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? (
                    // Eye slash icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox 1: PIN-less / OTP Biometric authentication */}
            <div style={{ marginBottom: 8 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "#64748b",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={pinlessAuth}
                  onChange={(e) => setPinlessAuth(e.target.checked)}
                  style={{
                    width: 15,
                    height: 15,
                    accentColor: "#2563eb",
                    cursor: "pointer",
                  }}
                />
                <span>PIN-less / OTP Biometric authentication</span>
              </label>
            </div>

            {/* Checkbox 2: Terms of Use Consent */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "#374151",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  style={{
                    width: 15,
                    height: 15,
                    accentColor: "#2563eb",
                    cursor: "pointer",
                  }}
                />
                <span>
                  I consent to{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}
                  >
                    terms of use.
                  </Link>
                </span>
              </label>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  color: "#b91c1c",
                  fontSize: 12.5,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Big Green Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                background: loading ? "#15803d" : "#16a34a",
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)",
                transition: "background 0.15s ease",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* New User Sign Up */}
          <div
            style={{
              textAlign: "center",
              fontSize: 12.5,
              color: "#4b5563",
              margin: "18px 0 16px",
            }}
          >
            New user?{" "}
            <Link
              href="/accessibility"
              style={{
                color: "#1d4ed8",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign up for Meri Pehchaan
            </Link>
          </div>

          {/* ── Evaluator Demo Login Accounts ── */}
          <div
            style={{
              borderTop: "1px solid #eef2f6",
              paddingTop: 14,
              marginTop: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>⚡</span> Evaluator Demo Login Accounts:
              </span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Click to autofill</span>
            </div>

            {/* Quick Autofill Buttons Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => autofillAccount("officer.msrtc@govbridge.demo", "MSRTC")}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: username.includes("msrtc") ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                  background: username.includes("msrtc") ? "#f0fdf4" : "#f8fafc",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>🚌 Bus Pass Officer (MSRTC)</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>officer.msrtc@govbridge.demo</div>
              </button>

              <button
                type="button"
                onClick={() => autofillAccount("uidai.officer@govbridge.demo", "UIDAI")}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: username.includes("uidai") ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                  background: username.includes("uidai") ? "#f0fdf4" : "#f8fafc",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>🆔 UIDAI E-KYC Officer</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>uidai.officer@govbridge.demo</div>
              </button>

              <button
                type="button"
                onClick={() => autofillAccount("cbdt.officer@govbridge.demo", "CBDT")}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: username.includes("cbdt") ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                  background: username.includes("cbdt") ? "#f0fdf4" : "#f8fafc",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>💳 Income Tax (CBDT)</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>cbdt.officer@govbridge.demo</div>
              </button>

              <button
                type="button"
                onClick={() => autofillAccount("citizen@govbridge.demo", "ALL")}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: username.includes("citizen") ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                  background: username.includes("citizen") ? "#f0fdf4" : "#f8fafc",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>👤 Citizen: Sunil Patil</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>citizen@govbridge.demo</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
