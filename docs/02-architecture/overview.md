# Architecture Overview

See `skills.md` §4 for the canonical "Finance Brain" diagram and §5 for the
monorepo layout. This doc tracks what's actually implemented vs. planned.

## Implemented (v0 vertical slice)
- `packages/types` — Zod schemas for domain entities + every event payload
  listed in `skills.md` §8, sharing one envelope (`EventEnvelopeSchema`).
- `packages/config` — Tailwind preset encoding every token in `UI.md`; both
  apps extend it instead of redefining colors/radii/type scale.
- `libs/database` — Prisma schema implementing the Company Intelligence Graph
  (`skills.md` §6): Company → Department → Employee, Budget → PO, Invoice →
  LineItems/OCRMetadata/Payments, Vendor → BankAccounts/Contracts, plus
  `KnowledgeGraphNode`/`Edge` with a `pgvector` embedding column.
- `libs/events` — Redis Streams event bus (`publishEvent`/`consumeEvents`),
  BullMQ queue helpers with retry/backoff defaults, and Redlock-based
  distributed locking for payment/budget mutations. See ADR-0001.
- `libs/logging` — Shared Pino logger factory.
- `libs/ai` — lightweight `AgentGraph` runner plus Vendor Agent (GST/PAN
  validation, blacklist, risk score) and Risk Agent (duplicate invoice /
  split-invoicing detection).
- `services/payment-engine` — PazyPro's own payout gateway (`PazyPayGateway`):
  IMPS/NEFT/RTGS rail selection, HMAC-signed webhook contract, double-entry
  ledger postings. See ADR for design rationale.
- `apps/api` — Fastify + Zod (fastify-type-provider-zod) + Swagger. Routes:
  `/healthz`, `/readyz`, `invoices`, `vendors`, `approvals`, `payments`
  (+ gateway webhook), `demo` (seed data), and `POST /api/v1/ai/chat` — the
  Finance Brain copilot, streamed via SSE, calling Groq's `llama-3.3-70b-versatile`
  through the official `groq-sdk`, grounded in a live DB snapshot. Workers:
  `invoice-ocr`, `invoice-matching`, `vendor-verification`, `risk-scoring`,
  `payment-execution`, `payment-gateway-callback`. `src/realtime.ts` attaches
  Socket.IO to the API's HTTP server and tails the Redis Streams event mesh,
  rebroadcasting every domain event to connected browsers over `/realtime`.
- `apps/web` — Nuxt 3 + Tailwind (shared preset) + Pinia/VueUse/TanStack
  Query + Motion One + ECharts (`vue-echarts`). Pages: `/dashboard` (live
  metrics, cash-flow chart, forecast, AI Copilot panel, real-time activity
  feed via Socket.IO), `/invoices` (+ detail), `/payments`, `/vendors`,
  `/inbox`, `/ai` (full Finance Brain chat), `/budgets`. `components/ui/`
  holds hand-rolled shadcn-vue-style primitives (Card/Button/Badge/Skeleton,
  `class-variance-authority` + `cn()`) themed off the existing design tokens.
- `infra/docker/docker-compose.yml` — Postgres (`pgvector/pgvector:pg16`),
  Redis, RedisInsight for local dev.

## Not yet implemented
- Auth/RBAC (`libs/auth`) — routes currently use a hardcoded demo company/user.
- Blob storage for uploaded files (currently a placeholder URL).
- `forecast-refresh` worker (queue defined, no processor).
- The remaining AI Agents beyond Vendor/Risk (skills.md §9) — no LangGraph
  orchestration yet, and no tool-calling in the Finance Brain chat endpoint
  (it's grounded by a DB snapshot in the system prompt, not live queries).
- OpenTelemetry tracing, Prometheus metrics, Grafana/Loki wiring.
- CI beyond lint/typecheck (`.github/workflows/ci.yml`).

## Known local-dev limitation
On Windows-on-ARM64 dev machines, Prisma 5.x's native query engine binary
(`query_engine-windows.dll.node`) fails to load (`not a valid Win32
application`) because Prisma 5.x doesn't ship a Windows ARM64 engine —
confirmed while smoke-testing `/readyz` in this environment. This does not
affect Linux x64 containers (the deploy target per `skills.md` §3
Infrastructure). Workarounds if you hit this locally: run the API inside
WSL2, or upgrade to Prisma 6+ (adds Windows ARM64 support) — tracked as a
follow-up, not applied here to avoid an unplanned major-version bump.

## Sequencing recommendation
Build one more full vertical slice (Vendor verification, since Invoice
matching depends on it) end-to-end — DB → event → worker → UI — before
widening to the remaining agents, so the event-mesh and idempotency patterns
get validated against a second real workflow rather than generalized in
the abstract.
