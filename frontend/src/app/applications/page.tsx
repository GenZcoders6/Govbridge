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

  const role = user?.role || "CITIZEN";

  useEffect(() => {
    applicationsApi
      .list()
      .then((r) => setApps(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter((a) => (filter ? a.status === filter : true));

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const STATUSES = ["SUBMITTED", "IN_REVIEW", "COMPLETED", "APPROVED", "QUEUED", "MANUAL_REVIEW", "FAILED", "REJECTED"];

  return (
    <AppShell
      title={role === "CITIZEN" ? "My Applications" : role === "DEPARTMENT_OFFICER" ? "Department Review Queue" : "System Applications"}
      subtitle={role === "CITIZEN" ? "Track your submitted government service requests" : "Manage citizen service applications"}
    >
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            {role === "CITIZEN" ? "My Service Applications" : role === "DEPARTMENT_OFFICER" ? "Department Action Queue" : "All System Applications"}
          </h1>
          <p className="page-header-subtitle">
            {role === "CITIZEN"
              ? "View status, progress timelines, and sanction certificates for your applications"
              : role === "DEPARTMENT_OFFICER"
              ? "Review pending citizen applications requiring department officer clearance"
              : "Cross-departmental application registry & execution monitor"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/services" className="btn btn-secondary">
            Department Services Catalogue
          </Link>
          {role === "CITIZEN" && (
            <Link href="/applications/new" className="btn btn-primary">
              + New Application
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className={`btn btn-sm ${!filter ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFilter("")}
        >
          All ({apps.length})
        </button>
        {STATUSES.map((s) => {
          const count = apps.filter((a) => a.status === s).length;
          if (count === 0 && role === "CITIZEN") return null;
          return (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter(s)}
            >
              {s.replace("_", " ")} ({count})
            </button>
          );
        })}
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
              {role === "CITIZEN"
                ? "Browse the Department Services Catalogue to submit a new request"
                : "No applications match the current filter criteria"}
            </div>
            <Link href="/services" className="btn btn-primary" style={{ marginTop: 16 }}>
              Browse Services Catalogue
            </Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Reference Number</th>
                  <th>Government Service</th>
                  <th>Status</th>
                  <th>Estimated SLA</th>
                  <th>Submitted Date</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link href={`/applications/${app.id}`}>
                        <span className="monospace" style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>
                          {app.reference_number}
                        </span>
                      </Link>
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {app.title || "Unified Skill & Employment Benefit"}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
                        {app.status === "APPROVED" || app.status === "COMPLETED" ? "Sanctioned" : "48 Hours SLA"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>
                      {formatDate(app.submitted_at || app.created_at)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/applications/${app.id}`} className="btn btn-sm btn-secondary">
                        {role === "DEPARTMENT_OFFICER" && app.status === "MANUAL_REVIEW" ? "Review Application →" : "View Status →"}
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
