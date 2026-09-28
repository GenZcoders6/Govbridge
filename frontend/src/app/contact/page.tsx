"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function ContactPage() {
  return (
    <AppShell
      requireAuth={false}
      title="Department & Nodal Contact Details"
      subtitle="Official Nodal Officers & Helpdesk"
      breadcrumb={["Home", "Contact Us"]}
    >
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>OFFICIAL CONTACT DIRECTORY</div>
          <h1 className="page-header-title">Nodal Officer &amp; Helpdesk Directory</h1>
          <p className="page-header-subtitle">Official contact details for departmental nodal authorities and e-governance grievance officer.</p>
        </div>
        <Link href="/" className="btn btn-secondary">← Back to Home</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, maxWidth: 1000 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">GovBridge Interoperability Nodal Office</div>
          </div>
          <div className="card-body" style={{ fontSize: 14, color: "#334155", lineHeight: 1.7 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>HEADQUARTERS ADDRESS</div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>State e-Governance Authority Headquarters</div>
              <div>5th Floor, Mantralaya Annex Building, Madame Cama Road, Mumbai - 400032</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>TOLL-FREE HELPDESK</div>
                <div style={{ fontWeight: 700, color: "#2563eb", fontSize: 16 }}>1800-11-2026</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>24x7 Citizen Support</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>OFFICIAL EMAIL</div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>support@govbridge.gov.in</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Official Inquiry</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">DPDP Data Protection Officer</div>
          </div>
          <div className="card-body" style={{ fontSize: 13, color: "#475569" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>Shri S. K. Deshmukh (IAS)</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Chief Data Protection Officer &amp; Nodal Director</div>
            </div>
            <div style={{ fontSize: 12 }}>
              Email: <code style={{ fontWeight: 700, color: "#2563eb" }}>dpo@govbridge.gov.in</code>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
