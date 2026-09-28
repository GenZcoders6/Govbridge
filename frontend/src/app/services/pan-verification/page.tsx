"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";

export default function PanVerificationPage() {
  const router = useRouter();
  const [panNumber, setPanNumber] = useState("ABCDE1234F");
  const [fullName, setFullName] = useState("Sunil Patil");
  const [assessmentYear, setAssessmentYear] = useState("2025-2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await applicationsApi.create({
        title: `PAN & Income Verification - ${fullName}`,
        form_data: {
          service: "PAN Card & Income Verification",
          pan_number: panNumber,
          full_name: fullName,
          assessment_year: assessmentYear,
          master_citizen_id: "MAHA-CIT-10284",
          citizen_uid: "MAHA-CIT-10284",
          submitted_at: new Date().toISOString(),
        },
      });
      const targetId = res?.data?.id || "APP-CBDT-204";
      router.push(`/applications/${targetId}`);
    } catch {
      router.push("/applications/APP-CBDT-204");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="PAN & Income Verification Portal" subtitle="Income Tax Department / Central Board of Direct Taxes">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>REVENUE &amp; TAXATION VERIFICATION</div>
          <h1 className="page-header-title">PAN Card &amp; Income Verification</h1>
          <p className="page-header-subtitle">
            Verify Permanent Account Number (PAN) validity and tax-assessed annual income via Income Tax Revenue Registry.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back to Catalogue</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, maxWidth: 1000 }}>
        {/* Main Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">PAN Verification Request</div>
              <div className="card-subtitle">Official Direct Connection to Revenue Database</div>
            </div>
            <span className="badge badge-info">5 Mins SLA</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="fullName">Full Name (As per PAN Card)</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="pan">PAN Number (10 Characters)</label>
                <input
                  id="pan"
                  type="text"
                  className="form-input monospace"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  required
                />
                <p className="form-hint">Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)</p>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="ay">Assessment Year</label>
                <select
                  id="ay"
                  className="form-input"
                  value={assessmentYear}
                  onChange={(e) => setAssessmentYear(e.target.value)}
                >
                  <option value="2025-2026">2025-2026 (Latest Assessment)</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: 12 }}>
                {loading ? "Querying Income Tax Database…" : "Verify PAN & Income Status →"}
              </button>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Service Metadata</div>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Department</span>
                <span style={{ fontWeight: 600 }}>Income Tax Dept</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Turnaround SLA</span>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>5 Minutes</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Connector Type</span>
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>Database Adapter</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "#64748b" }}>Income Threshold Check</span>
                <span style={{ fontWeight: 600, color: "#2563eb" }}>&lt; ₹3,00,000 / Year</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
