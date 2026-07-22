import { randomUUID } from "node:crypto";
import { EventEnvelopeSchema, type DomainEventType, type EventEnvelope } from "@pazy-pro/types";
import { getRedis } from "./redis";

const STREAM_KEY = "pazypro:events";
const DEDUPE_TTL_SECONDS = 60 * 60 * 24; // 24h idempotency window

export interface PublishOptions {
  companyId: string;
  actor: EventEnvelope["actor"];
  correlationId?: string;
  causationId?: string;
  /** Caller-supplied key to make publishing idempotent (e.g. `invoice:{id}:uploaded`). */
  idempotencyKey?: string;
}

/**
 * Publishes a domain event onto the Redis Streams event mesh. Every business
 * action MUST go through this function so the Audit Agent, Knowledge Graph
 * indexer, and downstream BullMQ consumers all observe a single source of
 * truth. Idempotent: passing the same `idempotencyKey` twice is a no-op.
 */
export async function publishEvent<T extends Record<string, unknown>>(
  eventType: DomainEventType,
  payload: T,
  options: PublishOptions,
): Promise<EventEnvelope | null> {
  const redis = getRedis();

  if (options.idempotencyKey) {
    const key = `pazypro:idem:${options.idempotencyKey}`;
    const isNew = await redis.set(key, "1", "EX", DEDUPE_TTL_SECONDS, "NX");
    if (!isNew) return null;
  }

  const envelope: EventEnvelope = EventEnvelopeSchema.parse({
    eventId: randomUUID(),
    eventType,
    eventVersion: 1,
    companyId: options.companyId,
    occurredAt: new Date().toISOString(),
    correlationId: options.correlationId ?? randomUUID(),
    causationId: options.causationId,
    actor: options.actor,
    payload,
  });

  await redis.xadd(STREAM_KEY, "*", "event", JSON.stringify(envelope));
  return envelope;
}

export interface ConsumeOptions {
  group: string;
  consumer: string;
  /** Max events fetched per read cycle. */
  count?: number;
  /** Poll interval in ms when the stream is idle. */
  blockMs?: number;
}

/**
 * Consumes events from the mesh via a Redis Streams consumer group, giving
 * at-least-once delivery with per-consumer offset tracking and automatic
 * retry (unacked entries remain in the Pending Entries List for replay).
 */
export async function* consumeEvents(options: ConsumeOptions): AsyncGenerator<EventEnvelope> {
  const redis = getRedis();
  const { group, consumer, count = 10, blockMs = 5000 } = options;

  try {
    await redis.xgroup("CREATE", STREAM_KEY, group, "0", "MKSTREAM");
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes("BUSYGROUP")) throw err;
  }

  while (true) {
    const results = await redis.xreadgroup(
      "GROUP",
      group,
      consumer,
      "COUNT",
      count,
      "BLOCK",
      blockMs,
      "STREAMS",
      STREAM_KEY,
      ">",
    );

    if (!results) continue;

    for (const [, entries] of results as unknown as [string, [string, string[]][]][]) {
      for (const [id, fields] of entries) {
        const raw = fields[1];
        if (!raw) continue;
        const envelope = EventEnvelopeSchema.parse(JSON.parse(raw));
        yield envelope;
        await redis.xack(STREAM_KEY, group, id);
      }
    }
  }
}
