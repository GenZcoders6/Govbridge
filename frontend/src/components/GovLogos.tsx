"use client";

import React from "react";

/**
 * 🏛️ Ashoka Emblem of India (State Emblem of India) Vector SVG
 * Features Ashoka Lion Capital, Wheel of Dharma (Ashoka Chakra), and "सत्यमेव जयते"
 */
export function AshokaEmblemLogo({ height = 44, darkBackground = false }: { height?: number; darkBackground?: boolean }) {
  const textColor = darkBackground ? "#ffffff" : "#0f172a";
  const imgSrc = darkBackground ? "/ashoka_emblem_official_white.png" : "/ashoka_emblem_official_dark.png";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, userSelect: "none" }}>
      <img
        src={imgSrc}
        alt="Emblem of India"
        style={{
          height: height,
          width: "auto",
          objectFit: "contain",
          filter: darkBackground ? "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" : "none",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: Math.max(11, height * 0.28), fontWeight: 900, color: textColor, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          भारत सरकार
        </span>
        <span style={{ fontSize: Math.max(9, height * 0.22), fontWeight: 700, color: darkBackground ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Government of India
        </span>
      </div>
    </div>
  );
}

/**
 * 🟢 myScheme Official Portal Logo
 * Features official green & saffron identity with discovery emblem
 */
export function MySchemeLogo({ height = 40, darkBackground = false }: { height?: number; darkBackground?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, userSelect: "none" }}>
      {/* Emblem Badge Icon */}
      <svg width={height * 1.1} height={height} viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="44" height="40" rx="8" fill="url(#mySchemeGrad)" />
        {/* Scheme Search Glass & Star Accent Motif */}
        <path d="M14 20C14 15.5817 17.5817 12 22 12C26.4183 12 30 15.5817 30 20C30 24.4183 26.4183 28 22 28C17.5817 28 14 24.4183 14 20Z" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
        <path d="M28 26L34 32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        {/* Tricolor Star Center */}
        <circle cx="22" cy="20" r="4" fill="#FF9933" />
        <defs>
          <linearGradient id="mySchemeGrad" x1="0" y1="0" x2="44" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16a34a" />
            <stop offset="1" stopColor="#15803d" />
          </linearGradient>
        </defs>
      </svg>
      {/* Typography */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: height * 0.52, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>
          <span style={{ color: darkBackground ? "#4ade80" : "#16a34a" }}>my</span>
          <span style={{ color: darkBackground ? "#ffffff" : "#0f172a" }}>Scheme</span>
          <span style={{ color: "#ea580c", marginLeft: 2 }}>.gov.in</span>
        </div>
        <span style={{ fontSize: Math.max(9, height * 0.22), fontWeight: 700, color: darkBackground ? "#94a3b8" : "#64748b", marginTop: 2 }}>
          One-stop Search &amp; Discovery Platform
        </span>
      </div>
    </div>
  );
}

/**
 * 🌉 GovBridge Official Portal Logo
 * Features National Tricolor Arch Bridge emblem & Official Title
 */
export function GovBridgeLogo({ height = 44, darkBackground = false }: { height?: number; darkBackground?: boolean }) {
  const iconSrc = "/govbridge_icon.png";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, userSelect: "none" }}>
      {/* Official Emblem Icon (Ashoka Pillar, Arch Bridge, Dome, Signal Waves) */}
      <img
        src={iconSrc}
        alt="GovBridge Emblem"
        style={{
          height: height,
          width: "auto",
          objectFit: "contain",
          display: "block",
          filter: darkBackground ? "brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.5))" : "none",
        }}
      />
      {/* GovBridge.gov.in Typography & Subtitle Stack with Indian Flag Tricolor Lines */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: height * 0.48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>
          <span style={{ color: darkBackground ? "#ffffff" : "#0f172a" }}>Gov</span>
          <span style={{ color: "#2563eb" }}>Bridge</span>
          <span style={{ color: darkBackground ? "#cbd5e1" : "#475569", fontSize: height * 0.32, marginLeft: 2, fontWeight: 800 }}>.gov.in</span>
        </div>
        {/* Indian Flag Color Underline Bar */}
        <div style={{ display: "flex", width: "100%", height: 3, margin: "3px 0 2px", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ flex: 1, background: "#f97316" }} />
          <div style={{ flex: 1, background: "#16a34a" }} />
        </div>
        <span style={{ fontSize: Math.max(8, height * 0.18), fontWeight: 800, color: darkBackground ? "#cbd5e1" : "#475569", letterSpacing: "0.04em" }}>
          NATIONAL PUBLIC SERVICES INTEROPERABILITY PORTAL
        </span>
      </div>
    </div>
  );
}

/**
 * 🇮🇳 Digital India Official Crest Logo
 */
