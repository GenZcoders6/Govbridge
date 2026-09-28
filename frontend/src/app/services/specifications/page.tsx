"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function ServiceDetailsPage() {
  const [activeTab, setActiveTab] = useState("Required Information");

  const tabs = [
    "Basic Information",
    "Eligibility",
    "Required Information",
    "Verification Rules",
    "API / Integration",
    "Documents",
    "Workflow",
    "Security",
    "Audit",
  ];

  return (
    <AppShell title="Service Details" breadcrumb={["Home", "Department Officer", "Services", "UIDAI-KYC-001 Details"]}>
      <div className="gov-page-header">
        <div>
          <h1 className="gov-page-title">Service Details</h1>
          <div className="gov-page-subtitle">Specification &amp; Interoperability Definition for UIDAI-KYC-001</div>
        </div>
        <Link href="/services" className="gov-btn gov-btn-secondary">
          &larr; Back to Catalogue
        </Link>
      </div>

      {/* Service Summary Detail Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>UIDAI Aadhaar E-KYC Authentication Service (UIDAI-KYC-001)</span>
          <span className="gov-badge gov-badge-success">ACTIVE PRODUCTION</span>
        </div>
        <div className="gov-panel-body" style={{ padding: 0 }}>
          <table className="gov-detail-table">
            <tbody>
              <tr>
                <th>Service Name</th>
                <td>UIDAI Aadhaar E-KYC Authentication Service</td>
                <th>Service Code</th>
                <td><code>UIDAI-KYC-001</code></td>
              </tr>
              <tr>
                <th>Owning Department</th>
                <td>Unique Identification Authority of India (UIDAI)</td>
                <th>Implementing Agency</th>
                <td>Authorized Requesting Entity Ecosystem (AUA / KUA)</td>
              </tr>
              <tr>
                <th>Service Category</th>
                <td>Identity Verification &amp; Demographic Auth</td>
                <th>SLA / Turnaround Time</th>
                <td>Instant (Real-time Sync &lt; 2s)</td>
              </tr>
              <tr>
                <th>Security Protocol</th>
                <td>Mutual TLS (mTLS) + RSA 2048 Digital Signatures</td>
                <th>DPDP Compliance</th>
                <td>Explicit Digital Consent Mandate Required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Traditional Tabs Bar */}
      <div className="gov-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`gov-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      {activeTab === "Required Information" && (
        <div className="gov-panel">
          <div className="gov-panel-header-secondary">
            REQUIRED INFORMATION &amp; INPUT SCHEMA PARAMETERS
          </div>
          <div className="gov-panel-body" style={{ padding: 0 }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Description</th>
                  <th>Required</th>
                  <th>Data Type</th>
                  <th>Validation Rule</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Aadhaar Number</code></td>
                  <td>Citizen identification 12-digit UID or VID token</td>
                  <td><span className="gov-badge gov-badge-error">Yes</span></td>
                  <td>String</td>
                  <td>Regex Match: <code>^\d{12}$</code></td>
                </tr>
                <tr>
                  <td><code>Mobile Number</code></td>
                  <td>Registered mobile number for OTP factor</td>
                  <td><span className="gov-badge gov-badge-error">Yes</span></td>
                  <td>String</td>
                  <td>Regex Match: <code>^[6-9]\d{9}$</code></td>
                </tr>
                <tr>
                  <td><code>Consent</code></td>
                  <td>Citizen explicit authorization for demographic auth</td>
                  <td><span className="gov-badge gov-badge-error">Yes</span></td>
                  <td>Boolean</td>
                  <td>Must equal <code>true</code></td>
                </tr>
                <tr>
                  <td><code>OTP Factor</code></td>
                  <td>One-time passcode sent to Aadhaar-registered mobile</td>
                  <td><span className="gov-badge gov-badge-warning">Conditional</span></td>
                  <td>String</td>
                  <td>6-digit numeric OTP string</td>
                </tr>
                <tr>
                  <td><code>Purpose Code</code></td>
                  <td>Official scheme application reference code</td>
                  <td><span className="gov-badge gov-badge-error">Yes</span></td>
                  <td>String</td>
                  <td>Must match registered scheme code</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Basic Information" && (
        <div className="gov-panel">
          <div className="gov-panel-header-secondary">BASIC SERVICE INFORMATION</div>
          <div className="gov-panel-body">
            <p><strong>Description:</strong> Provides official real-time demographic and biometric verification for Indian citizens via UIDAI CIDR requesting entity ecosystem.</p>
            <br />
            <p><strong>Ministry:</strong> Ministry of Electronics &amp; Information Technology (MeitY), Government of India.</p>
          </div>
        </div>
      )}

      {activeTab === "API / Integration" && (
        <div className="gov-panel">
          <div className="gov-panel-header-secondary">API &amp; INTEGRATION SPECIFICATION</div>
          <div className="gov-panel-body" style={{ padding: 0 }}>
            <table className="gov-detail-table">
              <tbody>
                <tr>
                  <th>Endpoint Protocol</th>
                  <td>REST API / JSON Payload over HTTPS</td>
                </tr>
                <tr>
                  <th>Authentication</th>
                  <td>OAuth 2.0 Client Credentials + mTLS Certificate</td>
                </tr>
                <tr>
                  <th>Production Endpoint</th>
                  <td><code>https://api.govbridge.gov.in/v1/uidai/kyc/verify</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab !== "Required Information" && activeTab !== "Basic Information" && activeTab !== "API / Integration" && (
        <div className="gov-panel">
          <div className="gov-panel-header-secondary">{activeTab.toUpperCase()} DETAILS</div>
          <div className="gov-panel-body">
            <p>Formal specification details for <strong>{activeTab}</strong> under standard government interoperability guidelines.</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
