"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: "#002147", color: "#ffffff", borderTop: "3px solid #003366", fontSize: 12 }}>
      {/* Upper Footer Links */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
          borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#93c5fd" }}>
            Government of Maharashtra
          </div>
          <div style={{ color: "#dbeafe", lineHeight: 1.6 }}>
            GovBridge Inter-Departmental e-Governance Portal
            <br />
            State Data Centre, General Administration Department (IT)
            <br />
            Mantralaya, Mumbai - 400032
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#93c5fd" }}>
            Portal Content &amp; Navigation
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="/about" style={{ color: "#ffffff", textDecoration: "none" }}>About Us</a> |
            <a href="/contact" style={{ color: "#ffffff", textDecoration: "none" }}>Contact</a> |
            <a href="/help" style={{ color: "#ffffff", textDecoration: "none" }}>Help</a> |
            <a href="/feedback" style={{ color: "#ffffff", textDecoration: "none" }}>Feedback</a> |
            <a href="/accessibility" style={{ color: "#ffffff", textDecoration: "none" }}>Accessibility</a> |
            <a href="/privacy" style={{ color: "#ffffff", textDecoration: "none" }}>Privacy Policy</a> |
            <a href="/terms" style={{ color: "#ffffff", textDecoration: "none" }}>Terms &amp; Conditions</a> |
            <a href="/sitemap" style={{ color: "#ffffff", textDecoration: "none" }}>Sitemap</a>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#93c5fd" }}>
            Important Portals &amp; Links
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <a href="https://india.gov.in" target="_blank" rel="noreferrer" style={{ color: "#ffffff", textDecoration: "none" }}>
              Government of India (India.gov.in)
            </a>
            <a href="https://maharashtra.gov.in" target="_blank" rel="noreferrer" style={{ color: "#ffffff", textDecoration: "none" }}>
              Government of Maharashtra Portal
            </a>
            <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" style={{ color: "#ffffff", textDecoration: "none" }}>
              Digital India Initiative
            </a>
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      <div
        style={{
          background: "#00152e",
          padding: "12px 20px",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 11,
          lineHeight: 1.7,
        }}
      >
        <div>
          Website Content Managed By: <strong>Department of Information Technology, Government of Maharashtra</strong>
        </div>
        <div>
          Designed &amp; Developed By: <strong>GovBridge Interoperability Taskforce (SIH26129)</strong>
        </div>
        <div>
          Last Updated: <strong>27 September {currentYear}</strong> | Best viewed in 1024x768 resolution and modern standard web browsers.
        </div>
      </div>
    </footer>
  );
}