export function DigitalIndiaLogo({ height = 36, darkBackground = false }: { height?: number; darkBackground?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, userSelect: "none" }}>
      <svg width={height * 1.1} height={height} viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="18" r="16" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M20 8 V20 M14 14 L20 8 L26 14" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 24 C16 28 24 28 28 24" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: height * 0.42, fontWeight: 900, color: darkBackground ? "#ffffff" : "#0f172a", lineHeight: 1 }}>
          Digital India
        </span>
        <span style={{ fontSize: Math.max(8, height * 0.22), fontWeight: 700, color: darkBackground ? "#94a3b8" : "#64748b" }}>
          Power To Empower
        </span>
      </div>
    </div>
  );
}

/**
 * 🇮🇳 Exact india.gov.in National Portal of India Emblem & Hero Title Stack
 * Replicates white Ashoka Emblem, bold title, Saffron/Green split underline, and subtitle
 */
export function IndiaGovInHeroLogo({ mainTitle = "india.gov.in", subtitle = "National Portal of India" }: { mainTitle?: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 4px 20px rgba(0, 0, 0, 0.7)", userSelect: "none" }}>
      {/* 1. User Uploaded Official High-Resolution Ashoka Emblem Image */}
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
        <img
          src="/ashoka_emblem_official_white.png"
          alt="State Emblem of India - Satyameva Jayate"
          style={{
            height: 96,
            width: "auto",
            filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.8))",
            objectFit: "contain",
          }}
        />
      </div>

      {/* 2. Main Title GovBridge.gov.in */}
      <h1
        style={{
          fontSize: "clamp(40px, 5.5vw, 68px)",
          fontWeight: 900,
          color: "#ffffff",
          margin: "0 0 4px",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {mainTitle}
      </h1>

      {/* 3. Saffron & Green Split Underline Bar (Exact Indian Flag Tricolor Lines) */}
      <div style={{ display: "flex", width: "100%", maxWidth: 540, height: 6, margin: "2px auto 12px", borderRadius: 3, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
        <div style={{ flex: 1, background: "#f97316" }} />
        <div style={{ flex: 1, background: "#16a34a" }} />
      </div>

      {/* 4. Subtitle: National Portal of India */}
      <div
        style={{
          fontSize: "clamp(20px, 2.5vw, 30px)",
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "0.02em",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

/**
 * 🔹 Useful Links Small Dedicated Vector SVG Logos for Footer Pill Cards
 */
export function UsefulLinkLogo({ portal }: { portal: string }) {
  switch (portal) {
    case "Digital India":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#0284c7" strokeWidth="2" strokeDasharray="2 2" />
          <path d="M12 6 V14 M8 10 L12 6 L16 10" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 17 C10 19.5 14 19.5 17 17" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "DigiLocker":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 L19 6 V12 C19 16.5 16 20 12 21 C8 20 5 16.5 5 12 V6 L12 3 Z" fill="#0284c7" />
          <path d="M12 9 C10.5 9 9.5 10 9.5 11.5 V13 H14.5 V11.5 C14.5 10 13.5 9 12 9 Z" fill="#ffffff" />
          <rect x="9" y="13" width="6" height="4.5" rx="1" fill="#ffffff" />
        </svg>
      );
    case "UMANG":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="#dc2626" />
          <path d="M7 8 C7 14 17 14 17 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="16" r="1.5" fill="#ffffff" />
        </svg>
      );
    case "india.gov.in":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L8 7 H16 L12 2 Z" fill="#f97316" />
          <rect x="7" y="8" width="10" height="3" fill="#1e293b" rx="0.5" />
          <circle cx="12" cy="15" r="3.5" stroke="#000080" strokeWidth="1.5" fill="none" />
          <rect x="6" y="20" width="12" height="2" fill="#16a34a" rx="0.5" />
        </svg>
      );
    case "myGov":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 6 C4 4.5 5.5 3 7 3 H17 C18.5 3 20 4.5 20 6 V13 C20 14.5 18.5 16 17 16 H10 L6 19 V16 H7 C5.5 16 4 14.5 4 13 V6 Z" fill="#15803d" />
          <circle cx="12" cy="9.5" r="3" fill="#f97316" />
        </svg>
      );
    case "data.gov.in":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="4" rx="2" fill="#0284c7" />
          <rect x="4" y="10" width="16" height="4" rx="2" fill="#0369a1" />
          <rect x="4" y="16" width="16" height="4" rx="2" fill="#075985" />
          <circle cx="8" cy="6" r="1" fill="#ffffff" />
          <circle cx="8" cy="12" r="1" fill="#ffffff" />
          <circle cx="8" cy="18" r="1" fill="#ffffff" />
        </svg>
      );
    default:
      return <span style={{ fontSize: 14 }}>🌐</span>;
  }
}


