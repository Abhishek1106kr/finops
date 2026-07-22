# CLAUDE.md — Master Blueprint for PazyPro (FinanceOS v1.0.0)

> **Persona**: Principal Software Engineer (Tony Stark First Principles Mindset)  
> **Core Philosophy**: Understand the company, not the invoice.  
> **Objective**: Remove unnecessary human effort, design for intelligence instead of CRUD, and ensure every feature increases overall system intelligence.

---

## 🔒 IMMUTABLE CONSTRAINTS

* **UI System Locked (`ui.locked: true`)**: The existing design system ([`UI.md`](file:///c:/Users/chauh/OneDrive/Desktop/FinOps/UI.md)) is strictly immutable.
  * Never redesign pages, modify typography, alter spacing, or change colors.
  * Always reuse existing components (`packages/ui`, `apps/web/components`).
  * **Backend intelligence is preferred over UI changes.**

---

## 🏛️ Architecture & Values

* **Architecture Style**: Modular Monolith, Event-Driven, Domain-Driven Design (DDD), CQRS Ready, Knowledge Graph, Hexagonal Architecture.
* **Engineering Values**:
  1. Architecture over shortcuts
  2. Scalability over hacks
  3. Observability by default (OpenTelemetry + Pino)
  4. Automation before manual work
  5. Resilience before optimization (Idempotent workflows & retries)
  6. Developer Experience matters
  7. Everything is explainable & testable (Target: 90%+ test coverage)

---

## 🔌 API & Communication Standard

* **Base Endpoint**: `/api/v1`
* **Validation**: Zod schemas on all input payloads and parameters.
* **OpenAPI Documentation**: Auto-generated via Fastify Swagger.
* **Standard Response Wrappers**:
  ```json
  // Success Response
  {
    "success": true,
    "data": {},
    "meta": { "page": 1, "total": 100 }
  }

  // Error Response
  {
    "success": false,
    "error": {
      "code": "VENDOR_NOT_FOUND",
      "message": "Vendor record does not exist or has been soft-deleted."
    }
  }
  ```

---

## 🗄️ Database & Event Architecture Rules

1. **UUID Everywhere**: Primary keys use UUID v4.
2. **Soft Deletes**: Business entities use `deleted_at` timestamps instead of hard deletes.
3. **UTC Timestamps**: All time fields are stored in UTC ISO-8601 format.
4. **Audit Every Write**: Track `created_at`, `updated_at`, `deleted_at`, and `created_by`.
5. **No Shared Mutable State**: Every domain module owns its tables.
6. **Mandatory Domain Events**:
   Every state mutation **MUST** emit a typed event to Redis/BullMQ:
   `InvoiceUploaded` • `InvoiceParsed` • `InvoiceValidated` • `VendorCreated` • `VendorUpdated` • `ApprovalRequested` • `ApprovalGranted` • `ApprovalRejected` • `BudgetExceeded` • `PaymentScheduled` • `PaymentCompleted` • `PaymentFailed` • `GSTValidated` • `ForecastUpdated` • `WebhookReceived` • `WebhookFailed` • `RetryTriggered` • `RiskDetected`

---

## 🤖 Specialized AI Agents Mesh

1. **Invoice Agent**: OCR extraction, document parsing, line-item alignment & validation.
2. **Risk Agent**: Fraud detection, duplicate invoice checking, and anomaly scoring.
3. **Treasury Agent**: Cash flow optimization, working capital management, and payout timing.
4. **Forecast Agent**: Predictive financial forecasting and runway analysis.
5. **Compliance Agent**: GST validation, tax compliance (TDS), and spending policy checks.
6. **Audit Agent**: Comprehensive traceability, event lineaging, and audit log verification.

---

## ✅ Definition of Done (DoD) Checklist

Before marking any feature as completed:
- [ ] **Feature Implemented**: Complete logic meeting acceptance criteria.
- [ ] **No UI Redesign**: Complies 100% with [`UI.md`](file:///c:/Users/chauh/OneDrive/Desktop/FinOps/UI.md) without altering spacing/colors.
- [ ] **API Standards**: Uses `/api/v1` routes with standardized JSON envelope (`{ success: true, data: ... }`).
- [ ] **Event Emitted**: Domain event published to Redis Event Bus.
- [ ] **Logging & Monitoring**: Pino structured log and OpenTelemetry span added.
- [ ] **Security Reviewed**: OWASP Top 10 validated (SQLi prevention via Prisma, XSS sanitized, JWT/RBAC checked).
- [ ] **Tests Passing**: Vitest unit/integration tests verified.
- [ ] **Docs Updated**: Corresponding document updated under `docs/`.
