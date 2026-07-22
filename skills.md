# PazyPro — The Autonomous Finance Operating System (`skills.md`)

> **Core Philosophy**: Don't automate invoices. **Understand the company.**

---

## 1. Project Overview & Guiding Principles

**PazyPro** is an Autonomous Finance Operating System designed to understand the entire financial fabric of an enterprise. It shifts corporate financial management from passive data entry and reactive invoice processing to active, intelligent autonomous orchestrations across cash flow, risk, budgets, compliance, and vendor intelligence.

### Core Philosophy
* **Company Intelligence over Isolated Modules**: Invoices, payments, budgets, approvals, contracts, and vendors are interconnected facets of the company. Every record references every other entity in a living Knowledge Graph.
* **Event-Driven & Persistent**: Every change emits typed events. No action or state shift disappears without a trace.
* **Multi-Agent Orchestrators**: Autonomous domain-bound agents (Invoice, Vendor, Budget, Treasury, Risk, Compliance, etc.) collaborate via an event mesh and AI planner to drive financial operations.
* **Invisible & Pristine UI**: The UI stays minimal, calm, and typography-first. New features must seamlessly integrate into the established design token system (`UI.md`).

---

## 2. Design & UI Philosophy (`UI.md` Integration)

The front-end design must strictly follow the **Grew Mail / Editorial Minimalist** paradigm defined in [`UI.md`](file:///c:/Users/chauh/OneDrive/Desktop/FinOps/UI.md).

### The 10 Commandments of PazyPro UI
1. **Huge Typography**: Display headers with low font weights (`font-weight: 400 - 500`) and tight tracking (`-0.03em`).
2. **Minimal & Curated Palette**: Palette strictly locked to Off-White Warm Cream (`#FAF7F2`), Deep Carbon (`#121212`), Soft Lavender Card Accent (`#F3E6F7`), and Soft Sage Card Accent (`#C7E8BC`).
3. **Generous Whitespace**: High padding (`32px` - `40px` desktop) and clear breathing room between sections.
4. **Soft Pastel Cards**: Cards use `border-radius: 24px` with subtle borders (`rgba(18, 18, 18, 0.08)`) and pastel tint fills.
5. **Zero Visual Noise**: No cluttered ERP sidebars, complex data grids with 50 columns, or chaotic dashboard widgets.
6. **Fully Rounded Controls**: All primary buttons, pills, tags, and status indicators use `border-radius: 9999px`.
7. **Motion Instead of Decoration**: Subtle, functional micro-animations (via `Motion One` / `VueUse`) over decorative graphics.
8. **Typography-First Hierarchy**: Spatial alignment and font scale establish visual importance.
9. **Strict Component Reuse**: Never introduce ad-hoc colors, buttons, or card variants. Reuse existing spacing, typography, inputs, animations, and color tokens.
10. **Invisible Feature Additions**: Architecture can evolve, but design stays immutable. Every new screen or feature must look like it belonged from day one.

---

## 3. Technology Stack Specification

| Layer | Primary Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | **Nuxt 3** (Vue 3, TypeScript, Vite) |
| **Styling & Design** | **TailwindCSS** (configured with tokens from `UI.md`), Vanilla CSS Variables |
| **State Management** | **Pinia**, VueUse |
| **Routing & Querying** | **Vue Router**, **TanStack Query** (Vue Query) |
| **Forms & Validation** | **VeeValidate**, **Zod** |
| **Icons & Micro-UI** | **Lucide Icons**, **Heroicons**, **Floating UI** |
| **Animations & Notifications** | **Motion One**, **Vue Sonner**, **Vue Virtual Scroller** |
| **Backend Runtime** | **Node.js**, **Fastify** (or Express), TypeScript |
| **ORM & Database Access** | **Prisma ORM**, PostgreSQL client |
| **Primary Database** | **PostgreSQL** + **pgvector** (for vector embeddings & semantic search) |
| **Cache, Queue & Mesh** | **Redis**, **BullMQ** (Background job queues & async tasks), Socket.IO |
| **AI Frameworks & LLMs** | **LangGraph**, **LangChain**, **OpenAI**, **Anthropic**, **Ollama**, MCP (Model Context Protocol), RAG |
| **Telemetry & Logging** | **OpenTelemetry**, **Pino Logger**, Swagger/OpenAPI |
| **Infrastructure & CI/CD** | **Docker**, Docker Compose, GitHub Actions, AWS (S3, CloudFront, EC2), Nginx, GHCR, Terraform |
| **Observability & Ops** | **Grafana**, **Prometheus**, **Loki**, **Sentry**, BetterStack, Healthchecks, Bull Board, Redis Insight |

---

## 4. System Architecture ("Finance Brain")

```
                            Finance Brain
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
  Knowledge Graph             Event Mesh              AI Planner
         │                        │                        │
 ┌───────┼────────┐               │                ┌───────┼────────┐
 │       │        │               │                │       │        │
Invoice Payment Vendor Budget Risk Forecast Tax
 │       │        │               │                │       │        │
 └───────┼────────┴───────────────┴────────────────┘───────┼────────┘
         │                                                 │
         └───────────────── Workflow Engine ───────────────┘
                                  │
                          PostgreSQL + Redis
                                  │
                       BullMQ Event Processing
                                  │
         ┌────────────┬───────────┼────────────┬───────────┐
       Slack         ERP         Bank         GST        Email / Cards
```

### Core Architecture Components
1. **Finance Brain**: Central orchestration unit synthesizing business context, real-time events, and memory graphs.
2. **Knowledge Graph**: Entity relationships connecting Companies, Departments, Employees, Budgets, POs, Invoices, Payments, Vendors, Taxes, Contracts, and Audit Logs.
3. **Event Mesh**: Pub/Sub infrastructure broadcasting immutable financial domain events across all services.
4. **AI Planner**: Multi-agent reasoning engine determining autonomous workflows, risk scores, and approval routing.
5. **Workflow Engine**: State-machine driven execution core handling multi-step approvals, vendor verification, and payment releases.

---

## 5. Repository Monorepo Structure

```
pazy-pro/
├── apps/
│   ├── web/                    # Nuxt 3 Frontend Web Application
│   └── api/                    # Fastify TypeScript Backend API Server
├── packages/
│   ├── ui/                     # Shared Vue 3 Component Library (UI.md compliant)
│   ├── types/                  # Shared TypeScript Interfaces & Zod Schemas
│   ├── config/                 # Shared Tailwind, ESLint, TypeScript configurations
│   └── sdk/                    # Internal SDK client for PazyPro API
├── services/
│   ├── invoice-ai/             # Invoice ingestion, OCR, parsing & matching service
│   ├── payment-engine/         # Payment scheduling, bank integrations & execution
│   ├── notification/           # Multi-channel alerts (Slack, Email, SMS, Webhooks)
│   ├── workflow/               # State machine & approval workflow engine
│   ├── risk-engine/            # Anomaly detection, fraud prevention & risk scoring
│   ├── forecasting/            # Cash flow & budget predictive analytics service
│   └── integrations/           # Third-party adapters (Banking, GST, ERPs, Cards)
├── libs/
│   ├── database/               # Prisma schema, migrations & pgvector setup
│   ├── events/                 # Event mesh contracts & Redis Event Bus client
│   ├── auth/                   # Identity, RBAC & JWT/Session management
│   ├── logging/                # Structured Pino logger & OpenTelemetry instrumentation
│   ├── monitoring/             # Metrics, Prometheus counters & Sentry wrappers
│   └── ai/                     # LangGraph, LangChain, Embeddings & RAG helpers
├── infra/
│   ├── docker/                 # Dockerfiles & docker-compose configurations
│   ├── terraform/              # Terraform AWS & Cloud Infrastructure manifests
│   └── nginx/                  # Reverse proxy configurations
├── .github/
│   └── workflows/              # GitHub Actions CI/CD pipelines
└── docs/                       # Comprehensive Project Documentation
```

---

## 6. Database Design — Company Intelligence Model

PazyPro models financial data as a **connected graph of intelligence** where every record maintains directional context with parent and child entities.

```
Company
  ├── Departments
  │     └── Employees
  ├── Budgets
  │     └── Purchase Orders (POs)
  ├── Invoices
  │     ├── Line Items
  │     ├── OCR Metadata
  │     └── Payments
  ├── Vendors
  │     ├── Bank Accounts
  │     ├── Contracts
  │     └── Compliance / GST Records
  ├── Corporate Cards & Expenses
  ├── Tax Schedules
  ├── Approval Chains
  ├── Audit Trail Logs
  └── Events & Knowledge Graph Nodes
```

### PostgreSQL + pgvector Requirements
* **Strict Foreign Key Constraints**: No orphan records allowed.
* **Soft Deletes & Auditing**: Every table includes `created_at`, `updated_at`, `deleted_at`, and `created_by`.
* **pgvector Embeddings**: Store 1536-dim (or 3072-dim) embeddings for contracts, invoices, vendor interactions, and approval histories for semantic search and AI retrieval.

---

## 7. Redis Strategy

Redis is utilized as a multi-purpose operational state engine across 9 distinct workloads:

1. **Caching**: High-speed retrieval for session permissions, active budgets, and exchange rates.
2. **Session Store**: User identity, JWT revocation lists, and multi-tenant context.
3. **Rate Limiting**: Sliding-window rate limiters for external webhooks and public API routes.
4. **BullMQ Job Queues**: Queue backend for async OCR processing, email delivery, and invoice matching.
5. **Pub/Sub Event Bus**: Fast in-memory event fan-out for real-time Socket.IO clients.
6. **Distributed Locking**: Redlock implementation for idempotency during payment executions and budget locks.
7. **Presence**: Real-time user cursor and active viewer tracking on approval workflows.
8. **Event Streaming**: Redis Streams for persistent real-time event logs.
9. **Event Buffering**: High-throughput ingestion buffer for audit logs and telemetry metrics.

---

## 8. Event-Driven Architecture

Every domain state change **MUST** emit an event into the Event Mesh.

### Core Domain Events
* `InvoiceUploaded` — Raw file received and validated.
* `InvoiceParsed` — Structured text & line items extracted via OCR.
* `OCRCompleted` — Confidence scores calculated and validated.
* `InvoiceMatched` — 2-way / 3-way match against PO and receiving receipt completed.
* `VendorVerified` — GST, PAN, bank account, and blacklist check passed.
* `ApprovalRequested` — Routed to designated department approvers.
* `ApprovalGranted` — Authorized by required signature chain.
* `ApprovalRejected` — Denied with reason code.
* `BudgetExceeded` — Warning / block triggered due to departmental threshold.
* `RiskDetected` — Fraud, duplicate invoice, or unusual vendor pattern flagged.
* `PaymentScheduled` — Payment queue entry locked and timestamped.
* `PaymentCompleted` — Bank API confirmation received & ledger updated.
* `GSTVerified` — Tax compliance API confirmation logged.
* `ReminderTriggered` — Automated nudge sent to pending approver.
* `WebhookFailed` — Third-party notification attempt failed.
* `WebhookRecovered` — Retry strategy successfully delivered event.
* `ForecastUpdated` — Cash flow projection recalculated by AI model.

---

## 9. AI Agent Mesh (Specialized Domain Contexts)

Instead of a single monolithic chatbot, PazyPro deploys **11 Autonomous Domain Agents** built with **LangGraph**:

1. **Invoice Agent**: Manages OCR extraction, document alignment, line-item parsing, and anomaly checks.
2. **Vendor Agent**: Conducts vendor onboarding, risk scoring, GST verification, and contract compliance analysis.
3. **Budget Agent**: Monitors real-time department spend against allocated PO budgets and warns on drift.
4. **Treasury Agent**: Optimizes working capital, payment timing, early payment discounts, and yield.
5. **Forecast Agent**: Generates probabilistic cash flow models using historical telemetry and incoming invoices.
6. **Audit Agent**: Continuously audits transactions against corporate spending policies and regulatory rules.
7. **Compliance Agent**: Validates tax structures (GST/TDS), cross-border rules, and statutory filings.
8. **Risk Agent**: Scans for duplicate invoices, suspicious bank account changes, and split-invoicing fraud.
9. **Accounting Agent**: Maps line items to GL (General Ledger) accounts and prepares ERP sync payloads.
10. **Payment Agent**: Validates payment prerequisites, checks liquidity, and executes bank payouts via secure API.
11. **Notification Agent**: Formulates context-aware summaries for Slack, Email, and in-app feeds.

---

## 10. Minimal Application Views & Page Map

The frontend routing strictly avoids classic bloated ERP navigation. Only **14 minimal, high-efficiency pages** are built:

1. `/dashboard` — High-level cash flow summary, urgent action cards, and financial pulse.
2. `/inbox` — Unified action center for pending approvals, alerts, and system nudges.
3. `/invoices` — Minimalist invoice grid, document drawer, matching status, and upload area.
4. `/payments` — Execution queue, bank payout statuses, batch releases, and payment history.
5. `/vendors` — Vendor intelligence profiles, risk scores, contract links, and payment methods.
6. `/budgets` — Departmental spending progress, PO allocations, and variance tracking.
7. `/contracts` — Active vendor agreements, renewal timelines, and key clause AI extractions.
8. `/analytics` — High-level financial reporting, spending breakdown, and trends.
9. `/approvals` — Dedicated multi-tier approval interface with context drawers.
10. `/cash-flow` — Predictive cash availability curve and runway models.
11. `/knowledge-graph` — Interactive visual explorer of company financial entities & links.
12. `/ai` — Finance Brain chat interface, agent logs, and prompt workspace.
13. `/audit` — Immutable log ledger of all system events, approvals, and AI agent actions.
14. `/settings` — Organization profile, team permissions, integrations, and API keys.

---

## 11. Feature Development Pipeline

Every new feature or service build follows this mandatory 16-step development workflow:

```
 1. Business Problem       ─►  2. First Principles      ─►  3. Requirements
         │
 4. UX Flow (UI.md)        ─►  5. Data Model           ─►  6. Database Schema
         │
 7. API Design (OpenAPI)   ─►  8. Event Design          ─►  9. Redis Strategy
         │
10. AI Opportunities       ─► 11. Monitoring Setup    ─► 12. Unit & Integration Tests
         │
13. Implementation         ─► 14. Observability Check ─► 15. Documentation Update
         │
16. PR & Review
```

---

## 12. Documentation Standard & Directory Structure

All technical documentation **MUST** be structured inside the repository under `docs/`:

```
docs/
├── 01-product/          # Product vision, PRDs, user personas, and feature roadmaps
├── 02-architecture/     # System architecture, C4 diagrams, and component models
├── 03-api/              # OpenAPI specs, REST endpoint reference, and SDK docs
├── 04-events/           # Event Mesh contracts, schema definitions, and payload examples
├── 05-ai/               # Agent specifications, LangGraph state charts, and RAG pipelines
├── 06-database/         # ER diagrams, Prisma schemas, pgvector indexing, and migration guides
├── 07-workflows/        # Approval state machines, workflow engine specs, and triggers
├── 08-integrations/     # Bank APIs, ERP adapters (SAP, NetSuite, Tally), GST & Slack
├── 09-monitoring/       # Grafana dashboard definitions, Prometheus alerts, Sentry rules
├── 10-testing/          # Test strategies, E2E playbooks, and load testing guidelines
├── 11-deployment/       # Docker, AWS infrastructure, Nginx configs, and CI/CD pipelines
├── 12-decisions/        # Architecture Decision Records (ADRs) & Request for Comments (RFCs)
│   ├── ADR/             # Architectural decisions with context, consequences, & status
│   └── RFC/             # Proposals for major technical & product changes
```

---

## 13. Quality Gates & Enforcement Checklist

Before any PR or feature is marked as complete:

- [ ] **UI Checklist**: Complies 100% with [`UI.md`](file:///c:/Users/chauh/OneDrive/Desktop/FinOps/UI.md) design tokens (colors, typography, border radius, whitespace). No custom un-approved UI components.
- [ ] **Type Safety**: Zero `any` types in TypeScript. Full Zod validation on incoming request payloads and API responses.
- [ ] **Event Coverage**: Every state-changing API emits a typed domain event to Redis/BullMQ.
- [ ] **Telemetry**: Pino structured logs included for entry/exit points; OpenTelemetry spans added for DB and HTTP operations.
- [ ] **Database Integrity**: Prisma schema updated with foreign key constraints, proper indexes, and soft-delete support.
- [ ] **Tests & Docs**: Unit tests written, API specs updated in OpenAPI, and corresponding `docs/` file updated.
