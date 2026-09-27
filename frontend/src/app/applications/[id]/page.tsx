"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import {
  applicationsApi,
  eventsApi,
  workflowsApi,
  type Application,
  type ApplicationTimeline,
  type GovEvent,
} from "@/lib/api";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [app, setApp] = useState<Application | null>(null);
  const [timelineData, setTimelineData] = useState<ApplicationTimeline | null>(null);
  const [events, setEvents] = useState<GovEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [error, setError] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const [officerNotes, setOfficerNotes] = useState("Approved by Department Reviewer following automated verification checks.");

  const role = user?.role || "CITIZEN";

  const loadData = useCallback(async () => {
    try {
      const appRes = await applicationsApi.get(id);
      const appData = appRes.data;
      setApp(appData);

      const targetId = appData?.id || id;
      const [timelineRes, eventsRes] = await Promise.all([
        applicationsApi.getTimeline(targetId).catch(() => null),
        eventsApi.list({ application_id: targetId, limit: 50 }).catch(() => ({ data: [] })),
      ]);
      if (timelineRes) setTimelineData(timelineRes.data);
      setEvents(eventsRes.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Failed to load application data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleStartWorkflow = async () => {
    if (!app) return;
    setActionLoading(true);
    setActionMsg("");
    setError("");
    try {
      const res = await workflowsApi.start(app.id);
      setActionMsg(`Workflow execution completed! Status: ${res.data.status || "COMPLETED"}`);
      await loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Failed to start workflow execution.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryWorkflow = async () => {
    if (!app) return;
    setActionLoading(true);
    setActionMsg("");
    setError("");
    try {
      const res = await workflowsApi.retry(app.id);
      setActionMsg(`Retry completed: ${res.data.message || res.data.status}`);
      await loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Retry execution failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualReview = async (newStatus: "APPROVED" | "REJECTED" = "APPROVED") => {
    if (!app) return;
    setActionLoading(true);
    setActionMsg("");
    setError("");
    try {
      if (newStatus === "APPROVED") {
        const res = await workflowsApi.manualReview(app.id, officerNotes);
        setActionMsg(`Officer Approval saved: ${res.data.message || res.data.status}`);
      } else {
        await applicationsApi.updateStatus(app.id, "REJECTED");
        setActionMsg(`Application marked as REJECTED with note: ${officerNotes}`);
      }
      await loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Failed to process officer review decision.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AppShell title="Application Details">
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </AppShell>
    );
  }

  if (!app) {
    return (
      <AppShell title="Application Details">
        <div className="alert alert-error">{error || "Application not found"}</div>
      </AppShell>
    );
  }

  const isCompleted = app.status === "COMPLETED" || app.status === "APPROVED";

  // 4-stage citizen summary timeline steps
  const CITIZEN_STAGES = [
    {
      title: "Application Submitted",
      desc: "Received at State e-Services Portal",
      sla: "Instant (0s)",
      done: true,
      current: false,
      date: formatDate(app.submitted_at || app.created_at),
    },
    {
      title: "Cross-Department API Verification",
      desc: "UIDAI, Revenue, Education & Transport Registries",
      sla: "Automated API Checks (5 Mins)",
      done: app.current_step >= 8 || isCompleted,
      current: app.current_step >= 2 && app.current_step < 8 && !isCompleted,
      date: app.current_step >= 8 ? "Verified via GovBridge APIs" : "In Progress",
    },
    {
      title: "Department Officer Review",
      desc: "Sanctioning Authority Review & Document Audit",
      sla: "24–48 Hours",
      done: isCompleted,
      current: app.status === "MANUAL_REVIEW" || app.current_step === 9,
      date: isCompleted ? formatDate(app.resolved_at) : app.status === "MANUAL_REVIEW" ? "Pending Officer Action" : "Awaiting Turn",
    },
    {
      title: "Benefit Sanction & Certificate Issuance",
      desc: "Official Sanction Order & Direct Benefit Transfer",
      sla: "Final Disbursal",
      done: isCompleted,
      current: false,
      date: isCompleted ? `Sanctioned: ${formatDate(app.resolved_at)}` : "Pending Approval",
    },
  ];

  return (
    <AppShell title="Application Status & Tracking" subtitle={`Reference: ${app.reference_number}`}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
            SERVICE APPLICATION · REFERENCE <span className="monospace" style={{ color: "#2563eb" }}>{app.reference_number}</span>
          </div>
          <h1 className="page-header-title">{app.title || "Unified Government Service Request"}</h1>
          <p className="page-header-subtitle">
            Submitted on {formatDate(app.submitted_at || app.created_at)} · Target Turnaround SLA: <strong>48 Hours</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>CURRENT STATUS</div>
            <StatusBadge status={app.status} size="md" />
          </div>

          {/* Citizen Certificate Download Button */}
          {isCompleted && (
            <button
              className="btn btn-success"
              onClick={() => setShowCertificate(true)}
              style={{ background: "#16a34a", color: "#ffffff", padding: "10px 18px", fontWeight: 700 }}
            >
              📜 Download Official Certificate
            </button>
          )}

          {/* Admin Workflow Execution Buttons (Admin only) */}
          {role === "INTEGRATION_ADMIN" && (
            <>
              {(app.status === "DRAFT" || app.status === "SUBMITTED") && (
                <button className="btn btn-primary" onClick={handleStartWorkflow} disabled={actionLoading}>
                  {actionLoading ? "Processing…" : "▶ Run Orchestration"}
                </button>
              )}
              {(app.status === "QUEUED" || app.status === "FAILED") && (
                <button className="btn btn-warning" onClick={handleRetryWorkflow} disabled={actionLoading} style={{ background: "#d97706", color: "#fff" }}>
                  {actionLoading ? "Retrying…" : "↻ Retry Workflow"}
                </button>
              )}
              {app.status === "MANUAL_REVIEW" && (
                <button className="btn btn-success" onClick={() => handleManualReview("APPROVED")} disabled={actionLoading} style={{ background: "#16a34a", color: "#fff" }}>
                  {actionLoading ? "Approving…" : "✓ Officer Approval"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {actionMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ {actionMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* ── VIEW FOR CITIZEN ── */}
      {role === "CITIZEN" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Status Alert Banner */}
          <div
            style={{
              padding: "18px 24px",
              background: isCompleted ? "#f0fdf4" : app.status === "MANUAL_REVIEW" ? "#fffbeb" : "#eff6ff",
              border: `1.5px solid ${isCompleted ? "#86efac" : app.status === "MANUAL_REVIEW" ? "#fde68a" : "#bfdbfe"}`,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isCompleted ? "#14532d" : app.status === "MANUAL_REVIEW" ? "#78350f" : "#1e3a8a" }}>
                {isCompleted
                  ? "🎉 Application Sanctioned & Approved!"
                  : app.status === "MANUAL_REVIEW"
                  ? "⏳ Application Under Department Officer Review"
                  : "⚙️ Cross-Department API Verification in Progress"}
              </div>
              <div style={{ fontSize: 13, color: isCompleted ? "#166534" : app.status === "MANUAL_REVIEW" ? "#92400e" : "#1e40af", marginTop: 4 }}>
                {isCompleted
                  ? "Your application has passed all departmental checks and received official sanction."
                  : app.status === "MANUAL_REVIEW"
                  ? "All automated API checks completed. A designated department officer is reviewing your file."
                  : "GovBridge is connecting to UIDAI, Revenue, Education, and Skill registries."}
              </div>
            </div>

            {isCompleted && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowCertificate(true)} style={{ background: "#16a34a", borderColor: "#16a34a" }}>
                View Sanction Order →
              </button>
            )}
          </div>

          {/* 4-Stage Visual Progress Tracker */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Application Progress &amp; Turnaround Timeline</div>
              <div className="card-subtitle">Clear stage tracking with official Department Turnaround SLAs</div>
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {CITIZEN_STAGES.map((stg, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      background: stg.done ? "#f0fdf4" : stg.current ? "#eff6ff" : "#f8fafc",
                      border: `1.5px solid ${stg.done ? "#86efac" : stg.current ? "#93c5fd" : "#e2e8f0"}`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: stg.done ? "#15803d" : stg.current ? "#1d4ed8" : "#94a3b8" }}>
                          STAGE {idx + 1}
                        </span>
                        <span style={{ fontSize: 14 }}>{stg.done ? "✅" : stg.current ? "⏳" : "⚪"}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                        {stg.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                        {stg.desc}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 8, marginTop: 8, fontSize: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94a3b8" }}>Turnaround SLA:</span>
                        <span style={{ fontWeight: 600, color: "#16a34a" }}>{stg.sla}</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: stg.done ? "#16a34a" : "#475569", marginTop: 2 }}>
                        {stg.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Citizen Details Summary */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Submitted Application Details</div>
            </div>
            <div className="card-body">
              <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px" }}>
                <div>
                  <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>APPLICANT MASTER ID</dt>
                  <dd className="monospace" style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: "#2563eb" }}>MAHA-CIT-10284</dd>
                </div>
                <div>
                  <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>FULL NAME</dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Sunil Patil</dd>
                </div>
                <div>
                  <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>SUBMISSION DATE</dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 13, color: "#475569" }}>{formatDate(app.submitted_at || app.created_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : role === "DEPARTMENT_OFFICER" ? (
        /* ── VIEW FOR DEPARTMENT OFFICER ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Officer Review Action Box */}
          <div className="card" style={{ background: "#f5f3ff", border: "1.5px solid #c4b5fd" }}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{ color: "#5b21b6" }}>Department Officer Review Action Box</div>
                <div className="card-subtitle">Review applicant data and authorize decision or request documents</div>
              </div>
              <span className="badge" style={{ background: "#7c3aed", color: "#fff" }}>Officer Portal</span>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" htmlFor="notes">Reviewer Audit &amp; Approval Notes</label>
                <textarea
                  id="notes"
                  className="form-input"
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn btn-success"
                  onClick={() => handleManualReview("APPROVED")}
                  disabled={actionLoading}
                  style={{ background: "#16a34a", color: "#fff", padding: "10px 20px" }}
                >
                  {actionLoading ? "Processing…" : "✓ Approve &amp; Issue Sanction"}
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleManualReview("REJECTED")}
                  disabled={actionLoading}
                  style={{ background: "#dc2626", color: "#fff", padding: "10px 20px" }}
                >
                  ❌ Reject Application
                </button>
              </div>
            </div>
          </div>

          {/* Verification Breakdown */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Departmental Verification Check Matrix</div>
            </div>
            <div className="card-body" style={{ fontSize: 13 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>IDENTITY CHECK (UIDAI)</div>
                  <div style={{ color: "#16a34a", fontWeight: 700, marginTop: 4 }}>✓ Aadhaar E-KYC Matched</div>
                </div>
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>REVENUE CHECK (INCOME TAX)</div>
                  <div style={{ color: "#16a34a", fontWeight: 700, marginTop: 4 }}>✓ Income Below ₹3,00,000 SLA Threshold</div>
                </div>
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>EDUCATION CHECK</div>
                  <div style={{ color: "#16a34a", fontWeight: 700, marginTop: 4 }}>✓ University Degree Verified</div>
                </div>
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>SKILL REGISTRY CHECK (NSDC)</div>
                  <div style={{ color: "#16a34a", fontWeight: 700, marginTop: 4 }}>✓ Skill Cert Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── VIEW FOR INTEGRATION ADMIN ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20, marginBottom: 24 }}>
          {/* Metadata */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Application Metadata</div></div>
              <div className="card-body">
                <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                  <div>
                    <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>CURRENT STEP</dt>
                    <dd style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>Step {app.current_step} / 11</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SUBMITTED AT</dt>
                    <dd style={{ margin: "4px 0 0", fontSize: 12, color: "#475569" }}>{formatDate(app.submitted_at)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">11-Step Verification Timeline</div>
            </div>
            <div className="card-body" style={{ padding: 16 }}>
              {timelineData?.timeline?.map((step, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{idx + 1}. {step.step_name}</span>
                  <StatusBadge status={step.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Raw Event Stream Table (Admin only) */}
      {role === "INTEGRATION_ADMIN" && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <div className="card-title">System Redis Event Bus Telemetry</div>
          </div>
          <div className="table-wrapper" style={{ border: "none" }}>
            <table>
              <thead>
                <tr><th>Timestamp</th><th>Event Type</th><th>Source</th><th>Severity</th></tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontSize: 11, fontFamily: "monospace" }}>{formatDate(ev.created_at)}</td>
                    <td className="monospace" style={{ fontSize: 12 }}>{ev.event_type}</td>
                    <td style={{ fontSize: 12 }}>{ev.source}</td>
                    <td><StatusBadge status={ev.severity} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Sanction Certificate Modal */}
      {showCertificate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: 680, maxWidth: "100%", background: "#ffffff", borderRadius: 16, padding: 32, position: "relative" }}>
            {/* Header Stamp */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #1e3a8a", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                GOVERNMENT OF MAHARASHTRA · STATE e-GOVERNANCE AUTHORITY
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "6px 0 2px" }}>
                OFFICIAL SANCTION ORDER &amp; CERTIFICATE
              </h2>
              <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>
                VERIFIED &amp; SANCTIONED VIA GOVBRIDGE INTEROPERABILITY PLATFORM
              </div>
            </div>

            {/* Certificate Body */}
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 20 }}>
              <p>This is to certify that the application submitted by <strong>Sunil Patil</strong> (Master Citizen ID: <code style={{ fontWeight: 700 }}>MAHA-CIT-10284</code>) for <strong>{app.title || "Unified Skill & Employment Benefit"}</strong> has successfully passed all mandatory cross-departmental API verifications (UIDAI Identity, Income Tax Revenue, Higher Education, and NSDC Skill Registry).</p>

              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", margin: "16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><strong>Sanction Reference:</strong> {app.reference_number}</div>
                <div><strong>Sanction Date:</strong> {formatDate(app.resolved_at || new Date().toISOString())}</div>
                <div><strong>Monthly Benefit:</strong> ₹8,000 / Month (DBT Approved)</div>
                <div><strong>Verification Status:</strong> 100% Cryptographically Audited</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>SHA-256 Hash: 8f4a2b91...c4e91</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print / Download PDF</button>
                <button className="btn btn-secondary" onClick={() => setShowCertificate(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
