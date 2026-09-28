"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function PrivacyPage() {
  return (
    <AppShell
      requireAuth={false}
      title="Privacy Policy & DPDP Compliance"
      subtitle="Digital Personal Data Protection (DPDP) Act 2023 Framework"
      breadcrumb={["Home", "Privacy Policy"]}
    >
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, textTransform: "uppercase" }}>
            ✓ LEGAL COMPLIANCE · DPDP ACT 2023
          </div>
          <h1 className="page-header-title">Privacy Policy &amp; Data Protection</h1>
          <p className="page-header-subtitle">
            How GovBridge collects, processes, encrypts, and protects personal data across government registries.
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">← Back to Home</Link>
      </div>

      <div className="card" style={{ maxWidth: 900, lineHeight: 1.7, fontSize: 14, color: "#334155" }}>
        <div className="card-body" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
            1. Digital Personal Data Protection (DPDP) Act 2023 Compliance
          </h2>
          <p>
            GovBridge operates strictly as a <strong>Data Fiduciary / Data Processor</strong> under the provisions of India&apos;s Digital Personal Data Protection (DPDP) Act 2023. We ensure that personal data (such as Aadhaar E-KYC demographic tokens, PAN numbers, and educational credentials) is processed solely based on <strong>explicit citizen consent</strong> for specified government service delivery.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>
            2. Principles of Data Minimization &amp; Purpose Limitation
          </h2>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Only Necessary Data Collected:</strong> We query and retrieve only the minimum data required to verify service eligibility.</li>
            <li><strong>No Secondary Monetization:</strong> Personal data is never sold, shared, or utilized for commercial marketing.</li>
            <li><strong>Ephemeral In-Memory Verification:</strong> Cross-registry API checks are conducted transiently via encrypted adapters.</li>
          </ul>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>
            3. Right to Withdraw Consent &amp; Data Erasure
          </h2>
          <p>
            Under Section 6(4) of the DPDP Act 2023, citizens retain the right to withdraw data consent at any time via the{" "}
            <Link href="/consents" style={{ color: "#2563eb", fontWeight: 700 }}>
              Consent Manager
            </Link>. Upon consent revocation, GovBridge ceases all active cross-department data queries for the citizen.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>
            4. Cryptographic Security &amp; SHA-256 Audit Trail
          </h2>
          <p>
            All access logs, consent timestamps, and workflow transitions are cryptographically hashed using SHA-256 ledgers to ensure complete auditability, preventing unauthorized data tampering.
          </p>

          <div style={{ marginTop: 32, padding: 20, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>Data Protection Officer (DPO) Contact:</div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
              Nodal DPO Office · e-Governance Authority · Email: <code style={{ fontWeight: 700 }}>dpo@govbridge.gov.in</code>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
