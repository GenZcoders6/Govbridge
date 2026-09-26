"use client";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { consentsApi, type Consent } from "@/lib/api";

const DEPARTMENTS = [
  { id: "education", name: "Education Registry", code: "MOE", icon: "🎓", fields: ["degree", "institution", "passing_year", "percentage"] },
  { id: "employment", name: "Employment Registry", code: "MOLE", icon: "💼", fields: ["employment_status", "organization_category", "job_status"] },
  { id: "skill", name: "Skill Registry", code: "MSDE", icon: "⚡", fields: ["course_name", "certification_id", "grade"] },
  { id: "revenue", name: "Revenue / Income Registry", code: "DOR", icon: "₹", fields: ["tax_filing_status", "income_slab", "assessment_year"] },
  { id: "welfare", name: "Welfare Directorate", code: "MoSJE", icon: "🛡", fields: ["benefit_history", "enrollment_status"] },
];

export default function ConsentsPage() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingConsent, setReviewingConsent] = useState<Consent | null>(null);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(["education", "employment", "skill", "revenue", "welfare"]);
  const [purpose, setPurpose] = useState("Benefit Eligibility Verification");
  const [granting, setGranting] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [error, setError] = useState("");

  const loadConsents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await consentsApi.list();
      setConsents(res.data);
    } catch {
      setError("Failed to load consents from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setGranting(true);
    setError("");
    setActionMsg("");
    try {
      await consentsApi.create({
        purpose,
        requested_data: selectedDepts,
        data_categories: selectedDepts,
        expires_in_days: 30,
      });
      setActionMsg("New citizen consent granted successfully under DPDP framework.");
      setIsGrantModalOpen(false);
      await loadConsents();
    } catch {
      setError("Failed to create consent. Please try again.");
    } finally {
      setGranting(false);
    }
  };

  const handleRevokeConsent = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this consent? Connected departmental exchanges will be blocked.")) {
      return;
    }
    setError("");
    setActionMsg("");
    try {
      await consentsApi.revoke(id, "Citizen exercised DPDP withdrawal right");
      setActionMsg("Consent revoked successfully. Access to protected registries is now blocked.");
      await loadConsents();
      if (reviewingConsent?.id === id) {
        setReviewingConsent(null);
      }
    } catch {
      setError("Failed to revoke consent.");
    }
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppShell title="Consent Manager" subtitle="Digital Personal Data Protection (DPDP) Compliance">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Consent Manager</h1>
          <p className="page-header-subtitle">Control cross-departmental data sharing permissions</p>
        </div>
        <button
          id="grant-new-consent-btn"
          className="btn btn-primary"
          onClick={() => setIsGrantModalOpen(true)}
        >
          + Grant Consent
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

      {/* Requested Departments Grid */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Requested Department Registries</div>
          <div className="card-subtitle">Protected external systems integrated under GovBridge interoperability framework</div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {DEPARTMENTS.map((dept) => (
              <div
                key={dept.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{dept.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{dept.name}</div>
                    <span className="badge badge-info" style={{ fontSize: 10 }}>{dept.code}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                  Permitted Fields:
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                    {dept.fields.map((f) => (
                      <span key={f} className="tag" style={{ fontSize: 10 }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consents List */}
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="card-title">Citizen Consent Records</div>
            <div className="card-subtitle">Loaded from PostgreSQL consents ledger</div>
          </div>
          <span className="badge badge-info">{consents.length} Consents</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : consents.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔏</div>
            <div className="empty-state-title">No consent records found</div>
            <div className="empty-state-text">Click "Grant Consent" to authorize cross-departmental verification</div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setIsGrantModalOpen(true)}
            >
              Grant Consent Now
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px" }}>
            {consents.map((consent) => {
              const isActive = consent.status === "ACTIVE" || consent.status === "GRANTED";
              return (
                <div
                  key={consent.id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    background: isActive ? "#ffffff" : "#f8fafc",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <StatusBadge status={consent.status} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {consent.purpose}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                      Consent ID: <span className="monospace">{consent.id}</span>
                      {consent.application_id && (
                        <span> · App ID: <span className="monospace">{consent.application_id.slice(0, 8)}…</span></span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {(consent.requested_data || consent.data_categories || []).map((cat) => (
                        <span key={cat} className="tag" style={{ textTransform: "capitalize" }}>
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      Granted: {formatDate(consent.granted_at || consent.created_at)}
                      {consent.expires_at && ` · Expires: ${formatDate(consent.expires_at)}`}
                      {consent.revoked_at && ` · Revoked: ${formatDate(consent.revoked_at)}`}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setReviewingConsent(consent)}
                    >
                      Review
                    </button>

                    {isActive && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRevokeConsent(consent.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Consent Modal */}
      {reviewingConsent && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card" style={{ width: 540, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="card-title">Consent Review Details</div>
              <button className="btn btn-sm" onClick={() => setReviewingConsent(null)}>✕</button>
            </div>
            <div className="card-body" style={{ fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>PURPOSE:</span>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", marginTop: 2 }}>{reviewingConsent.purpose}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>STATUS:</span>
                <div style={{ marginTop: 4 }}><StatusBadge status={reviewingConsent.status} /></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>AUTHORIZED REGISTRIES:</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {(reviewingConsent.requested_data || reviewingConsent.data_categories || []).map((cat) => (
                    <span key={cat} className="badge badge-info">{cat.toUpperCase()}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>DATA MINIMIZATION NOTICE:</span>
                <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 12 }}>
                  In accordance with the DPDP Act, private financial ledgers and sensitive contact details (such as detailed bank accounts and salary figures) are strictly prohibited and excluded from inter-departmental queries.
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                {reviewingConsent.status === "ACTIVE" && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRevokeConsent(reviewingConsent.id)}
                  >
                    Revoke Consent
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setReviewingConsent(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grant Consent Modal */}
      {isGrantModalOpen && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card" style={{ width: 500, maxWidth: "90vw" }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="card-title">Grant Cross-Department Consent</div>
              <button className="btn btn-sm" onClick={() => setIsGrantModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleGrantConsent}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="purpose">Purpose *</label>
                  <input
                    id="purpose"
                    type="text"
                    className="form-input"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Authorize Departments:</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                    {DEPARTMENTS.map((dept) => (
                      <label key={dept.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={selectedDepts.includes(dept.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDepts([...selectedDepts, dept.id]);
                            } else {
                              setSelectedDepts(selectedDepts.filter((d) => d !== dept.id));
                            }
                          }}
                        />
                        <span>{dept.icon} {dept.name} ({dept.code})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsGrantModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={granting || selectedDepts.length === 0}>
                    {granting ? "Saving…" : "Grant Consent"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
