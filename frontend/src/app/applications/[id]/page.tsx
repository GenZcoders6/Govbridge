"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
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
  const [app, setApp] = useState<Application | null>(null);
  const [timelineData, setTimelineData] = useState<ApplicationTimeline | null>(null);
  const [events, setEvents] = useState<GovEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [error, setError] = useState("");

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
    // Auto-refresh every 5 seconds if workflow is running
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

  const handleManualReview = async () => {
    if (!app) return;
    setActionLoading(true);
    setActionMsg("");
    setError("");
    try {
      const res = await workflowsApi.manualReview(app.id, "Approved by Department Reviewer via GovBridge Portal");
      setActionMsg(`Manual review saved: ${res.data.message || res.data.status}`);
      await loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Failed to submit manual review.");
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
      second: "2-digit",
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

  return (
    <AppShell title="Application Tracking" subtitle={`ID: ${app.id}`}>
      {/* Header Info Banner */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Application ID: <span className="monospace" style={{ color: "#1e3a8a" }}>{app.id}</span>
          </div>
          <h1 className="page-header-title">{app.title || "Unified Skill & Employment Benefit"}</h1>
          <p className="page-header-subtitle">
            Reference: <span className="monospace" style={{ color: "#2563eb", fontWeight: 600 }}>{app.reference_number}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "right", marginRight: 8 }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>CURRENT STATUS</div>
            <StatusBadge status={app.status} size="md" />
          </div>

          {/* Workflow Action Buttons */}
          {(app.status === "DRAFT" || app.status === "SUBMITTED") && (
            <button
              className="btn btn-primary"
              onClick={handleStartWorkflow}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing…" : "▶ Run Orchestration"}
            </button>
          )}

          {(app.status === "QUEUED" || app.status === "FAILED") && (
            <button
              className="btn btn-warning"
              onClick={handleRetryWorkflow}
              disabled={actionLoading}
              style={{ background: "#d97706", color: "#fff" }}
            >
              {actionLoading ? "Retrying…" : "↻ Retry Workflow"}
            </button>
          )}

          {app.status === "MANUAL_REVIEW" && (
            <button
              className="btn btn-success"
              onClick={handleManualReview}
              disabled={actionLoading}
              style={{ background: "#16a34a", color: "#fff" }}
            >
              {actionLoading ? "Approving…" : "✓ Officer Approval"}
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          ✓ {actionMsg}
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Grid: Overview & Workflow Timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20, marginBottom: 24 }}>
        {/* Left Column: Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Application Metadata</div>
            </div>
            <div className="card-body">
              <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                <div>
                  <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SERVICE NAME</dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                    Unified Skill & Employment Benefit
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>CURRENT STEP</dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                    Step {app.current_step} / 11
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SUBMITTED AT</dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 12, color: "#475569" }}>
                    {formatDate(app.submitted_at)}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>RESOLVED AT</dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 12, color: "#475569" }}>
                    {formatDate(app.resolved_at)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Citizen Verification Data</div>
            </div>
            <div className="card-body" style={{ fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Master Citizen ID</span>
                <span className="monospace" style={{ fontWeight: 600, color: "#2563eb" }}>
                  MAHA-CIT-10284
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Education Degree</span>
                <span style={{ fontWeight: 500 }}>Bachelor of Technology (Computer Science)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Skill Certification</span>
                <span style={{ fontWeight: 500 }}>Advanced Cloud Architecture (Grade A)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Employment Status</span>
                <span style={{ fontWeight: 500 }}>ACTIVE · Employee ID EMP-49382</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "#64748b" }}>Income Verification</span>
                <span style={{ fontWeight: 500 }}>₹2,80,000 / year (Eligible &lt; ₹3,00,000)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Workflow Timeline */}
        <div className="card">
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="card-title">Workflow Verification Timeline</div>
              <div className="card-subtitle">Real-time cross-department orchestration progress</div>
            </div>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Status: <strong>{app.status}</strong>
            </span>
          </div>

          <div className="card-body" style={{ padding: "16px 20px" }}>
            {timelineData?.timeline && timelineData.timeline.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {timelineData.timeline.map((step, idx) => {
                  const isCompleted = step.status === "COMPLETED";
                  const isCurrent = step.status === "IN_PROGRESS" || step.status === "RUNNING";
                  const isFailed = step.status === "FAILED";
                  const isQueued = step.status === "QUEUED";

                  let iconColor = "#94a3b8";
                  let bgBadge = "#f8fafc";
                  if (isCompleted) { iconColor = "#16a34a"; bgBadge = "#f0fdf4"; }
                  else if (isCurrent) { iconColor = "#2563eb"; bgBadge = "#eff6ff"; }
                  else if (isFailed) { iconColor = "#dc2626"; bgBadge = "#fef2f2"; }
                  else if (isQueued) { iconColor = "#d97706"; bgBadge = "#fffbeb"; }

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: bgBadge,
                        borderRadius: 8,
                        border: isCurrent ? "1px solid #bfdbfe" : "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: iconColor,
                            width: 22,
                            textAlign: "center",
                          }}
                        >
                          {step.icon || (isCompleted ? "✓" : isCurrent ? "●" : "○")}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                            {idx + 1}. {step.step_name}
                          </div>
                          {step.completed_at && (
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              Completed: {formatDate(step.completed_at)}
                            </div>
                          )}
                          {step.error && (
                            <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>
                              Error: {step.error}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <StatusBadge status={step.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                Timeline data will appear when workflow orchestration runs.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real Event Stream */}
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="card-title">Application Event Stream</div>
            <div className="card-subtitle">Real-time Redis event bus telemetry persisted to PostgreSQL</div>
          </div>
          <span className="badge badge-info">{events.length} Events</span>
        </div>

        <div className="table-wrapper" style={{ border: "none" }}>
          {events.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
              No event records logged yet for this application.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Source</th>
                  <th>Severity</th>
                  <th>Payload Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatDate(ev.created_at)}
                    </td>
                    <td>
                      <span className="monospace" style={{ fontSize: 12, fontWeight: 600, color: "#1e3a8a" }}>
                        {ev.event_type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{ev.source || "workflow_engine"}</td>
                    <td><StatusBadge status={ev.severity} size="sm" /></td>
                    <td style={{ fontSize: 11, fontFamily: "monospace", color: "#475569" }}>
                      {JSON.stringify(ev.payload || {}).slice(0, 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
