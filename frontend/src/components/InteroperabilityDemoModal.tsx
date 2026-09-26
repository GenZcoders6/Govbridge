"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InteroperabilityDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

interface DemoStep {
  id: number;
  label: string;
  shortTag: string;
  title: string;
  pillar: string;
  judgeTakeaway: string;
  technicalDetails: {
    protocol: string;
    targetSystem: string;
    endpoint: string;
    executionTime: string;
  };
  payloadType: "json" | "xml" | "comparison" | "topology" | "audit_chain" | "timeline";
  content: any;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    label: "Application",
    shortTag: "1. App",
    title: "Citizen Submits Unified Service Request",
    pillar: "Pillar 1: Fragmented Systems Unified",
    judgeTakeaway:
      "Instead of forcing citizens to apply separately at 5 different departments, GovBridge provides a single unified entry point (APP-2026-1048) for complex multi-registry schemes.",
    technicalDetails: {
      protocol: "HTTPS / REST (JSON-LD)",
      targetSystem: "GovBridge Citizen Gateway",
      endpoint: "/api/applications/APP-2026-1048",
      executionTime: "< 15ms",
    },
    payloadType: "json",
    content: {
      reference_number: "APP-2026-1048",
      scheme: "Unified Skill & Employment Benefit Application",
      applicant: {
        name: "Sunil Patil",
        dob: "1998-05-14",
        mobile: "+919876543284",
        master_citizen_id: "MAHA-CIT-10284",
        address: "42, Shaniwar Peth, Pune, Maharashtra 411030",
      },
      requested_benefit: "Apprenticeship Skill Stipend (INR 8,000/mo DBT)",
      required_verifications: ["Identity", "Higher Education", "Skill Certification", "Employment Status", "Tax Revenue"],
      submission_channel: "GovBridge Citizen Interoperability Portal v2.0",
      status: "SUBMITTED",
    },
  },
  {
    id: 2,
    label: "Consent",
    shortTag: "2. Consent",
    title: "DPDP Act Digital Consent Token Granted",
    pillar: "Pillar 5: Security, Governance & Auditability",
    judgeTakeaway:
      "Zero data is requested or exchanged without explicit citizen consent. Under India's Digital Personal Data Protection Act (DPDP), consent is purpose-bound, time-limited, and revocable at any second.",
    technicalDetails: {
      protocol: "JWT Cryptographic Token / SHA-256",
      targetSystem: "GovBridge DPDP Consent Engine",
      endpoint: "/api/consents/CNS-2026-1048-ACTIVE",
      executionTime: "12ms",
    },
    payloadType: "json",
    content: {
      consent_id: "CNS-2026-1048-ACTIVE",
      citizen_id: "MAHA-CIT-10284 (Sunil Patil)",
      purpose: "Unified Skill & Employment Benefit Application Verification",
      authorized_data_scopes: [
        "identity.demographic",
        "education.degree_and_marks",
        "skill.nsqf_certification",
        "employment.active_status",
        "revenue.income_bracket",
      ],
      legal_basis: "DPDP Act Section 6(1) Explicit Digital Consent",
      valid_from: "2026-09-26T08:18:56Z",
      valid_until: "2026-12-25T08:18:56Z (90 Days)",
      revocable_anytime: true,
      status: "ACTIVE",
    },
  },
  {
    id: 3,
    label: "Identity",
    shortTag: "3. Identity",
    title: "Federated Identity Resolution Without Data Pooling",
    pillar: "Pillar 2: Connect Without Replacing",
    judgeTakeaway:
      "GovBridge does NOT replace existing department IDs. It securely resolves Master Citizen ID (MAHA-CIT-10284) to departmental identifiers while strictly preventing cross-department correlation.",
    technicalDetails: {
      protocol: "Encrypted Federated Mapping Table",
      targetSystem: "GovBridge Identity Broker",
      endpoint: "/api/identity/MAHA-CIT-10284/mappings",
      executionTime: "24ms",
    },
    payloadType: "json",
    content: {
      master_citizen_id: "MAHA-CIT-10284",
      federated_mappings: [
        { department: "Higher Education Dept", local_id: "EDU-MH-2021-8842", schema: "education_degree_v1" },
        { department: "Skill Development Mission", local_id: "SKILL-CERT-8841", schema: "msde_cert_v1" },
        { department: "Employment Exchange", local_id: "EMP-49382", schema: "employment_status_v1" },
        { department: "State Revenue Board", local_id: "PAN-ABCDE1234F", schema: "revenue_pan_v1" },
        { department: "BOCW Welfare Board", local_id: "BOCW-2024-9912", schema: "welfare_direct_v1" },
      ],
      confidence_score: 0.994,
      cross_department_id_leakage: "BLOCKED_BY_POLICY",
    },
  },
  {
    id: 4,
    label: "Connectors",
    shortTag: "4. Connectors",
    title: "Standardized Connector Abstraction Layer",
    pillar: "Pillar 3: Disparate Technology Adapters",
    judgeTakeaway:
      "All external government registries connect via reusable BaseConnector adapters providing uniform health check, authentication, rate limiting, and failure containment across 6 live microservices.",
    technicalDetails: {
      protocol: "BaseConnector Architecture (Python / AsyncIO)",
      targetSystem: "Connector Registry & Health Monitor",
      endpoint: "/api/connectors",
      executionTime: "31ms",
    },
    payloadType: "json",
    content: {
      active_connectors: 6,
      connector_registry: [
        { id: "higher_education_dept", type: "REST / JSON", port: 8002, latency_ms: 52, status: "HEALTHY" },
        { id: "skill_development_mission", type: "SOAP / XML", port: 8004, latency_ms: 84, status: "HEALTHY" },
        { id: "employment_exchange_registry", type: "REST / JSON", port: 8003, latency_ms: 46, status: "HEALTHY" },
        { id: "revenue_tax_registry", type: "DATABASE / SQL", port: 8005, latency_ms: 14, status: "HEALTHY" },
        { id: "welfare_dbt_board", type: "REST / JSON", port: 8006, latency_ms: 41, status: "HEALTHY" },
        { id: "state_identity_authority", type: "REST / JSON", port: 8001, latency_ms: 38, status: "HEALTHY" },
      ],
      system_architecture: "Zero replacement of legacy registries required",
    },
  },
  {
    id: 5,
    label: "REST",
    shortTag: "5. REST",
    title: "Real-Time Modern REST/JSON Query Ingestion",
    pillar: "Pillar 3: Disparate Technology Adapters",
    judgeTakeaway:
      "GovBridge executes sub-100ms async HTTP requests to modern department microservices with mutual TLS and OpenAPI schema validation, retrieving verified degree credentials instantly.",
    technicalDetails: {
      protocol: "HTTP/1.1 REST (JSON)",
      targetSystem: "Higher Education Department (Mock Port 8002)",
      endpoint: "http://127.0.0.1:8002/api/education/verify",
      executionTime: "52ms",
    },
    payloadType: "json",
    content: {
      http_status: 200,
      protocol: "REST / JSON",
      endpoint: "http://127.0.0.1:8002/api/education/verify?id=EDU-MH-2021-8842",
      raw_response: {
        education_id: "EDU-MH-2021-8842",
        institution: "Pune Institute of Technology",
        degree: "Bachelor of Technology (B.Tech)",
        branch: "Computer Science & Engineering",
        year_of_passing: 2021,
        cgpa: 8.7,
        division: "First Class with Distinction",
        is_verified: true,
      },
    },
  },
  {
    id: 6,
    label: "SOAP/XML",
    shortTag: "6. SOAP/XML",
    title: "Legacy SOAP/XML Envelope Ingestion & Parsing",
    pillar: "Pillar 3: Disparate Technology Adapters",
    judgeTakeaway:
      "GovBridge bridges legacy government servers without demanding code rewrites. It dynamically constructs SOAP envelopes and parses XML payloads from the Ministry of Skill Development.",
    technicalDetails: {
      protocol: "SOAP 1.1 / XML (WSDL Bound)",
      targetSystem: "Skill Development Mission (Mock Port 8004)",
      endpoint: "http://127.0.0.1:8004/ws/SkillVerificationService",
      executionTime: "84ms",
    },
    payloadType: "xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:msde="http://msde.gov.in/skill/v1">
  <soapenv:Header>
    <msde:GovBridgeAuthToken>BEARER-TOKEN-VERIFIED</msde:GovBridgeAuthToken>
  </soapenv:Header>
  <soapenv:Body>
    <msde:GetSkillCertificationResponse>
      <msde:CitizenId>MAHA-CIT-10284</msde:CitizenId>
      <msde:Certification>
        <msde:Name>Advanced Python &amp; Cloud Infrastructure</msde:Name>
        <msde:Level>NSQF Level 6</msde:Level>
        <msde:CertificateNumber>SKILL-CERT-8841</msde:CertificateNumber>
        <msde:Issuer>National Skill Development Corporation (NSDC)</msde:Issuer>
        <msde:ValidUntil>PERPETUAL</msde:ValidUntil>
        <msde:Status>ACTIVE_VALID</msde:Status>
      </msde:Certification>
    </msde:GetSkillCertificationResponse>
  </soapenv:Body>
</soapenv:Envelope>`,
  },
  {
    id: 7,
    label: "Transformation",
    shortTag: "7. Transform",
    title: "Schema Transformation to Canonical Data Model (CDM)",
    pillar: "Pillar 3 & 4: Common Data Model & Coordination",
    judgeTakeaway:
      "GovBridge normalizes wildly different schemas (XML tags, REST payloads, SQL table rows) into uniform GovBridge Canonical Data Models (CDM) for policy evaluation.",
    technicalDetails: {
      protocol: "JSON-LD / CDM Transformer Engine",
      targetSystem: "GovBridge Data Transformation Layer",
      endpoint: "/api/schema-mappings/transform",
      executionTime: "8ms",
    },
    payloadType: "comparison",
    content: {
      raw_input: {
        format: "Legacy SOAP / XML",
        snippet: "<msde:Name>Advanced Python & Cloud Infrastructure</msde:Name><msde:Level>NSQF Level 6</msde:Level>",
      },
      canonical_output: {
        schema_version: "govbridge.cdm.skills.v1",
        person_id: "MAHA-CIT-10284",
        certified_skills: ["Python Development", "Cloud Systems", "Microservices"],
        highest_nsqf_level: 6,
        accreditation_agency: "NSDC",
        is_active: true,
      },
    },
  },
  {
    id: 8,
    label: "Workflow",
    shortTag: "8. Workflow",
    title: "11-Step Cross-Department Orchestration State Machine",
    pillar: "Pillar 4: Coordinates Multi-Department Workflows",
    judgeTakeaway:
      "The GovBridge Workflow Engine coordinates 11 sequential and parallel steps across 5 departments with rule evaluation, automated checks, and human-in-the-loop fallback review.",
    technicalDetails: {
      protocol: "Async Orchestration Engine (State Machine)",
      targetSystem: "GovBridge Workflow Controller",
      endpoint: "/api/workflows/APP-2026-1048",
      executionTime: "11 Steps Completed",
    },
    payloadType: "timeline",
    content: [
      { step: 1, name: "Application Created", dept: "GovBridge Portal", status: "COMPLETED", latency: "5ms" },
      { step: 2, name: "Identity Verification", dept: "Identity Authority (REST)", status: "COMPLETED", latency: "38ms" },
      { step: 3, name: "Consent Validation", dept: "DPDP Consent Gateway", status: "COMPLETED", latency: "12ms" },
      { step: 4, name: "Education Verification", dept: "Higher Education Dept (REST)", status: "COMPLETED", latency: "52ms" },
      { step: 5, name: "Skill Verification", dept: "Skill Mission (SOAP/XML)", status: "COMPLETED", latency: "84ms" },
      { step: 6, name: "Employment Verification", dept: "Employment Exchange (REST)", status: "COMPLETED", latency: "46ms" },
      { step: 7, name: "Income Verification", dept: "State Revenue Board (SQL DB)", status: "COMPLETED", latency: "14ms" },
      { step: 8, name: "Eligibility Evaluation", dept: "Automated Policy Engine", status: "COMPLETED", latency: "18ms" },
      { step: 9, name: "Department Review", dept: "Officer Review Gate", status: "COMPLETED", latency: "Instant" },
      { step: 10, name: "Decision", dept: "Sanction Authority", status: "COMPLETED", latency: "DBT Issued" },
      { step: 11, name: "Application Completed", dept: "GovBridge Interoperability Core", status: "COMPLETED", latency: "Finalized" },
    ],
  },
  {
    id: 9,
    label: "Event",
    shortTag: "9. Event",
    title: "Event-Driven Processing & Telemetry Stream",
    pillar: "Pillar 5: Security, Resilience & Tracking",
    judgeTakeaway:
      "All lifecycle transitions trigger asynchronous events published to Redis and persisted to PostgreSQL, powering real-time citizen notifications and officer audit telemetry.",
    technicalDetails: {
      protocol: "Redis Pub/Sub & PostgreSQL Event Log",
      targetSystem: "GovBridge Event Bus",
      endpoint: "/api/events?application_id=APP-2026-1048",
      executionTime: "< 2ms publish latency",
    },
    payloadType: "json",
    content: {
      channel: "govbridge:events:unified_benefit",
      published_events: [
        { type: "APPLICATION_CREATED", ref: "APP-2026-1048", citizen: "Sunil Patil", time: "08:18:47Z" },
        { type: "CONSENT_GRANTED", ref: "APP-2026-1048", scope: "ALL_DEPARTMENTS", time: "08:18:56Z" },
        { type: "CONNECTOR_DISPATCH", connector: "skill_development_mission (SOAP)", time: "08:19:02Z" },
        { type: "WORKFLOW_STEP_COMPLETED", step: "Income Verification (SQL)", time: "08:19:04Z" },
        { type: "POLICY_ELIGIBILITY_PASSED", recommendation: "APPROVE", time: "08:19:05Z" },
        { type: "BENEFIT_SANCTIONED", amount_inr: 8000, channel: "DBT", time: "08:19:06Z" },
      ],
    },
  },
  {
    id: 10,
    label: "Failure/Retry",
    shortTag: "10. Resilience",
    title: "Resilience, Chaos Handling & Dead-Letter Recovery",
    pillar: "Pillar 5: High Availability & Resilience",
    judgeTakeaway:
      "When a department registry experiences network drops or timeouts, GovBridge executes exponential backoff retries, records exceptions, and routes to a recovery queue with zero manual database tampering.",
    technicalDetails: {
      protocol: "Circuit Breaker + Exponential Backoff",
      targetSystem: "GovBridge Exception & Retry Engine",
      endpoint: "/api/workflows/APP-2026-1048/retry",
      executionTime: "Automated 3-Attempt Recovery",
    },
    payloadType: "json",
    content: {
      resilience_mechanism: "Circuit Breaker + Dead-Letter Queue",
      simulated_event: "Employment Registry 504 Gateway Timeout",
      retry_policy: {
        max_attempts: 3,
        backoff_strategy: "Exponential (1s, 2s, 4s)",
        jitter: true,
      },
      execution_log: [
        { attempt: 1, status: "TIMEOUT (504)", action: "Logged exception, backed off 1.0s" },
        { attempt: 2, status: "TIMEOUT (504)", action: "Logged exception, backed off 2.0s" },
        { attempt: 3, status: "SUCCESS (200 OK)", action: "Connector reconnected, resumed pipeline" },
      ],
      dlq_recovery: "1-Click Self-Healing via POST /api/workflows/{id}/retry",
      data_loss: "0 records lost",
    },
  },
  {
    id: 11,
    label: "Audit",
    shortTag: "11. Audit",
    title: "Cryptographic SHA-256 Tamper-Proof Audit Trail",
    pillar: "Pillar 5: Complete Auditability & Trust",
    judgeTakeaway:
      "Every single query, transformation, and decision is cryptographically chained with SHA-256 parent-child hashes. Any unauthorized tampering in the database immediately invalidates the cryptographic seal.",
    technicalDetails: {
      protocol: "SHA-256 Chained Hash Ledger",
      targetSystem: "GovBridge Audit Service",
      endpoint: "/api/audit/verify",
      executionTime: "11/11 Blocks Intact",
    },
    payloadType: "audit_chain",
    content: [
      {
        block: 1,
        action: "APPLICATION_CREATED",
        curr_hash: "9183b7d17c904bf8ba92a18e57ae8afb...",
        prev_hash: "GENESIS_00000000000000000000000...",
        status: "VALID",
      },
      {
        block: 4,
        action: "EDUCATION_VERIFIED_REST",
        curr_hash: "ddb2cca2b9ec4985fed3909860981fd...",
        prev_hash: "9183b7d17c904bf8ba92a18e57ae8afb...",
        status: "VALID",
      },
      {
        block: 5,
        action: "SKILL_VERIFIED_SOAP",
        curr_hash: "7c0bda0c8d974e12a11694f25cc6144...",
        prev_hash: "ddb2cca2b9ec4985fed3909860981fd...",
        status: "VALID",
      },
      {
        block: 10,
        action: "BENEFIT_SANCTIONED_DBT",
        curr_hash: "a4901f4c781190bcda110998317719f...",
        prev_hash: "7c0bda0c8d974e12a11694f25cc6144...",
        status: "VALID",
      },
    ],
  },
  {
    id: 12,
    label: "Unified Status",
    shortTag: "12. Status",
    title: "Unified Real-Time Tracking & Instant Sanction",
    pillar: "Pillar 1-5: The Final Judge Demonstration",
    judgeTakeaway:
      "All five fragmented departments are now united: The citizen tracks their application in real time with zero physical office visits, and the state government issues the DBT sanction in 2 minutes instead of 45 days.",
    technicalDetails: {
      protocol: "GovBridge Full-Stack Interoperability",
      targetSystem: "Citizen Portal & Officer Tracking",
      endpoint: "/applications/APP-2026-1048",
      executionTime: "100% Verified in 130s",
    },
    payloadType: "json",
    content: {
      reference_number: "APP-2026-1048",
      applicant: "Sunil Patil (MAHA-CIT-10284)",
      overall_status: "COMPLETED",
      verifications_passed: "5 / 5 External Registries Authenticated",
      decision: "BENEFIT_SANCTIONED",
      sanction_details: {
        sanction_order: "MH-GOV-SANCT-2026-9812",
        scheme_name: "National Apprenticeship Promotion Scheme (NAPS)",
        monthly_stipend: "INR 8,000 / month",
        disbursal_cadence: "12 Months (Total: INR 96,000)",
        disbursal_channel: "Direct Benefit Transfer (DBT)",
        bank_account: "SBI A/C ****4412 (Aadhaar Seeded)",
      },
      time_saved: "Reduced from 45 days manual paperwork to 2 minutes automated orchestration",
    },
  },
];

export function InteroperabilityDemoModal({ isOpen, onClose, initialStep = 1 }: InteroperabilityDemoModalProps) {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState(initialStep - 1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(4);

  // Sync initialStep if prop changes
  useEffect(() => {
    if (initialStep >= 1 && initialStep <= DEMO_STEPS.length) {
      setCurrentStepIdx(initialStep - 1);
    }
  }, [initialStep]);

  const step = DEMO_STEPS[currentStepIdx];

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !autoPlay) return;

    const timer = setInterval(() => {
      setAutoPlayCountdown((prev) => {
        if (prev <= 1) {
          setCurrentStepIdx((curr) => {
            if (curr >= DEMO_STEPS.length - 1) {
              setAutoPlay(false);
              return curr;
            }
            return curr + 1;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, autoPlay]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        if (currentStepIdx < DEMO_STEPS.length - 1) {
          setCurrentStepIdx((c) => c + 1);
          setAutoPlayCountdown(4);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStepIdx > 0) {
          setCurrentStepIdx((c) => c - 1);
          setAutoPlayCountdown(4);
        }
      } else if (e.key === " ") {
        setAutoPlay((p) => !p);
      }
    },
    [isOpen, currentStepIdx, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const goToNext = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setAutoPlayCountdown(4);
    }
  };

  const goToPrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setAutoPlayCountdown(4);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(5, 13, 31, 0.85)",
        backdropFilter: "blur(10px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1080px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          animation: "scaleIn 0.22s ease-out",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: "16px 24px",
            background: "linear-gradient(135deg, #071529 0%, #0c2044 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "9px",
                background: "linear-gradient(135deg, #2563eb, #38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                boxShadow: "0 0 16px rgba(37, 99, 235, 0.4)",
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
                  GovBridge Interoperability Demonstration
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#4ade80",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                >
                  SIH 2026 Jury Mode
                </span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)", marginTop: 2 }}>
                Step {step.id} of {DEMO_STEPS.length} · Live Architecture Walkthrough
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Auto Play Button */}
            <button
              onClick={() => {
                setAutoPlay(!autoPlay);
                setAutoPlayCountdown(4);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 13px",
                background: autoPlay ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${autoPlay ? "#22c55e" : "rgba(255, 255, 255, 0.2)"}`,
                borderRadius: "8px",
                color: autoPlay ? "#4ade80" : "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {autoPlay ? (
                <>
                  <span>⏸ Pause</span>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "rgba(34, 197, 94, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {autoPlayCountdown}s
                  </span>
                </>
              ) : (
                <>
                  <span>▶ Auto-Play (4s)</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              title="Close demonstration (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 12-Step Stepper Bar */}
        <div
          style={{
            padding: "10px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
          }}
        >
          {DEMO_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  setAutoPlayCountdown(4);
                }}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: isCurrent
                    ? "1.5px solid #2563eb"
                    : isCompleted
                    ? "1px solid #bbf7d0"
                    : "1px solid #e2e8f0",
                  background: isCurrent ? "#eff6ff" : isCompleted ? "#f0fdf4" : "#ffffff",
                  color: isCurrent ? "#1d4ed8" : isCompleted ? "#15803d" : "#64748b",
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.12s ease",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: isCurrent ? "#2563eb" : isCompleted ? "#22c55e" : "#cbd5e1",
                    color: "#ffffff",
                    fontSize: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {isCompleted ? "✓" : s.id}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Main Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: "24px",
            background: "#ffffff",
          }}
        >
          {/* Left Column: Context, Pillar, & Judge Takeaway */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Pillar Tag */}
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#1d4ed8",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {step.pillar}
              </span>
            </div>

            {/* Title */}
            <div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#071529",
                  margin: "0 0 6px 0",
                  lineHeight: 1.25,
                }}
              >
                {step.title}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    background: "#f1f5f9",
                    borderRadius: "4px",
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Protocol: {step.technicalDetails.protocol}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    background: "#f1f5f9",
                    borderRadius: "4px",
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Target: {step.technicalDetails.targetSystem}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    border: "1px solid #bbf7d0",
                    borderRadius: "4px",
                    fontWeight: 700,
                  }}
                >
                  Latency: {step.technicalDetails.executionTime}
                </span>
              </div>
            </div>

            {/* The Judge Takeaway Box (Hero Callout) */}
            <div
              style={{
                padding: "16px 18px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                border: "1.5px solid #86efac",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#15803d",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  marginBottom: 6,
                }}
              >
                <span>💡 What The Judge Must Understand</span>
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "#166534",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.judgeTakeaway}
              </p>
            </div>

            {/* Technical Context Card */}
            <div
              style={{
                padding: "14px 16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: 12,
                color: "#475569",
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                Interoperability Layer Action:
              </div>
              <div>
                Endpoint:{" "}
                <code
                  style={{
                    background: "#e2e8f0",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#0f172a",
                  }}
                >
                  {step.technicalDetails.endpoint}
                </code>
              </div>
            </div>
          </div>

          {/* Right Column: Live Data / Payload / Output */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#071529",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Terminal / Code Window Header */}
            <div
              style={{
                padding: "10px 14px",
                background: "#0c2044",
                borderBottom: "1px solid #1e293b",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ marginLeft: 8, fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                  {step.payloadType === "xml"
                    ? "soap_envelope.xml"
                    : step.payloadType === "timeline"
                    ? "orchestration_pipeline.status"
                    : step.payloadType === "audit_chain"
                    ? "sha256_audit_ledger.chain"
                    : "live_payload.json"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                }}
              >
                LIVE SYSTEM DATA
              </span>
            </div>

            {/* Terminal Body */}
            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
                fontSize: 12,
                lineHeight: 1.55,
                color: "#e2e8f0",
              }}
            >
              {step.payloadType === "xml" ? (
                <pre style={{ margin: 0, color: "#7dd3fc", whiteSpace: "pre-wrap" }}>
                  {step.content}
                </pre>
              ) : step.payloadType === "timeline" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {step.content.map((item: any) => (
                    <div
                      key={item.step}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "6px",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#22c55e",
                            color: "#ffffff",
                            fontSize: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc" }}>
                            {item.step}. {item.name}
                          </div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>{item.dept}</div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#4ade80",
                          fontFamily: "monospace",
                        }}
                      >
                        {item.latency}
                      </span>
                    </div>
                  ))}
                </div>
              ) : step.payloadType === "audit_chain" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {step.content.map((item: any) => (
                    <div
                      key={item.block}
                      style={{
                        padding: "10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                          BLOCK #{item.block}: {item.action}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#4ade80",
                            background: "rgba(34, 197, 94, 0.2)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>
                        Prev Hash: <span style={{ color: "#cbd5e1" }}>{item.prev_hash}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>
                        Curr Hash: <span style={{ color: "#facc15" }}>{item.curr_hash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : step.payloadType === "comparison" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ color: "#f87171", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
                      RAW INCOMING FRAGMENTED DATA:
                    </div>
                    <div
                      style={{
                        padding: "8px 10px",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "6px",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#fca5a5",
                        fontSize: 11,
                      }}
                    >
                      {step.content.raw_input.snippet}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", color: "#38bdf8", fontSize: 14 }}>
                    ↓ TRANSFORMED BY GOVBRIDGE ADAPTER ↓
                  </div>
                  <div>
                    <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
                      CANONICAL DATA MODEL (CDM):
                    </div>
                    <pre style={{ margin: 0, color: "#86efac", fontSize: 11 }}>
                      {JSON.stringify(step.content.canonical_output, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <pre style={{ margin: 0, color: "#a5f3fc", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(step.content, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Keyboard hint */}
          <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
            <span>⌨️ Shortcut:</span>
            <span
              style={{
                padding: "2px 6px",
                background: "#e2e8f0",
                borderRadius: "4px",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              ←
            </span>
            <span
              style={{
                padding: "2px 6px",
                background: "#e2e8f0",
                borderRadius: "4px",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              →
            </span>
            <span>keys to step through ·</span>
            <span
              style={{
                padding: "2px 6px",
                background: "#e2e8f0",
                borderRadius: "4px",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              Space
            </span>
            <span>for auto-play</span>
          </div>

          {/* Stepper Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={goToPrev}
              disabled={currentStepIdx === 0}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: currentStepIdx === 0 ? "#f1f5f9" : "#ffffff",
                color: currentStepIdx === 0 ? "#94a3b8" : "#334155",
                fontSize: 13,
                fontWeight: 600,
                cursor: currentStepIdx === 0 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ← Previous Stage
            </button>

            {currentStepIdx < DEMO_STEPS.length - 1 ? (
              <button
                onClick={goToNext}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                  transition: "all 0.15s ease",
                }}
              >
                <span>Next: {DEMO_STEPS[currentStepIdx + 1].label}</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  router.push("/applications/APP-2026-1048");
                }}
                style={{
                  padding: "9px 22px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                  transition: "all 0.15s ease",
                }}
              >
                <span>🚀 Open Live Tracking (APP-2026-1048)</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
