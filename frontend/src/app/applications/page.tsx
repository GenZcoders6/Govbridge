"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { applicationsApi, type Application } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function ApplicationsPage() {
  const { user } = useAuthStore();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    applicationsApi
      .list()
      .then((r) => setApps(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter((a) =>
    filter ? a.status === filter : true
  );

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const STATUSES = ["SUBMITTED", "IN_REVIEW", "COMPLETED", "APPROVED", "QUEUED", "MANUAL_REVIEW", "FAILED", "REJECTED"];

  return (
    <AppShell title="My Applications" subtitle="Track all your service applications">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Applications</h1>
          <p className="page-header-subtitle">
            {user?.role === "CITIZEN" ? "Your submitted service applications" : "All citizen service applications"}
          </p>
        </div>
        <Link href="/applications/new" className="btn btn-primary">
          + New Application
        </Link>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className={`btn btn-sm ${!filter ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFilter("")}
        >
          All ({apps.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(s)}
          >
            {s.replace("_", " ")} ({apps.filter((a) => a.status === s).length})
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
            <div className="empty-state-title">No applications found</div>
            <div className="empty-state-text">
              {user?.role === "CITIZEN"
                ? "Submit a new application to get started"
                : "No applications match the current filter"}
            </div>
            <Link href="/applications/new" className="btn btn-primary" style={{ marginTop: 16 }}>
              Submit Application
            </Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Service / Title</th>
                  <th>Status</th>
                  <th>Step</th>
                  <th>Submitted</th>
                  <th>Resolved</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span className="monospace" style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>
                        {app.reference_number}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {app.title || "Untitled Application"}
                      </div>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Step {app.current_step}</span>
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>{formatDate(app.submitted_at)}</td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>{formatDate(app.resolved_at)}</td>
                    <td>
                      <Link href={`/applications/${app.id}`} className="btn btn-sm btn-secondary">
                        View
                      </Link>
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
