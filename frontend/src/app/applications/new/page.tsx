"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { applicationsApi, workflowsApi, type Workflow } from "@/lib/api";

const IDENTITY_MAPPINGS = [
  { label: "Master Citizen ID", value: "MAHA-CIT-10284", color: "var(--navy-600)", bg: "var(--navy-50)", icon: "◎" },
  { label: "Education Registry", value: "EDU-MH-2021-8842", color: "var(--violet-600)", bg: "var(--violet-100)", icon: "🎓" },
  { label: "Employment Registry", value: "EMP-49382", color: "var(--green-700)", bg: "var(--green-50)", icon: "💼" },
  { label: "Skill Registry", value: "SKILL-CERT-8841", color: "var(--amber-700)", bg: "var(--amber-50)", icon: "⚡" },
  { label: "Revenue Registry", value: "PAN-ABCDE1234F", color: "#be185d", bg: "#fdf2f8", icon: "₹" },
];

const WORKFLOW_STEPS = [
  "Application Created",
  "Identity Verification",
  "Consent Validation",
  "Education Verification ∥",
  "Skill Verification ∥",
  "Employment Verification ∥",
  "Income Verification ∥",
  "Eligibility Evaluation",
  "Department Review",
  "Decision (Sanction)",
  "Completed",
];

export default function NewApplicationPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [fullName, setFullName] = useState("Sunil Patil");
  const [mobile, setMobile] = useState("+91 9876543284");
  const [masterCitizenId, setMasterCitizenId] = useState("MAHA-CIT-10284");
  const [service, setService] = useState("Unified Skill & Employment Benefit");
  const [loading, setLoading] = useState(false);
  const [fetchingWorkflows, setFetchingWorkflows] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    workflowsApi
      .list()
      .then((r) => {
        setWorkflows(r.data);
        const match = r.data.find(
          (w) => w.name.toLowerCase().includes("unified") || w.code === "UNIFIED_SKILL_BENEFIT"
        );
        if (match) { setSelectedWorkflow(match.id); setService(match.name); }
        else if (r.data.length > 0) { setSelectedWorkflow(r.data[0].id); setService(r.data[0].name); }
      })
      .finally(() => setFetchingWorkflows(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Please enter citizen Full Name"); return; }
    if (!mobile.trim()) { setError("Please enter citizen Mobile number"); return; }
    if (!masterCitizenId.trim()) { setError("Please enter Master Citizen ID"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await applicationsApi.create({
        workflow_id: selectedWorkflow || undefined,
        title: `${service} - ${fullName.trim()}`,
        form_data: {
          full_name: fullName.trim(),
          mobile: mobile.trim(),
          master_citizen_id: masterCitizenId.trim(),
          citizen_uid: masterCitizenId.trim(),
          service,
          submitted_at: new Date().toISOString(),
        },
      });
      router.push(`/applications/${res.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="New Application" subtitle="Unified Skill & Employment Benefit Application">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">New Application</h1>
          <p className="page-header-subtitle">Submit a cross-departmental integrated benefit request via GovBridge</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 24, maxWidth: 1040 }}>
        {/* Left — Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Applicant &amp; Service Details</div>
                <div className="card-subtitle">Data submitted via GovBridge API · Workflow orchestration auto-triggered on submission</div>
              </div>
              <span className="badge badge-info"><span className="badge-dot" />Live API</span>
            </div>
            <div className="card-body">
              {fetchingWorkflows ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12 }}>
                  <div className="spinner" />
                  <span style={{ fontSize: 13, color: "var(--gray-500)" }}>Loading available workflows…</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label form-label-required" htmlFor="service">Government Service</label>
                    <select
                      id="service"
                      className="form-input"
                      value={selectedWorkflow}
                      onChange={(e) => {
                        setSelectedWorkflow(e.target.value);
                        const wf = workflows.find((w) => w.id === e.target.value);
                        if (wf) setService(wf.name);
                      }}
                      required
                    >
                      {workflows.map((wf) => (
                        <option key={wf.id} value={wf.id}>
                          {wf.name} ({wf.code})
                        </option>
                      ))}
                    </select>
                    <p className="form-hint">Select the government scheme to apply for</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label form-label-required" htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        className="form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Citizen full name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label form-label-required" htmlFor="mobile">Mobile Number</label>
                      <input
                        id="mobile"
                        type="text"
                        className="form-input"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label form-label-required" htmlFor="masterCitizenId">
                      Master Citizen ID
                    </label>
                    <input
                      id="masterCitizenId"
                      type="text"
                      className="form-input monospace"
                      value={masterCitizenId}
                      onChange={(e) => setMasterCitizenId(e.target.value)}
                      placeholder="e.g. MAHA-CIT-10284"
                      required
                      style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.02em" }}
                    />
                    <p className="form-hint">
                      Federated master identifier — mapped across Education, Employment, Skill, Revenue, and Welfare registries
                    </p>
                  </div>

                  {error && (
                    <div className="alert alert-error" style={{ marginBottom: 16 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M8 2L2 14h12L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M8 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="8" cy="12" r="0.75" fill="currentColor"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button
                      id="submit-app-btn"
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      style={{ flex: 1, padding: "12px", fontSize: 14 }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          Submitting to GovBridge…
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 8h12M9 4l5 4-5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Submit Application
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* What happens next */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">What happens after submission?</div>
            </div>
            <div className="card-body" style={{ padding: "12px 20px" }}>
              {WORKFLOW_STEPS.map((step, i) => {
                const isParallel = step.endsWith("∥");
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 0",
                      borderBottom: i < WORKFLOW_STEPS.length - 1 ? "1px solid var(--gray-100)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: isParallel ? "var(--navy-50)" : "var(--gray-100)",
                        border: `1.5px solid ${isParallel ? "var(--navy-200)" : "var(--gray-200)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: isParallel ? "var(--navy-600)" : "var(--gray-500)",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--gray-700)", fontWeight: 500 }}>
                      {step}
                    </span>
                    {isParallel && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "var(--navy-600)",
                          background: "var(--navy-50)",
                          border: "1px solid var(--navy-100)",
                          padding: "1px 5px",
                          borderRadius: 3,
                          marginLeft: "auto",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Parallel
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Info Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Identity Mappings */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Demo Identity Mappings</div>
              <div className="card-subtitle">Master ID across registries</div>
            </div>
            <div>
              {IDENTITY_MAPPINGS.map((m) => (
                <div
                  key={m.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 16px",
                    borderBottom: "1px solid var(--gray-100)",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: m.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {m.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {m.label}
                    </div>
                    <div className="monospace" style={{ fontSize: 12, fontWeight: 700, color: m.color, marginTop: 1 }}>
                      {m.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration note */}
          <div className="card" style={{ background: "var(--navy-50)", border: "1px solid var(--navy-100)" }}>
            <div className="card-body">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20 }}>🔗</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy-800)", marginBottom: 6 }}>
                    GovBridge Integration Active
                  </div>
                  <div style={{ fontSize: 12, color: "var(--navy-700)", lineHeight: 1.6 }}>
                    This form submits to the <strong>live FastAPI gateway</strong> which orchestrates
                    parallel async verifications across 6 department mock registries
                    (ports 8001–8006) using REST/JSON and SOAP/XML adapters.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
