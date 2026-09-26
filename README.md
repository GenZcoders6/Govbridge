# GovBridge
## Government Interoperability & Service Orchestration Platform

> **SIH Problem Statement ID: SIH26129**  
> *"System integration and interoperability among government digital platforms, resulting in fragmented service delivery."*

---

## 🏛️ What is GovBridge?

GovBridge is a secure **interoperability layer** that connects existing departmental portals, registries, APIs, databases and legacy systems — without replacing them.

```
Existing Government Systems
        ↓
Reusable Connectors / Adapters (REST, SOAP, DB, Webhook)
        ↓
API Gateway (FastAPI)
        ↓
Data Validation + Schema Transformation
        ↓
Identity Mapping (Master Identity)
        ↓
Consent + RBAC + Policy Engine
        ↓
Workflow Orchestration
        ↓
Event Management (Redis)
        ↓
Unified Application Tracking
        ↓
Audit + Monitoring
```

> **⚠️ IMPORTANT:** All government systems are **MOCK/DEMO** simulations. No real citizen data is used. GovBridge does not claim actual integration with any government system.

---

## 🏗️ Architecture

```
d:\sih2\
├── frontend/          # Next.js + TypeScript
├── backend/           # Python FastAPI
│   └── app/
│       ├── routers/       # API route handlers
│       ├── services/      # Business logic
│       ├── models/        # SQLAlchemy ORM models
│       ├── schemas/       # Pydantic v2 schemas
│       ├── repositories/  # DB query layer
│       ├── integrations/  # Connector implementations
│       ├── workflow/      # Orchestration engine
│       ├── security/      # JWT + RBAC
│       ├── events/        # Event management
│       └── utils/         # Helpers & seeder
├── mock-services/     # 6 simulated government systems
├── docs/              # Architecture documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### 1. Clone & Configure
```bash
git clone <repo>
cd govbridge
cp .env.example .env
# Edit .env if needed
```

### 2. Start All Services (Docker)
```bash
docker compose up --build
```

This starts:
| Service | Port | Description |
|---------|------|-------------|
| Frontend (Next.js) | 3000 | Main web application |
| Backend (FastAPI) | 8000 | API & orchestration |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Messaging & cache |
| Mock Identity | 8001 | Identity Registry (REST/JSON) |
| Mock Education | 8002 | Education Registry (REST/JSON) |
| Mock Employment | 8003 | Employment Registry (REST/JSON) |
| Mock Skill | 8004 | Skill Registry (SOAP/XML) |
| Mock Revenue | 8005 | Revenue Registry (DB Connector) |
| Mock Welfare | 8006 | Welfare Registry (REST/JSON) |

### 3. Access the Application
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/api/docs
- **Health:** http://localhost:8000/api/health

---

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@govbridge.demo | citizen123 |
| Department Officer | officer@govbridge.demo | officer123 |
| Integration Admin | admin@govbridge.demo | admin123 |
| Auditor | auditor@govbridge.demo | auditor123 |

---

## 🔧 Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mock Services
```bash
cd mock-services
pip install -r requirements.txt
uvicorn identity_service:app --port 8001 --reload &
uvicorn education_service:app --port 8002 --reload &
# ... etc
```

---

## 🔌 Connector Architecture

GovBridge supports multiple integration protocols:

| Protocol | Mock Service | Example |
|----------|-------------|---------|
| REST/JSON | Identity, Education, Employment, Welfare | Standard HTTP GET/POST |
| SOAP/XML | Skill Registry | Returns XML, GovBridge transforms to JSON |
| DB Connector | Revenue Registry | Simulates direct DB query pattern |
| Webhook | (configurable) | Event-driven notifications |

---

## 🛡️ Security Architecture

- **JWT Authentication** with configurable expiry
- **RBAC** — 4 roles: CITIZEN, DEPARTMENT_OFFICER, INTEGRATION_ADMIN, AUDITOR
- **Consent-based data access** — citizens must grant consent for data sharing
- **Access Policies** — per-resource role enforcement
- **Full Audit Trail** — every action logged

---

## 📊 RBAC Role Matrix

| Feature | CITIZEN | OFFICER | ADMIN | AUDITOR |
|---------|---------|---------|-------|---------|
| Submit applications | ✅ | ✅ | ✅ | ❌ |
| View own applications | ✅ | ✅ | ✅ | ❌ |
| Review all applications | ❌ | ✅ | ✅ | ❌ |
| Manage connectors | ❌ | ❌ | ✅ | ❌ |
| View audit logs | ❌ | ❌ | ✅ | ✅ |
| User management | ❌ | ❌ | ✅ | ❌ |
| System configuration | ❌ | ❌ | ✅ | ❌ |

---

## 📝 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Python 3.12, FastAPI |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| Auth | JWT (python-jose), bcrypt |
| ORM | SQLAlchemy 2.0 (async) |
| Schema | Pydantic v2 |
| SOAP | lxml (XML parsing) |
| Container | Docker, Docker Compose |

---

## ⚠️ Disclaimer

This is a **prototype** built for Smart India Hackathon 2026. It does **NOT**:
- Connect to any real government system
- Store real citizen data  
- Claim actual government authorization

All data is simulated for demonstration purposes only.
