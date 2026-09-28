"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";

export default function BusPassPage() {
  const router = useRouter();
  const [passCategory, setPassCategory] = useState("STUDENT_CONCESSION");
  const [fullName, setFullName] = useState("Sunil Patil");
  const [institutionName, setInstitutionName] = useState("Government College of Engineering & Technology");
  const [routeFrom, setRouteFrom] = useState("Shivajinagar Bus Station");
  const [routeTo, setRouteTo] = useState("University Campus Terminal");
  const [durationMonths, setDurationMonths] = useState("6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await applicationsApi.create({
        title: `MSRTC Bus Pass Concession (${passCategory === "STUDENT_CONCESSION" ? "Student" : "Senior Citizen"}) - ${fullName}`,
        form_data: {
          service: "Student & Citizen Concession Bus Pass",
          pass_category: passCategory,
          full_name: fullName,
          institution_name: institutionName,
          route_from: routeFrom,
          route_to: routeTo,
          duration_months: durationMonths,
          master_citizen_id: "MAHA-CIT-10284",
          citizen_uid: "MAHA-CIT-10284",
          submitted_at: new Date().toISOString(),
        },
      });
      const targetId = res?.data?.id || "APP-MSRTC-404";
      router.push(`/applications/${targetId}`);
    } catch {
      router.push("/applications/APP-MSRTC-404");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Concession Bus Pass Application" subtitle="State Road Transport Corporation (MSRTC)">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>PUBLIC TRANSPORTATION CONCESSION</div>
          <h1 className="page-header-title">Student &amp; Citizen Concession Bus Pass</h1>
          <p className="page-header-subtitle">
            Subsidized transit pass with automated student status &amp; age verification via Education and Transport APIs.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back to Catalogue</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, maxWidth: 1000 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Bus Pass Application Form</div>
              <div className="card-subtitle">Auto-verifies student bonafide status via Higher Education Registry API</div>
            </div>
            <span className="badge badge-info">24 Hours SLA</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="cat">Pass Concession Category</label>
                <select
                  id="cat"
                  className="form-input"
                  value={passCategory}
                  onChange={(e) => setPassCategory(e.target.value)}
                >
                  <option value="STUDENT_CONCESSION">Student Monthly / Semester Pass (66% Subsidy)</option>
                  <option value="SENIOR_CITIZEN">Senior Citizen Concession Pass (50% Subsidy)</option>
                  <option value="GENERAL_COMMUTER">General Monthly Route Pass</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="fullName">Applicant Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {passCategory === "STUDENT_CONCESSION" && (
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="inst">College / School Institution Name</label>
                  <input
                    id="inst"
                    type="text"
                    className="form-input"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                  />
                  <p className="form-hint">Must match bonafide student registry</p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="from">Origin Bus Station</label>
                  <input
                    id="from"
                    type="text"
                    className="form-input"
                    value={routeFrom}
                    onChange={(e) => setRouteFrom(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="to">Destination Bus Stop</label>
                  <input
                    id="to"
                    type="text"
                    className="form-input"
                    value={routeTo}
                    onChange={(e) => setRouteTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="months">Pass Duration</label>
                <select
                  id="months"
                  className="form-input"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                >
                  <option value="1">1 Month Pass (₹350 Concession Fee)</option>
                  <option value="3">3 Months Semester Pass (₹950 Concession Fee)</option>
                  <option value="6">6 Months Academic Pass (₹1,800 Concession Fee)</option>
                </select>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: 12 }}>
                {loading ? "Submitting to Transport Depot…" : "Submit Bus Pass Application →"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Interoperability Verification Pipeline</div>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Primary Authority</span>
                <span style={{ fontWeight: 600 }}>MSRTC Transport Bureau</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Verification SLA</span>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>24 Hours (1 Day)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "#64748b" }}>Connected APIs</span>
                <span style={{ fontWeight: 600, color: "#2563eb" }}>Education + Identity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
