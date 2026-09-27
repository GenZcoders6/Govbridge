"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { applicationsApi } from "@/lib/api";

export default function EducationDegreePage() {
  const router = useRouter();
  const [prnNumber, setPrnNumber] = useState("EDU-MH-2021-8842");
  const [degreeName, setDegreeName] = useState("Bachelor of Technology (Computer Science & Engineering)");
  const [universityName, setUniversityName] = useState("Savitribai Phule Pune University");
  const [passingYear, setPassingYear] = useState("2024");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await applicationsApi.create({
        title: `Degree & Marksheet Verification - ${prnNumber}`,
        form_data: {
          service: "University Degree & Marksheet Verification",
          prn_number: prnNumber,
          degree_name: degreeName,
          university_name: universityName,
          passing_year: passingYear,
          master_citizen_id: "MAHA-CIT-10284",
          citizen_uid: "MAHA-CIT-10284",
          submitted_at: new Date().toISOString(),
        },
      });
      router.push(`/applications/${res.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Failed to process degree verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="University Degree Verification" subtitle="Higher & Technical Education Department">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>ACADEMIC CREDENTIAL REGISTRY</div>
          <h1 className="page-header-title">University Degree Verification Portal</h1>
          <p className="page-header-subtitle">
            Cross-verify university degrees, diploma certificates, and academic transcripts directly from state university servers.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back to Catalogue</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, maxWidth: 1000 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Degree Verification Form</div>
              <div className="card-subtitle">Official State Higher Education API Connection</div>
            </div>
            <span className="badge badge-info">12 Hours SLA</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="prn">Permanent Registration Number (PRN)</label>
                <input
                  id="prn"
                  type="text"
                  className="form-input monospace"
                  value={prnNumber}
                  onChange={(e) => setPrnNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="degree">Degree Title</label>
                <input
                  id="degree"
                  type="text"
                  className="form-input"
                  value={degreeName}
                  onChange={(e) => setDegreeName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="uni">University / Board Name</label>
                <input
                  id="uni"
                  type="text"
                  className="form-input"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="year">Passing Year</label>
                <input
                  id="year"
                  type="text"
                  className="form-input"
                  value={passingYear}
                  onChange={(e) => setPassingYear(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: 12 }}>
                {loading ? "Connecting to University Registry…" : "Initiate Degree Verification →"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Metadata</div>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Department</span>
                <span style={{ fontWeight: 600 }}>Higher Education Board</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b" }}>Turnaround SLA</span>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>12 Hours</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "#64748b" }}>Connector Protocol</span>
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>REST / JSON API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
