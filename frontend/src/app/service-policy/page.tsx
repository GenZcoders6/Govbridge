"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function ServicePolicyPage() {
  return (
    <AppShell
      requireAuth={false}
      title="Service & Concession Policy"
      subtitle="Government Service Fee & Subsidy Policy"
      breadcrumb={["Home", "Service Policy"]}
    >
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>SERVICE POLICY</div>
          <h1 className="page-header-title">Service &amp; Refund Policy</h1>
          <p className="page-header-subtitle">Guidelines for concession bus pass fees, scholarship disbursements, and fee refunds.</p>
        </div>
        <Link href="/" className="btn btn-secondary">← Back to Home</Link>
      </div>

      <div className="card" style={{ maxWidth: 900, lineHeight: 1.7, fontSize: 14, color: "#334155" }}>
        <div className="card-body" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>1. Free Public e-Services</h2>
          <p>Demographic verifications (Aadhaar E-KYC, PAN check, Voter ID validation, University Degree verification, and Skill benefit applications) are provided <strong>free of charge</strong> as public e-governance infrastructure.</p>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>2. Transit Concession Fees &amp; Refunds</h2>
          <p>For subsidized transit passes (MSRTC Bus Pass Concessions), fee payments processed online are directly credited to the transport bureau treasury. In case of rejected pass applications, statutory refunds are processed within 5-7 business days to the applicant&apos;s source bank account.</p>
        </div>
      </div>
    </AppShell>
  );
}
