"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { exceptionsApi, type SystemException } from "@/lib/api";

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<SystemException[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [error, setError] = useState("");

  const loadExceptions = useCallback(async () => {
    try {
      const res = await exceptionsApi.list({
        status: statusFilter || undefined,
        limit: 100,
      });
      setExceptions(res.data);
    } catch {
      setError("Failed to load exceptions from API.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadExceptions();
  }, [loadExceptions]);

  const handleRetry = async (ex: SystemException) => {
    if (!ex.application_id) {
      setError("Exception does not have an associated application ID to retry.");
      return;
    }
    setActionLoadingId(ex.id);
    setActionMsg("");
    setError("");
    try {
      const res = await exceptionsApi.retry(ex.application_id);
      setActionMsg(`Recovery initiated: ${res.data.message || res.data.status}`);
      await loadExceptions();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Retry execution failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleManualReview = async (ex: SystemException) => {
    if (!ex.application_id) {
      setError("Exception does not have an associated application ID for manual review.");
      return;
    }
    setActionLoadingId(ex.id);
    setActionMsg("");
    setError("");
    try {
      const res = await exceptionsApi.manualReview(
        ex.application_id,
        "Cleared by Department Reviewer via Exceptions Console"
      );
      setActionMsg(`Manual review action completed: ${res.data.message || res.data.status}`);
      await loadExceptions();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Manual review trigger failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const STATUSES = ["", "QUEUED", "MANUAL_REVIEW", "OPEN", "RETRYING", "RESOLVED"];

  return (
    <AppShell
      title="Exceptions & Circuit-Breaker"
      subtitle="Fault tolerance, chaos simulation, retry queues, and human-in-the-loop review"
      requiredRoles={["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN"]}
    >
      <div className="page-header">
        <div>
          <h1 className="page-header-title">System Exceptions & Queued Work</h1>
          <p className="page-header-subtitle">
            {exceptions.length} failure telemetry records tracked in PostgreSQL
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadExceptions()}>
          ↻ Refresh
        </button>
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

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUSES.map((s) => (
          <button
            key={s || "ALL"}
            className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(s)}
          >
            {s ? s.replace("_", " ") : "All Statuses"}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Interoperability Failure Records</div>
          <div className="card-subtitle">
            Records preserve application state upon exhausted retries and allow zero-data-loss recovery
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : exceptions.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
            <div className="empty-state-title">No system exceptions found</div>
            <div className="empty-state-text">
              All connector calls and cross-department workflows are executing cleanly
            </div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Exception ID</th>
                  <th>Application</th>
                  <th>Source / Target</th>
                  <th>Error Type</th>
                  <th>Message</th>
                  <th>Retries</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((ex) => (
                  <tr key={ex.id}>
                    <td>
                      <span className="monospace" style={{ fontSize: 11, color: "#1e3a8a" }}>
                        {ex.id.slice(0, 8)}…
                      </span>
                    </td>
                    <td>
                      {ex.application_id ? (
                        <Link
                          href={`/applications/${ex.application_id}`}
                          className="monospace"
                          style={{ color: "#2563eb", fontWeight: 600, fontSize: 12 }}
                        >
                          {ex.application_id.slice(0, 8)}…
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>
                        {ex.source || "MOCK_EMPLOYMENT"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#b91c1c" }}>
                        {ex.error_type || ex.exception_type}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, fontSize: 12, color: "#475569" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ex.error_message || ex.message}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 12 }}>
                        {ex.retry_count} / 3
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={ex.status} size="sm" />
                    </td>
                    <td style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatDate(ex.created_at)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          id={`retry-btn-${ex.id}`}
                          className="btn btn-sm btn-primary"
                          onClick={() => handleRetry(ex)}
                          disabled={actionLoadingId === ex.id || ex.status === "RESOLVED"}
                        >
                          {actionLoadingId === ex.id ? "Processing…" : "Retry"}
                        </button>
                        <button
                          id={`review-btn-${ex.id}`}
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleManualReview(ex)}
                          disabled={actionLoadingId === ex.id || ex.status === "RESOLVED"}
                        >
                          Manual Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
