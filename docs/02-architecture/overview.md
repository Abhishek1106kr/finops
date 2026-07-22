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
- `apps/api` — Fastify + Zod (fastify-type-provider-zod) + Swagger. Routes:
  `/healthz`, `/readyz`, and the Invoice ingestion slice
  (`POST/GET /api/v1/invoices`). Background worker: `invoice-ocr`.
- `apps/web` — Nuxt 3 + Tailwind (shared preset) + Pinia/VueUse/TanStack
  Query. Pages: `/dashboard`, `/invoices` (+ detail), stubs for
  `/inbox`, `/payments`, `/vendors`, `/budgets`, `/ai`.
- `infra/docker/docker-compose.yml` — Postgres (`pgvector/pgvector:pg16`),
  Redis, RedisInsight for local dev.

## Not yet implemented
- Auth/RBAC (`libs/auth`) — routes currently use a hardcoded demo company/user.
- Blob storage for uploaded files (currently a placeholder URL).
- `invoice-matching`, `vendor-verification`, `risk-scoring`,
  `payment-execution`, `forecast-refresh` workers (queues are defined, no
  processors yet beyond `invoice-ocr`).
- The other 10 AI Agents (skills.md §9) — only a mock "Invoice Agent" OCR step
  exists; no LangGraph orchestration yet.
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
