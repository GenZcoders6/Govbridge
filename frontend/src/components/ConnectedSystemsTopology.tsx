"use client";
import { useState } from "react";

interface SystemNode {
  id: string;
  name: string;
  shortName: string;
  protocol: "REST / JSON" | "SOAP / XML" | "DATABASE / SQL";
  port: number;
  latency: number;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  schema: string;
  demoId: string;
}

const CONNECTED_SYSTEMS: SystemNode[] = [
  {
    id: "identity",
    name: "State Identity Authority",
    shortName: "Identity Authority",
    protocol: "REST / JSON",
    port: 8001,
    latency: 38,
    icon: "🪪",
    color: "#0284c7",
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
    description: "Federated Citizen Identity verification and demographic validation",
    schema: "identity_uid_v1 (Demographics, KYC)",
    demoId: "MAHA-CIT-10284",
  },
  {
    id: "education",
    name: "Higher & Technical Education Dept",
    shortName: "Higher Education",
    protocol: "REST / JSON",
    port: 8002,
    latency: 52,
    icon: "🎓",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    description: "Accredited university degrees, AICTE marksheets, and institution validation",
    schema: "education_degree_v1 (B.Tech, CGPA 8.7)",
    demoId: "EDU-MH-2021-8842",
  },
  {
    id: "skill",
    name: "Ministry of Skill Development & Entrepreneurship",
    shortName: "Skill Mission (MSDE)",
    protocol: "SOAP / XML",
    port: 8004,
    latency: 84,
    icon: "⚙️",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    description: "Legacy WSDL/SOAP endpoint for NSQF certified skill verification",
    schema: "msde_cert_v1 (NSQF Level 6, NSDC)",
    demoId: "SKILL-CERT-8841",
  },
  {
    id: "employment",
    name: "State Employment Exchange Registry",
    shortName: "Employment Exchange",
    protocol: "REST / JSON",
    port: 8003,
    latency: 46,
    icon: "💼",
    color: "#059669",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    description: "Active job status, employer registration, and apprenticeship tracking",
    schema: "employment_status_v1 (Apprentice Trainee)",
    demoId: "EMP-49382",
  },
  {
    id: "revenue",
    name: "State Revenue Board & Direct Taxes",
    shortName: "Revenue Board",
    protocol: "DATABASE / SQL",
    port: 8005,
    latency: 14,
    icon: "🏛️",
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    description: "Direct SQL connection to local revenue tables for EWS income verification",
    schema: "revenue_pan_v1 (Declared Income: ₹1,80,000)",
    demoId: "PAN-ABCDE1234F",
  },
  {
    id: "welfare",
    name: "Social Welfare & BOCW Board",
    shortName: "BOCW Welfare Board",
    protocol: "REST / JSON",
    port: 8006,
    latency: 41,
    icon: "🤝",
    color: "#db2777",
    bgColor: "#fdf2f8",
    borderColor: "#fbcfe8",
    description: "Direct Benefit Transfer (DBT) disbursal and welfare scheme matching",
    schema: "welfare_direct_v1 (DBT Seeded)",
    demoId: "BOCW-2024-9912",
  },
];

