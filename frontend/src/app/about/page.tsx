"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AshokaEmblemLogo, MySchemeLogo, GovBridgeLogo } from "@/components/GovLogos";

export default function AboutPage() {
  return (
    <AppShell
      requireAuth={false}
      title="About GovBridge & National Interoperability"
      subtitle="National Digital Public Infrastructure for Inter-Departmental e-Governance"
      breadcrumb={["Home", "About Us"]}
    >
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            NATIONAL PUBLIC DIGITAL INFRASTRUCTURE (DPI)
          </div>
          <h1 className="page-header-title">About GovBridge &amp; myScheme Interoperability</h1>
          <p className="page-header-subtitle">
            Bridging fragmented government departmental silos into a unified, consent-backed interoperability gateway powered by Digital India Corporation (DIC) &amp; MeitY.
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Back to Home
        </Link>
      </div>

      {/* Hero Highlight Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #071529 0%, #0c2044 50%, #0f2d5e 100%)",
          color: "#ffffff",
          padding: 32,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <AshokaEmblemLogo height={48} darkBackground={true} />
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }} />
          <MySchemeLogo height={38} darkBackground={true} />
          <GovBridgeLogo height={38} darkBackground={true} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", marginBottom: 12 }}>
          Empowering 1.4 Billion Citizens with Instant, Paperless Cross-Department Service Delivery
        </h2>
        <p style={{ fontSize: 14.5, color: "#cbd5e1", lineHeight: 1.8, maxWidth: 960 }}>
          GovBridge is the next-generation interoperability backbone conceived under the <strong>Smart India Hackathon (SIH 2024)</strong> and aligned with the National e-Governance Division (NeGD) mandate. It enables government departments—ranging from transport corporations to tax authorities and educational boards—to exchange verified citizen credentials instantaneously without paper paperwork or physical counter queues.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, marginBottom: 24 }}>
        {/* Core Pillars */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🏛️</span> The Core Pillars of GovBridge
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13.5, color: "#334155", lineHeight: 1.6 }}>
            <div style={{ borderLeft: "4px solid #16a34a", paddingLeft: 14 }}>
              <strong style={{ color: "#0f172a", fontSize: 14 }}>1. Cross-Registry Interoperability</strong>
              <p style={{ margin: "4px 0 0" }}>
                Integrates authoritative sources including UIDAI (Aadhaar), CBDT (PAN), ECI (EPIC Voter ID), DigiLocker NAD (University Degrees), and MSRTC into a common microservice bus.
              </p>
            </div>
            <div style={{ borderLeft: "4px solid #2563eb", paddingLeft: 14 }}>
              <strong style={{ color: "#0f172a", fontSize: 14 }}>2. DPDP Act 2023 Explicit Consent Engine</strong>
              <p style={{ margin: "4px 0 0" }}>
                Every data transaction is backed by a cryptographically signed citizen consent token specifying exact purpose, validity window, and revocation options.
              </p>
            </div>
            <div style={{ borderLeft: "4px solid #d97706", paddingLeft: 14 }}>
              <strong style={{ color: "#0f172a", fontSize: 14 }}>3. Immutable Cryptographic Ledger</strong>
              <p style={{ margin: "4px 0 0" }}>
                Maintains a tamper-proof SHA-256 chained audit trail for every verification request, satisfying statutory oversight requirements for CAG and government auditors.
              </p>
            </div>
            <div style={{ borderLeft: "4px solid #7c3aed", paddingLeft: 14 }}>
              <strong style={{ color: "#0f172a", fontSize: 14 }}>4. Zero-Downtime Department Connectors</strong>
              <p style={{ margin: "4px 0 0" }}>
                Resilient connectors equipped with circuit breakers, mTLS certificate validation, automated retries, and real-time SLA health monitors.
              </p>
            </div>
          </div>
        </div>

        {/* Institutional Oversight */}
        <div className="card" style={{ padding: 28, background: "#f8fafc" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>📜</span> Institutional Alignment
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "#475569" }}>
            <div style={{ background: "#ffffff", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>Digital India Corporation (DIC)</div>
              <div>Operating agency under the Ministry of Electronics &amp; IT (MeitY), Government of India.</div>
            </div>
            <div style={{ background: "#ffffff", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>myScheme.gov.in Platform</div>
              <div>National scheme discovery platform helping citizens identify eligible welfare initiatives.</div>
            </div>
            <div style={{ background: "#ffffff", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>Standards Compliance</div>
              <div>Adheres to Guidelines for Indian Government Websites (GIGW 3.0) and WCAG 2.1 Level AA.</div>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", gap: 10 }}>
            <Link href="/contact" className="btn btn-primary" style={{ flex: 1, textAlign: "center" }}>
              Contact Officers
            </Link>
            <Link href="/services" className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }}>
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
