# GovBridge Architecture & Interoperability Design
## SIH Problem Statement ID: SIH26129

### 1. Overview & Core Philosophy
GovBridge acts as a non-invasive interoperability layer connecting existing departmental portals, registries, APIs, databases, and legacy systems without replacing them.

```
Existing Government Systems (REST, SOAP, DB)
                   ↓
Reusable Connectors & Adapters (RestConnector, SoapConnector, DatabaseConnector)
                   ↓
API Gateway & Router Layer (FastAPI)
                   ↓
Data Validation & Schema Transformation
                   ↓
Identity Federation & Mapping (Master Identity)
                   ↓
Consent Engine, RBAC & Policy Verification
                   ↓
Workflow Orchestration Engine (Multi-step verification & approval)
                   ↓
Event Management Bus (Redis Pub/Sub & Queues)
                   ↓
Unified Application Tracking
                   ↓
Audit Trail & Health Monitoring
```

### 2. Multi-Protocol Connector Architecture
Located at `backend/app/integrations/`:
- **`BaseConnector`**: Abstract interface defining `health_check()`, `fetch_data()`, and `send_data()`.
- **`RestConnector`**: Handles REST/JSON communication with modern registries.
- **`SoapConnector`**: Simulates legacy XML/SOAP integration, performing XML-to-JSON envelope extraction and payload transformation.
- **`DatabaseConnector`**: Simulates database-level queries (e.g., land/tax records).
- **`ConnectorFactory`**: Protocol-based resolver dynamically mapping `ConnectorProtocol` enums to concrete connector implementations.

### 3. Security & Access Control
- **Authentication**: JWT tokens signed with HMAC-SHA256, carrying user ID, role, and expiration.
- **RBAC**: Four strict roles:
  - `CITIZEN`: Submit & view own applications, manage consents.
  - `DEPARTMENT_OFFICER`: Review, process, and approve applications within assigned department.
  - `INTEGRATION_ADMIN`: Manage connectors, system workflows, and configurations.
  - `AUDITOR`: Read-only access to audit logs and system telemetry.
- **Password Security**: Direct `bcrypt` key derivation with standard 72-byte salt hashing.

### 4. Database & Storage Models
- **PostgreSQL / SQLite Dual Compatibility**: Models use cross-dialect `sqlalchemy.types.Uuid` ensuring unified support for local testing and containerized production deployment.
- **Entities**:
  - `departments`, `users`, `citizens`, `master_identities`, `identity_mappings`
  - `connectors`, `connector_health`, `workflows`, `workflow_steps`
  - `applications`, `application_steps`, `schema_mappings`, `data_exchanges`
  - `consents`, `consent_data_requests`, `access_policies`, `events`, `audit_logs`, `notifications`

### 5. Mock Government Registries
- **Identity Registry (Port 8001)**: REST/JSON citizen identification and verification.
- **Education Registry (Port 8002)**: REST/JSON academic degree and certificate lookup.
- **Employment Registry (Port 8003)**: REST/JSON employment verification and history.
- **Skill Registry (Port 8004)**: SOAP/XML skill certificates with XML payload rendering.
- **Revenue Registry (Port 8005)**: Database query simulation for land records and income.
- **Welfare Registry (Port 8006)**: REST/JSON social welfare benefit tracking.
