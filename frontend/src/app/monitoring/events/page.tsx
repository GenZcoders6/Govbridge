"use client";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { eventsApi, type GovEvent } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<GovEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [appIdFilter, setAppIdFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<GovEvent | null>(null);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await eventsApi.list({
        severity: severityFilter || undefined,
        event_type: eventTypeFilter || undefined,
        application_id: appIdFilter || undefined,
        limit: 100,
      });
      setEvents(res.data);
    } catch {
      setError("Failed to load events from Redis / PostgreSQL event stream.");
    } finally {
      setLoading(false);
    }
  }, [severityFilter, eventTypeFilter, appIdFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const EVENT_TYPES = [
    "",
    "APPLICATION_CREATED",
    "WORKFLOW_STARTED",
    "CONSENT_GRANTED",
    "IDENTITY_VERIFIED",
    "EDUCATION_VERIFIED",
    "SKILL_VERIFIED",
    "EMPLOYMENT_VERIFIED",
    "INCOME_VERIFIED",
    "CONNECTOR_FAILED",
    "RETRY_STARTED",
    "MANUAL_REVIEW_REQUIRED",
    "WORKFLOW_COMPLETED",
    "APPLICATION_COMPLETED",
  ];

  return (
    <AppShell
      title="Event Monitoring"
      subtitle="Redis Pub/Sub stream telemetry and PostgreSQL event ledger"
      requiredRoles={["DEPARTMENT_OFFICER", "INTEGRATION_ADMIN", "AUDITOR"]}
    >
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Event Monitor</h1>
          <p className="page-header-subtitle">
            {events.length} system events loaded from real backend
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadEvents()}>
          ↻ Refresh Stream
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Filter controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["", "INFO", "WARNING", "ERROR", "CRITICAL"].map((s) => (
            <button
              key={s || "ALL"}
              className={`btn btn-sm ${severityFilter === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSeverityFilter(s)}
            >
              {s || "All Severities"}
            </button>
          ))}
        </div>

        <select
          className="form-input"
          style={{ width: 220, padding: "6px 10px", fontSize: 12 }}
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
        >
          <option value="">— All Event Types —</option>
          {EVENT_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="form-input font-mono"
          style={{ width: 200, padding: "6px 10px", fontSize: 12 }}
          placeholder="Filter by App ID…"
          value={appIdFilter}
          onChange={(e) => setAppIdFilter(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Live System Events Stream</div>
          <div className="card-subtitle">
            Covers 13 core lifecycle events (Identity, Consent, Verifications, Chaos Retries, Completions)
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 36, marginBottom: 8 }}>◉</div>
            <div className="empty-state-title">No events recorded</div>
            <div className="empty-state-text">Events will stream here as workflow actions occur</div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Source</th>
                  <th>Severity</th>
                  <th>Application ID</th>
                  <th>Payload Summary</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                      {formatDate(ev.created_at)}
                    </td>
                    <td>
                      <span className="monospace" style={{ fontSize: 12, color: "#1e3a8a", fontWeight: 600 }}>
                        {ev.event_type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>
                      {ev.source || "workflow_engine"}
                    </td>
                    <td>
                      <StatusBadge status={ev.severity} size="sm" />
                    </td>
                    <td>
                      {ev.application_id ? (
                        <span className="monospace" style={{ fontSize: 11, color: "#2563eb" }}>
                          {ev.application_id.slice(0, 8)}…
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ maxWidth: 220, fontSize: 11, fontFamily: "monospace", color: "#475569" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {JSON.stringify(ev.payload || {})}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setSelectedEvent(ev)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Event Modal */}
      {selectedEvent && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card" style={{ width: 560, maxWidth: "90vw" }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="card-title">Event Telemetry — {selectedEvent.event_type}</div>
              <button className="btn btn-sm" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>EVENT ID</div>
                  <div className="monospace" style={{ fontSize: 11 }}>{selectedEvent.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SEVERITY</div>
                  <div style={{ marginTop: 2 }}><StatusBadge status={selectedEvent.severity} size="sm" /></div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SOURCE</div>
                  <div>{selectedEvent.source || "workflow_engine"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>TIMESTAMP</div>
                  <div style={{ fontSize: 12 }}>{formatDate(selectedEvent.created_at)}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>PAYLOAD JSON</div>
                <pre style={{ background: "#f8fafc", padding: 12, borderRadius: 6, fontSize: 11, overflowX: "auto" }}>
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEvent(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
