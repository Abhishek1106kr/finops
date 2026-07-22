# ADR-0001: Event Mesh on Redis Streams + BullMQ

## Status
Accepted

## Context
Every business action in PazyPro must emit a typed domain event (CLAUDE.md
§Event-Driven Architecture), and every workflow must be idempotent, resilient,
and measurable. We need a mesh that:
- persists events durably and allows replay (Audit Agent, Knowledge Graph indexer)
- supports at-least-once delivery with consumer groups
- integrates with background job execution (OCR, matching, risk scoring)
- doesn't require standing up a separate broker (Kafka) for v0

## Decision
Use **Redis Streams** (`XADD`/`XREADGROUP`) as the durable, replayable event
log, and **BullMQ** (also Redis-backed) for background job dispatch triggered
by those events. A single `publishEvent()` helper in `libs/events` is the only
sanctioned way to emit a domain event; it stamps an `EventEnvelope` (event id,
correlation id, actor, occurredAt) and de-dupes via a Redis `SETNX` idempotency
key before appending to the stream.

## Consequences
- One infra dependency (Redis) covers caching, sessions, queues, pub/sub,
  locking (Redlock), and event streaming — matches the 9-workload Redis
  Strategy in skills.md §7.
- Consumer groups give us replay and per-consumer offsets for free; we don't
  get Kafka-style partitioning, which is acceptable at current scale.
- If event volume outgrows a single Redis instance, the migration path is to
  swap the stream implementation in `libs/events/src/eventBus.ts` for Kafka
  without touching event producers/consumers, since they only depend on
  `publishEvent`/`consumeEvents`.
