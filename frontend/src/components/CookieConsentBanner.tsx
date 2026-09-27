"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("gb_cookie_consent");
      if (!consent) {
        setShow(true);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gb_cookie_consent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("gb_cookie_consent", "necessary_only");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 960,
        margin: "0 auto",
        background: "linear-gradient(135deg, #071529 0%, #0c2044 100%)",
        color: "#ffffff",
        padding: "18px 24px",
        borderRadius: 14,
        border: "1.5px solid rgba(56, 189, 248, 0.4)",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>🍪</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#ffffff" }}>
            Privacy &amp; Cookie Consent (DPDP Act 2023 Compliant)
          </span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", margin: 0, lineHeight: 1.5 }}>
          GovBridge uses essential cookies for secure session authentication, role-based access control, and DPDP consent tracking. Read our{" "}
          <Link href="/privacy" style={{ color: "#38bdf8", textDecoration: "underline" }}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" style={{ color: "#38bdf8", textDecoration: "underline" }}>
            Cookie Policy
          </Link>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={handleReject}
          className="btn btn-sm btn-secondary"
          style={{ background: "rgba(255, 255, 255, 0.1)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.25)" }}
        >
          Essential Only
        </button>
        <button
          onClick={handleAccept}
          className="btn btn-sm btn-primary"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff", fontWeight: 700 }}
        >
          Accept All &amp; Continue
        </button>
      </div>
    </div>
  );
}
