"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function CookiesPage() {
  return (
    <AppShell
      requireAuth={false}
      title="Cookies Policy"
      subtitle="Session & Cookie Usage Framework"
      breadcrumb={["Home", "Cookies Policy"]}
    >
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>COOKIE TRANSPARENCY</div>
          <h1 className="page-header-title">Cookies Policy</h1>
          <p className="page-header-subtitle">How GovBridge uses essential cookies for secure session authentication and DPDP consent state.</p>
        </div>
        <Link href="/" className="btn btn-secondary">← Back to Home</Link>
      </div>

      <div className="card" style={{ maxWidth: 900, lineHeight: 1.7, fontSize: 14, color: "#334155" }}>
        <div className="card-body" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>1. Essential Technical Cookies</h2>
          <p>GovBridge uses strictly necessary cookies and local storage tokens (<code style={{ fontWeight: 700 }}>gb_token</code>, <code style={{ fontWeight: 700 }}>gb_user</code>, <code style={{ fontWeight: 700 }}>gb_cookie_consent</code>) to maintain secure encrypted JWT sessions for signed-in citizens, officers, and administrators.</p>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>2. No Third-Party Tracking Cookies</h2>
          <p>We do not deploy third-party advertising cookies or cross-site tracking pixels. All cookie preferences are managed directly on the platform in compliance with the DPDP Act 2023.</p>
        </div>
      </div>
    </AppShell>
  );
}
