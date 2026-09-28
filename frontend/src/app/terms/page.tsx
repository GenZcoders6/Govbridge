"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function TermsPage() {
  return (
    <AppShell
      requireAuth={false}
      title="Terms & Conditions"
      subtitle="GovBridge Portal Terms of Service"
      breadcrumb={["Home", "Terms & Conditions"]}
    >
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>TERMS OF SERVICE</div>
          <h1 className="page-header-title">Terms &amp; Conditions</h1>
          <p className="page-header-subtitle">Official usage guidelines for citizens and department officers using GovBridge API platform.</p>
        </div>
        <Link href="/" className="btn btn-secondary">← Back to Home</Link>
      </div>

      <div className="card" style={{ maxWidth: 900, lineHeight: 1.7, fontSize: 14, color: "#334155" }}>
        <div className="card-body" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p>By accessing or applying for e-services through GovBridge, citizens agree to these Terms &amp; Conditions and consent to automated verification of demographic data against authoritative state registries.</p>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>2. Truthfulness of Submission</h2>
          <p>Applicants must provide authentic, accurate identifiers (Aadhaar, PAN, PRN Degree numbers). Submitting fraudulent documents or false claims constitutes an offense under the Information Technology Act 2000.</p>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>3. Turnaround Time SLAs</h2>
          <p>Service turnaround SLAs (e.g. Instant, 5 Mins, 24-48 Hours) represent standard administrative processing timelines under ordinary operational conditions.</p>
        </div>
      </div>
    </AppShell>
  );
}
