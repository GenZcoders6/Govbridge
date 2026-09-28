"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useDepartmentStore, DEPARTMENTS, type DepartmentCode } from "@/store/departmentStore";
import { AshokaEmblemLogo, GovBridgeLogo } from "@/components/GovLogos";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActiveDepartment = useDepartmentStore((s) => s.setActiveDepartment);

  const [portalType, setPortalType] = useState<"CITIZEN" | "DEPARTMENT_OFFICER" | "INTEGRATION_ADMIN" | "AUDITOR">("DEPARTMENT_OFFICER");
  const [selectedDept, setSelectedDept] = useState<DepartmentCode>("MSRTC");

  const [username, setUsername] = useState("officer.msrtc@govbridge.demo");
  const [password, setPassword] = useState("officer123");
  const [showPassword, setShowPassword] = useState(false);
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
      if (portalType === "DEPARTMENT_OFFICER") {
        setActiveDepartment(selectedDept);
        const deptInfo = DEPARTMENTS[selectedDept];

        // Create authenticated officer user payload for the selected department
        const officerUser = {
          id: `off-${selectedDept.toLowerCase()}-01`,
          email: `${selectedDept.toLowerCase()}.officer@govbridge.demo`,
          role: "DEPARTMENT_OFFICER" as const,
          full_name: `${deptInfo.shortName} Verification Officer`,
          is_active: true,
          department_id: selectedDept,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        setAuth(officerUser, `token-${selectedDept}`);
      } else if (portalType === "CITIZEN") {
        setActiveDepartment("ALL");
        const citizenUser = {
          id: "cit-101",
          email: "citizen@govbridge.demo",
          role: "CITIZEN" as const,
          full_name: "Sunil Patil",
          is_active: true,
          department_id: null,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setAuth(citizenUser, "token-citizen");
      } else if (portalType === "INTEGRATION_ADMIN") {
        setActiveDepartment("ALL");
        const adminUser = {
          id: "adm-101",
          email: "admin@govbridge.demo",
          role: "INTEGRATION_ADMIN" as const,
          full_name: "State Interoperability Admin",
          is_active: true,
          department_id: null,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setAuth(adminUser, "token-admin");
      } else {
        setActiveDepartment("ALL");
        const auditorUser = {
          id: "aud-101",
          email: "auditor@govbridge.demo",
          role: "AUDITOR" as const,
          full_name: "DPDP Compliance Auditor",
          is_active: true,
          department_id: null,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setAuth(auditorUser, "token-auditor");
      }

      router.replace("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Sign in failed. Please check your official credentials.");
    } finally {
      setLoading(false);
    }
  };

  const autofillOfficer = (code: DepartmentCode) => {
    setPortalType("DEPARTMENT_OFFICER");
    setSelectedDept(code);
    const deptInfo = DEPARTMENTS[code];
    setUsername(`${code.toLowerCase()}.officer@govbridge.demo`);
    setPassword("officer123");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f4f6f8 0%, #e2e8f0 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
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
          maxWidth: 540,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#003366" }}>GovBridge</div>
          <div style={{ fontSize: 10, color: "#555555" }}>Government Interoperability Network</div>
        </Link>
        <Link
          href="/"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#003366",
            textDecoration: "none",
          }}
        >
          &larr; Back to Portal Home
        </Link>
      </div>

      {/* ── Main Government Login Card ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          background: "#ffffff",
          borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "1px solid #cccccc",
          overflow: "hidden",
        }}
      >
        {/* Top Header Bar */}
        <div style={{ background: "#003366", color: "#ffffff", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 24 }}>🏛️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Government of Maharashtra
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              GovBridge Official e-Governance Login Portal
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px 20px" }}>
          {/* Portal Type Selector Tabs */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#003366", marginBottom: 6 }}>
            Select Login Portal:
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => {
                setPortalType("DEPARTMENT_OFFICER");
                setUsername("officer.msrtc@govbridge.demo");
              }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: 12,
                fontWeight: portalType === "DEPARTMENT_OFFICER" ? 800 : 600,
                background: portalType === "DEPARTMENT_OFFICER" ? "#003366" : "#f0f4f8",
                color: portalType === "DEPARTMENT_OFFICER" ? "#ffffff" : "#333333",
                border: "1px solid #cccccc",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              Department Officer
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType("CITIZEN");
                setUsername("citizen@govbridge.demo");
              }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: 12,
                fontWeight: portalType === "CITIZEN" ? 800 : 600,
                background: portalType === "CITIZEN" ? "#003366" : "#f0f4f8",
                color: portalType === "CITIZEN" ? "#ffffff" : "#333333",
                border: "1px solid #cccccc",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              Citizen Login
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType("INTEGRATION_ADMIN");
                setUsername("admin@govbridge.demo");
              }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: 12,
                fontWeight: portalType === "INTEGRATION_ADMIN" ? 800 : 600,
                background: portalType === "INTEGRATION_ADMIN" ? "#003366" : "#f0f4f8",
                color: portalType === "INTEGRATION_ADMIN" ? "#ffffff" : "#333333",
                border: "1px solid #cccccc",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              System Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType("AUDITOR");
                setUsername("auditor@govbridge.demo");
              }}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: 12,
                fontWeight: portalType === "AUDITOR" ? 800 : 600,
                background: portalType === "AUDITOR" ? "#003366" : "#f0f4f8",
                color: portalType === "AUDITOR" ? "#ffffff" : "#333333",
                border: "1px solid #cccccc",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              Auditor
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {/* If Department Officer, allow selecting specific department to log in */}
            {portalType === "DEPARTMENT_OFFICER" && (
              <div className="gov-form-group" style={{ marginBottom: 16 }}>
                <label className="gov-form-label" style={{ color: "#003366" }}>
                  Select Government Department *
                </label>
                <select
                  className="gov-select"
                  value={selectedDept}
                  onChange={(e) => {
                    const code = e.target.value as DepartmentCode;
                    setSelectedDept(code);
                    setUsername(`${code.toLowerCase()}.officer@govbridge.demo`);
                  }}
                  style={{ padding: "8px 10px", fontSize: 13, border: "1px solid #003366", fontWeight: 700 }}
                >
                  <option value="MSRTC">MSRTC — State Transport Bus Depot Officer</option>
                  <option value="UIDAI">UIDAI — Aadhaar E-KYC Verification Officer</option>
                  <option value="CBDT">CBDT — Income Tax Assessment Officer</option>
                  <option value="ECI">ECI — Election Commission Registration Officer</option>
                  <option value="EDU">EDU — DigiLocker NAD Academic Registrar</option>
                  <option value="SKILL">SKILL — MSDE Skill Certification &amp; DBT Officer</option>
                  <option value="ULB">ULB — Municipal Property Tax Revenue Officer</option>
                  <option value="ALL">ALL — State Interoperability Officer</option>
                </select>
              </div>
            )}

            <div className="gov-form-group">
              <label className="gov-form-label">
                Official User ID / Email Address *
              </label>
              <input
                type="text"
                className="gov-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter official credentials..."
                required
              />
            </div>

            <div className="gov-form-group">
              <label className="gov-form-label">
                Password / Security PIN *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="gov-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#555555",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={{ margin: "14px 0 16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                />
                <span>I confirm that I am authorized to access government e-services under DPDP Act 2023.</span>
              </label>
            </div>

            {error && (
              <div style={{ padding: 8, background: "#f8d7da", border: "1px solid #f5c6cb", color: "#721c24", fontSize: 12, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="gov-btn"
              style={{ width: "100%", padding: "10px", fontSize: 14, fontWeight: 800 }}
            >
              {loading ? "Authenticating Official Session..." : `Sign In to ${portalType === "DEPARTMENT_OFFICER" ? DEPARTMENTS[selectedDept].shortName : portalType}`}
            </button>
          </form>

          {/* Quick Department Officer Accounts Presets - ONLY visible for Department Officer Login */}
          {portalType === "DEPARTMENT_OFFICER" && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#003366", marginBottom: 8 }}>
                ⚡ Select Specific Department Officer Login (1-Click Authenticated Session):
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {(["MSRTC", "UIDAI", "CBDT", "ECI", "EDU", "SKILL", "ULB"] as DepartmentCode[]).map((code) => {
                  const dept = DEPARTMENTS[code];
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => autofillOfficer(code)}
                      style={{
                        padding: "6px 8px",
                        background: selectedDept === code ? "#e6f0fa" : "#ffffff",
                        border: `1px solid ${selectedDept === code ? "#003366" : "#cccccc"}`,
                        borderRadius: 2,
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#003366" }}>
                        {dept.sealEmoji} {dept.shortName}
                      </div>
                      <div style={{ fontSize: 10, color: "#666666" }}>
                        {code.toLowerCase()}.officer@govbridge.demo
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", fontSize: 11, color: "#555555", margin: "16px 0 8px" }}>
        DPDP Act 2023 Compliant • Government of Maharashtra e-Governance Gateway
      </footer>
    </div>
  );
}
