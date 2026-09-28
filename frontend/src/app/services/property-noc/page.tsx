"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";

export default function PropertyNocPage() {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState("PROP-MH-49201");
  const [ownerName, setOwnerName] = useState("Sunil Patil");
  const [wardZone, setWardZone] = useState("Zone 4 - Kothrud Ward");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await applicationsApi.create({
        title: `Property Tax & Utility NOC - ${propertyId}`,
        form_data: {
          service: "Municipal Property Tax & Utility Clearance NOC",
          property_id: propertyId,
          owner_name: ownerName,
          ward_zone: wardZone,
          master_citizen_id: "MAHA-CIT-10284",
          citizen_uid: "MAHA-CIT-10284",
          submitted_at: new Date().toISOString(),
        },
      });
      const targetId = res?.data?.id || "APP-ULB-704";
      router.push(`/applications/${targetId}`);
    } catch {
      router.push("/applications/APP-ULB-704");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Municipal Property Tax & NOC Clearance" subtitle="Urban Local Body / Municipal Corporation">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>URBAN LOCAL GOVERNANCE</div>
          <h1 className="page-header-title">Municipal Property Tax &amp; NOC Portal</h1>
          <p className="page-header-subtitle">
            Obtain digital no-dues certificate for municipal property taxes, water bill charges, and civic utility assessments.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back to Catalogue</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, maxWidth: 1000 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Property NOC Application Form</div>
              <div className="card-subtitle">Connects Municipal Property Tax Database</div>
            </div>
            <span className="badge badge-info">72 Hours SLA</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="prop">Property Assessment ID Number</label>
                <input
                  id="prop"
                  type="text"
                  className="form-input monospace"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="owner">Property Owner Full Name</label>
                <input
                  id="owner"
                  type="text"
                  className="form-input"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="ward">Municipal Ward Zone</label>
                <input
                  id="ward"
                  type="text"
                  className="form-input"
                  value={wardZone}
                  onChange={(e) => setWardZone(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: 12 }}>
                {loading ? "Connecting to Municipal Database…" : "Apply for Property NOC →"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Service Metadata</div>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Authority</span>
                <span style={{ fontWeight: 600 }}>Municipal Corporation</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Turnaround SLA</span>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>72 Hours (3 Days)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "#64748b" }}>Connector Protocol</span>
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>Direct DB Query</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