export function ConnectedSystemsTopology({ onOpenDemo }: { onOpenDemo?: (step: number) => void }) {
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(CONNECTED_SYSTEMS[1]);

  return (
    <div
      className="card section-gap"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1.5px solid #e2e8f0",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          padding: "18px 24px",
          background: "linear-gradient(135deg, #071529 0%, #0f2d5e 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🌐</span>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>
              Heterogeneous Connected Systems Topology
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(34, 197, 94, 0.2)",
                color: "#4ade80",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              6 REGISTRIES CONNECTED
            </span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", marginTop: 4 }}>
            &ldquo;Connect government systems. Don&rsquo;t replace them.&rdquo; · Disparate REST/JSON, SOAP/XML, and SQL technologies unified.
          </div>
        </div>

        {onOpenDemo && (
          <button
            onClick={() => onOpenDemo(4)}
            style={{
              padding: "7px 15px",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <span>🔗 View Connector Architecture</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Main Diagram Area */}
      <div style={{ padding: "24px" }}>
        {/* Systems Grid around Central GovBridge Hub */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.6fr 1.2fr",
            gap: "20px",
            alignItems: "center",
          }}
        >
          {/* Left Column: Systems 1, 2, 3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {CONNECTED_SYSTEMS.slice(0, 3).map((sys) => {
              const isSelected = selectedNode?.id === sys.id;
              return (
                <div
                  key={sys.id}
                  onClick={() => setSelectedNode(sys)}
                  style={{
                    padding: "14px 16px",
                    background: sys.bgColor,
                    border: `1.5px solid ${isSelected ? sys.color : sys.borderColor}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    boxShadow: isSelected ? `0 6px 18px ${sys.color}25` : "0 2px 4px rgba(0,0,0,0.02)",
                    transform: isSelected ? "translateX(4px)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{sys.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{sys.shortName}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: sys.protocol.includes("SOAP") ? "#ede9fe" : "#e0f2fe",
                        color: sys.protocol.includes("SOAP") ? "#7c3aed" : "#0284c7",
                      }}
                    >
                      {sys.protocol}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                    <span>Port :{sys.port}</span>
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>● {sys.latency}ms</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Column: GovBridge Interoperability Hub */}
          <div
            style={{
              padding: "24px 20px",
              background: "linear-gradient(145deg, #071529 0%, #0c2044 100%)",
              borderRadius: "16px",
              border: "2px solid #2563eb",
              boxShadow: "0 12px 36px rgba(37, 99, 235, 0.2)",
              color: "#ffffff",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Center Header */}
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #2563eb, #38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                margin: "0 auto 12px auto",
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)",
              }}
            >
              🛡️
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", color: "#ffffff" }}>
              GovBridge Engine
            </div>
            <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.65)", marginBottom: 16 }}>
              Governed Interoperability &amp; Service Layer
            </div>

            {/* Core Capabilities Inside GovBridge */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
              {[
                { title: "Protocol Translators", sub: "REST ⇄ SOAP/XML ⇄ SQL Direct", icon: "⇌" },
                { title: "Canonical Data Model", sub: "JSON-LD & Common Schema Maps", icon: "📐" },
                { title: "DPDP Act Consent Engine", sub: "Explicit, Purpose-Bound Tokens", icon: "🔐" },
                { title: "11-Step Workflow Machine", sub: "Cross-Department State Execution", icon: "⚙️" },
                { title: "Cryptographic SHA-256", sub: "Tamper-Proof Chained Audit Ledger", icon: "🛡️" },
              ].map((cap) => (
                <div
                  key={cap.title}
                  style={{
                    padding: "7px 10px",
                    background: "rgba(255, 255, 255, 0.06)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#38bdf8" }}>{cap.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc" }}>{cap.title}</div>
                    <div style={{ fontSize: 9.5, color: "#94a3b8" }}>{cap.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Indicator */}
            <div
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: "9999px",
                background: "rgba(34, 197, 94, 0.15)",
                color: "#4ade80",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
              API GATEWAY :8000 LIVE
            </div>
          </div>

          {/* Right Column: Systems 4, 5, 6 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {CONNECTED_SYSTEMS.slice(3, 6).map((sys) => {
              const isSelected = selectedNode?.id === sys.id;
              return (
                <div
                  key={sys.id}
                  onClick={() => setSelectedNode(sys)}
                  style={{
                    padding: "14px 16px",
                    background: sys.bgColor,
                    border: `1.5px solid ${isSelected ? sys.color : sys.borderColor}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    boxShadow: isSelected ? `0 6px 18px ${sys.color}25` : "0 2px 4px rgba(0,0,0,0.02)",
                    transform: isSelected ? "translateX(-4px)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{sys.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{sys.shortName}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: sys.protocol.includes("SQL") ? "#fef3c7" : "#fdf2f8",
                        color: sys.protocol.includes("SQL") ? "#b45309" : "#db2777",
                      }}
                    >
                      {sys.protocol}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                    <span>Port :{sys.port}</span>
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>● {sys.latency}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Registry Inspector Drawer */}
        {selectedNode && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              background: "#f8fafc",
              border: `1.5px solid ${selectedNode.borderColor}`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{selectedNode.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                  Selected Registry: {selectedNode.name}
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  {selectedNode.description} · Schema: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{selectedNode.schema}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  padding: "4px 10px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#1e293b",
                }}
              >
                Sample ID: <strong>{selectedNode.demoId}</strong>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "#dcfce7",
                  color: "#15803d",
                }}
              >
                ● 200 OK
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
