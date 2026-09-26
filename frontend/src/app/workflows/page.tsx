"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import {
  workflowsApi,
  applicationsApi,
  type Workflow,
  type Application,
} from "@/lib/api";

const PIPELINE_STEPS = [
  { step: 1,  name: "App Created",        icon: "📄", dept: "GovBridge Core",       parallel: false },
  { step: 2,  name: "Identity Verify",    icon: "🪪", dept: "Identity Registry",    parallel: false },
  { step: 3,  name: "Consent Validation", icon: "🔐", dept: "DPDP Framework",       parallel: false },
  { step: 4,  name: "Education Verify",   icon: "🎓", dept: "Edu. Registry (REST)", parallel: true  },
  { step: 5,  name: "Skill Verify",       icon: "⚡",  dept: "NSDC (SOAP/XML)",      parallel: true  },
  { step: 6,  name: "Employment Verify",  icon: "💼", dept: "Labour Dept (REST)",   parallel: true  },
  { step: 7,  name: "Income Verify",      icon: "₹",  dept: "Revenue (DB)",         parallel: true  },
  { step: 8,  name: "Eligibility Eval",   icon: "⚖️", dept: "Rules Engine",         parallel: false },
  { step: 9,  name: "Dept. Review",       icon: "🛡️",  dept: "Department Officer",  parallel: false },
  { step: 10, name: "Decision",           icon: "📜", dept: "Sanction Authority",   parallel: false },
  { step: 11, name: "Completed",          icon: "✅", dept: "GovBridge Core",       parallel: false },
];

