"use client";
import Link from "next/link";
import { MySchemeLogo, GovBridgeLogo } from "@/components/GovLogos";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: "#1e293b", color: "#ffffff", paddingTop: 40, paddingBottom: 24, position: "relative", marginTop: "auto" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 1.1fr", gap: 32, marginBottom: 32 }}>
          <div>
            {/* Official Website Brand Logos */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <MySchemeLogo height={34} darkBackground={true} />
              <GovBridgeLogo height={34} darkBackground={true} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#4ade80", marginBottom: 8 }}>
              ©{currentYear} myScheme &bull; GovBridge
            </div>
            <div style={{ fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.6 }}>
              <strong>Powered by Digital India Corporation (DIC)</strong><br />
              Ministry of Electronics &amp; IT (MeitY)<br />
              Government of India®
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", marginBottom: 12 }}>Quick Links</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#94a3b8" }}>
              <Link href="/about" style={{ color: "#cbd5e1", textDecoration: "none" }}>› About GovBridge</Link>
              <Link href="/contact" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Contact &amp; Nodal Officers</Link>
              <Link href="/services" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Department Services</Link>
              <Link href="/privacy" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Privacy Policy (DPDP Act)</Link>
              <Link href="/accessibility" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Accessibility Statement</Link>
              <Link href="/terms" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Terms &amp; Conditions</Link>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", marginBottom: 12 }}>Useful Portals</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { name: "Digital India", image: "/useful_digital_india.png", url: "https://digitalindia.gov.in" },
                { name: "DigiLocker", image: "/useful_digilocker.png", url: "https://digilocker.gov.in" },
                { name: "UMANG", image: "/useful_umang.png", url: "https://web.umang.gov.in" },
                { name: "india.gov.in", image: "/useful_india_gov.png", url: "https://india.gov.in" },
                { name: "myGov", image: "/useful_mygov.png", url: "https://mygov.in" },
                { name: "data.gov.in", image: "/useful_data_gov.png", url: "https://data.gov.in" },
                { name: "IGOD Portal", image: "/useful_igod.png", url: "https://igod.gov.in" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={`Open ${item.name} Official Portal`}
                  style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    padding: "4px 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    textDecoration: "none",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 36,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", marginBottom: 12 }}>Get in Touch</div>
            <div style={{ fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.6 }}>
              4th Floor, NeGD, Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi - 110003, India<br /><br />
              <strong>Support Email:</strong> support-myscheme[at]digitalindia[dot]gov[dot]in<br />
              <strong>Helpline:</strong> (011) 24303714 (9:00 AM to 5:30 PM IST)
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#94a3b8" }}>
          <div>Last Updated: 28/09/2026 | GovBridge Enterprise Release</div>
          <div>*Compliant with WCAG 2.1 AA &amp; Digital Personal Data Protection (DPDP) Act 2023</div>
        </div>
      </div>
    </footer>
  );
}
