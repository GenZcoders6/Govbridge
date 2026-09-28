"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";

export default function SkillEmploymentPage() {
  const router = useRouter();
  const [skillCertId, setSkillCertId] = useState("SKILL-CERT-8841");
  const [empRegId, setEmpRegId] = useState("EMP-49382");
  const [fullName, setFullName] = useState("Sunil Patil");
  const [bankAccount, setBankAcc] = useState("998811223344 (SBI)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await applicationsApi.create({
        title: `Unified Skill & Employment Benefit - ${fullName}`,
        form_data: {
          service: "Unified Skill & Employment Benefit",
          skill_cert_id: skillCertId,
          emp_reg_id: empRegId,
          full_name: fullName,
          bank_account: bankAccount,
          master_citizen_id: "MAHA-CIT-10284",
          citizen_uid: "MAHA-CIT-10284",
          submitted_at: new Date().toISOString(),
        },
      });
      const targetId = res?.data?.id || "APP-SKILL-604";
      router.push(`/applications/${targetId}`);
    } catch {
      router.push("/applications/APP-SKILL-604");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Unified Skill Benefit & Allowance" subtitle="Department of Skill Development & Employment">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>SKILL &amp; EMPLOYMENT SUBSIDY</div>
          <h1 className="page-header-title">Skill &amp; Employment Benefit Portal</h1>
          <p className="page-header-subtitle">
            Cross-departmental integrated application for NSDC skill certification, employment exchange status, and direct benefit transfer (DBT) stipend.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back to Catalogue</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, maxWidth: 1000 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Skill Benefit Application Form</div>
              <div className="card-subtitle">Connects NSDC (SOAP/XML) &amp; Labour Dept (REST) APIs</div>
            </div>
            <span className="badge badge-info">48 Hours SLA</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
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

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="skill">Skill Certification ID (NSDC)</label>
                <input
                  id="skill"
                  type="text"
                  className="form-input monospace"
                  value={skillCertId}
                  onChange={(e) => setSkillCertId(e.target.value)}
                  required
                />
                <p className="form-hint">Verified against NSDC SOAP/XML Web Service</p>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="emp">Employment Exchange Registration ID</label>
                <input
                  id="emp"
                  type="text"
                  className="form-input monospace"
                  value={empRegId}
                  onChange={(e) => setEmpRegId(e.target.value)}
                  required
                />
                <p className="form-hint">Verified against Labour Department Registry</p>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="bank">Bank Account for DBT Disbursement</label>
                <input
                  id="bank"
                  type="text"
                  className="form-input"
                  value={bankAccount}
                  onChange={(e) => setBankAcc(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: 12 }}>
                {loading ? "Submitting Application to GovBridge…" : "Submit Skill Benefit Application →"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Interoperability Pipeline</div>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Department Authority</span>
                <span style={{ fontWeight: 600 }}>Skill &amp; Labour Dept</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Turnaround SLA</span>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>48 Hours (2 Days)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "#64748b" }}>DBT Stipend Amount</span>
                <span style={{ fontWeight: 700, color: "#2563eb" }}>₹8,000 / Month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