const PARALLEL_COLOR = { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" };
const NORMAL_COLOR   = { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };

function PipelineDiagram() {
  const parallelSteps = PIPELINE_STEPS.filter(s => s.parallel);
  const sequentialSteps = PIPELINE_STEPS.filter(s => !s.parallel);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <div>
          <div className="card-title">11-Step Cross-Department Orchestration Pipeline</div>
          <div className="card-subtitle">
            Unified Skill &amp; Employment Benefit · Steps 4–7 run as parallel async I/O across 4 government registries
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className="badge badge-info"><span className="badge-dot" />Sequential</span>
          <span className="badge" style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
            <span className="badge-dot" style={{ background: "#3b82f6" }} />
            Parallel I/O
          </span>
        </div>
      </div>
      <div className="card-body">
        <div style={{ overflowX: "auto", paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, minWidth: 900 }}>
            {PIPELINE_STEPS.map((s, idx) => {
              const colors = s.parallel ? PARALLEL_COLOR : NORMAL_COLOR;
              const isFirst = idx === 0;
              const isLast  = idx === PIPELINE_STEPS.length - 1;
              const prevParallel = idx > 0 && PIPELINE_STEPS[idx - 1].parallel;
              const nextParallel = idx < PIPELINE_STEPS.length - 1 && PIPELINE_STEPS[idx + 1].parallel;

              return (
                <div
                  key={s.step}
                  style={{ display: "flex", alignItems: "center", gap: 0, flex: s.parallel ? 1.2 : 1 }}
                >
                  {/* Node */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        padding: "10px 8px",
                        background: colors.bg,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: 10,
                        textAlign: "center",
                        cursor: "default",
                        transition: "all 0.15s ease",
                        position: "relative",
                        overflow: "hidden",
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
                      {/* Parallel indicator stripe */}
                      {s.parallel && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#3b82f6", borderRadius: "10px 10px 0 0" }} />
                      )}
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: colors.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                        Step {s.step}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-800)", lineHeight: 1.2 }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--gray-500)", marginTop: 4, lineHeight: 1.2 }}>
                        {s.dept}
                      </div>
                    </div>
                    {s.parallel && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#1d4ed8",
                          background: "#dbeafe",
                          padding: "1px 6px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        ∥ Async
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  {!isLast && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "0 4px",
                        marginTop: s.parallel || nextParallel ? -12 : -6,
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                        <path d="M0 5h16M12 1l6 4-6 4" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "var(--gray-50)",
            borderRadius: 8,
            border: "1px solid var(--gray-200)",
            display: "flex",
            gap: 24,
            fontSize: 12,
            color: "var(--gray-600)",
          }}
        >
          <div><strong>Steps 1–3:</strong> Sequential gateway checks (Identity, Consent)</div>
          <div><strong style={{ color: "#1d4ed8" }}>Steps 4–7 (∥):</strong> Parallel async verification — Education, Skill, Employment, Revenue registries</div>
          <div><strong>Steps 8–11:</strong> Evaluation, Review, Decision, Completion</div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [actionIsError, setActionIsError] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [wfRes, appRes] = await Promise.all([
        workflowsApi.list(),
        applicationsApi.list({ limit: 50 }),
      ]);
      setWorkflows(wfRes.data);
      setApplications(appRes.data);
    } catch {
      setError("Failed to load workflow data from API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRunWorkflow = async (workflowId: string, simulateFailure = false) => {
    setActionLoading(true);
    setActionMsg("");
    setActionIsError(false);
    setError("");
    try {
      const res = await workflowsApi.start(workflowId, {
        simulate_failure: simulateFailure,
        simulate_failure_target: simulateFailure ? "MOCK_EMPLOYMENT" : undefined,
      });
      setActionMsg(
        simulateFailure
          ? `Chaos test: deliberate failure injected at MOCK_EMPLOYMENT. Status: ${res.data.status}`
          : `Workflow execution initiated! App ID: ${res.data.application_id}`
      );
      await loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setActionIsError(true);
      setError(axiosErr?.response?.data?.detail || "Failed to trigger workflow execution.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async (workflowId: string) => {
    setActionLoading(true);
    setActionMsg("");
    setActionIsError(false);
    try {
      const res = await workflowsApi.retry(workflowId);
      setActionMsg(`Workflow retry submitted: ${res.data.message || res.data.status}`);
      await loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setActionIsError(true);
      setError(axiosErr?.response?.data?.detail || "Workflow retry failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualReview = async (workflowId: string) => {
    setActionLoading(true);
    setActionMsg("");
    setActionIsError(false);
    try {
      const res = await workflowsApi.manualReview(workflowId, "Approved by Department Reviewer via GovBridge Console");
      setActionMsg(`Manual review submitted: ${res.data.message || res.data.status}`);
      await loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setActionIsError(true);
      setError(axiosErr?.response?.data?.detail || "Manual review failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const primaryWorkflow =
    workflows.find((w) => w.code === "UNIFIED_SKILL_BENEFIT" || w.name.includes("Unified")) || workflows[0];

  return (
    <AppShell title="Workflow Center" subtitle="Cross-Department Orchestration & Live State Engine">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Workflow Orchestration Engine</h1>
          <p className="page-header-subtitle">
            Dynamic DAG pipeline · Non-blocking parallel registry verifications · Live 6s auto-refresh
          </p>
        </div>
        {primaryWorkflow && (
          <div className="page-header-actions">
            <button
              id="run-normal-workflow-btn"
              className="btn btn-primary"
              onClick={() => handleRunWorkflow(primaryWorkflow.id, false)}
              disabled={actionLoading}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
              </svg>
              Run Workflow
            </button>
            <button
              id="run-failure-simulation-btn"
              className="btn btn-secondary"
              onClick={() => handleRunWorkflow(primaryWorkflow.id, true)}
              disabled={actionLoading}
              style={{ borderColor: "var(--amber-200)", color: "var(--amber-700)", background: "var(--amber-50)" }}
            >
              ⚡ Simulate Failure
            </button>
          </div>
        )}
      </div>

      {/* Action feedback */}
      {actionMsg && !actionIsError && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M13 4L6 11l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {actionMsg}
        </div>
      )}
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Pipeline Diagram */}
      <PipelineDiagram />

      {/* Live Executions Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Live Workflow Executions</div>
            <div className="card-subtitle">
              Real-time state from database · Statuses: SUBMITTED, IN_REVIEW, APPROVED, REJECTED, QUEUED, MANUAL_REVIEW
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--green-600)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-500)", animation: "pulse 2s infinite" }} />
              Auto-refreshing
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => loadData()}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6a5 5 0 1110.2-.8M11 1l-.2 4.2H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 8 }}>⚙️</div>
            <div className="empty-state-title">No workflow executions found</div>
            <div className="empty-state-text">
              Click &quot;Run Workflow&quot; above to start a demonstration run of the 11-step pipeline
            </div>
            {primaryWorkflow && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleRunWorkflow(primaryWorkflow.id, false)}
                style={{ marginTop: 14 }}
                disabled={actionLoading}
              >
                ▶ Run Demo Workflow
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>App Reference</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: "right" }}>Controls</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const pct = Math.min(100, (app.current_step / 11) * 100);
                  const barColor =
                    app.status === "APPROVED" || app.status === "COMPLETED"
                      ? "var(--green-500)"
                      : app.status === "REJECTED" || app.status === "FAILED"
                      ? "var(--red-500)"
                      : app.status === "QUEUED"
                      ? "var(--amber-500)"
                      : "var(--navy-400)";

                  return (
                    <tr key={app.id}>
                      <td>
                        <Link
                          href={`/applications/${app.id}`}
                          className="monospace"
                          style={{ color: "var(--navy-500)", fontWeight: 700, fontSize: 12 }}
                        >
                          {app.reference_number}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-800)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {app.title || "Unified Skill & Employment Benefit"}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--navy-600)", minWidth: 32 }}>
                            {app.current_step}/11
                          </span>
                          <div style={{ width: 80, height: 6, background: "var(--gray-200)", borderRadius: 3, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: barColor,
                                borderRadius: 3,
                                transition: "width 0.5s ease",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 10, color: "var(--gray-400)", minWidth: 28 }}>{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--gray-500)" }}>
                        {app.submitted_at
                          ? new Date(app.submitted_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <Link href={`/applications/${app.id}`} className="btn btn-sm btn-secondary">
                            Timeline
                          </Link>
                          {(app.status === "QUEUED" || app.status === "FAILED") && (
                            <button
                              className="btn btn-sm"
                              onClick={() => handleRetry(app.workflow_id)}
                              disabled={actionLoading}
                              style={{ background: "var(--amber-50)", color: "var(--amber-700)", border: "1px solid var(--amber-200)" }}
                            >
                              Retry
                            </button>
                          )}
                          {app.status === "MANUAL_REVIEW" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleManualReview(app.workflow_id)}
                              disabled={actionLoading}
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
