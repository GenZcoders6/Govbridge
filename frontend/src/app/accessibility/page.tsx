"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function AccessibilityPage() {
  return (
    <AppShell title="Accessibility Statement" subtitle="WCAG 2.1 Level AA Compliance & Features">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, textTransform: "uppercase" }}>INCLUSIVE e-GOVERNANCE</div>
          <h1 className="page-header-title">Accessibility Statement</h1>
          <p className="page-header-subtitle">Ensuring accessible, screen-reader friendly e-governance for all citizens regardless of technology or ability.</p>
        </div>
        <Link href="/" className="btn btn-secondary">← Back to Home</Link>
      </div>

      <div className="card" style={{ maxWidth: 900, lineHeight: 1.7, fontSize: 14, color: "#334155" }}>
        <div className="card-body" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>1. Standards Compliance (WCAG 2.1 AA)</h2>
          <p>GovBridge is built to conform with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, ensuring high contrast, clear keyboard focus rings, semantic HTML structure, and screen-reader compatibility.</p>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "24px 0 12px" }}>2. Key Accessibility Features Implemented</h2>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Keyboard-Friendly Forms:</strong> All interactive buttons, form inputs, and modals are fully navigable via <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>Tab</kbd> and <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>Enter</kbd> keys.</li>
            <li><strong>High Colour Contrast:</strong> Curated palette featuring strict contrast ratios (&gt; 4.5:1) for text legibility.</li>
            <li><strong>Alt Text &amp; ARIA Labels:</strong> Icon buttons and visual widgets contain explicit <code style={{ fontWeight: 700 }}>aria-label</code> tags for screen reader software.</li>
            <li><strong>Font Resizing &amp; High Contrast Toggles:</strong> On-demand contrast switching available on the National Portal Header.</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
