"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";

export default function VoterIdPage() {
  const router = useRouter();
  const [epicNumber, setEpicNumber] = useState("MH-1028-VOTER");
  const [fullName, setFullName] = useState("Sunil Patil");
  const [assemblyConstituency, setAssemblyConstituency] = useState("Pune City - 204");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await applicationsApi.create({
        title: `Voter ID Validation - ${fullName}`,
        form_data: {
          service: "Electoral Roll & Voter ID Validation",
          epic_number: epicNumber,
          full_name: fullName,
          assembly_constituency: assemblyConstituency,
          master_citizen_id: "MAHA-CIT-10284",
          citizen_uid: "MAHA-CIT-10284",
          submitted_at: new Date().toISOString(),
        },
      });
      const targetId = res?.data?.id || "APP-ECI-304";
      router.push(`/applications/${targetId}`);
    } catch {
      router.push("/applications/APP-ECI-304");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Electoral Roll & Voter ID Validation" subtitle="Election Commission of India">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>CIVIC &amp; ELECTORAL REGISTRY</div>
          <h1 className="page-header-title">Voter ID Validation Portal</h1>
          <p className="page-header-subtitle">
            Verify Voter EPIC identity card status and electoral roll registration details directly from the Election Commission.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back to Catalogue</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, maxWidth: 1000 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Voter ID Search Form</div>
              <div className="card-subtitle">Official Election Commission Electoral Registry Query</div>
            </div>
            <span className="badge badge-info">Instant Sync</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="fullName">Elector Full Name</label>
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
                <label className="form-label form-label-required" htmlFor="epic">Voter EPIC Number</label>
                <input
                  id="epic"
                  type="text"
                  className="form-input monospace"
                  value={epicNumber}
                  onChange={(e) => setEpicNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MH-1028-VOTER"
                  required
                />
                <p className="form-hint">EPIC alphanumeric code printed on Voter ID card</p>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="ac">Assembly Constituency</label>
                <input
                  id="ac"
                  type="text"
                  className="form-input"
                  value={assemblyConstituency}
                  onChange={(e) => setAssemblyConstituency(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: 12 }}>
                {loading ? "Querying Electoral Roll…" : "Verify Voter Registration →"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Registry Metadata</div>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Authority</span>
                <span style={{ fontWeight: 600 }}>Election Commission</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Turnaround SLA</span>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>Instant (Real-time API)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "#64748b" }}>Protocol</span>
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>REST / JSON</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
