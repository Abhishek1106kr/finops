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
  idempotencyKey?: string;
}

export async function publishEvent<T extends Record<string, unknown>>(
  eventType: DomainEventType,
  payload: T,
  options: PublishOptions,
): Promise<EventEnvelope | null> {
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

  try {
    const redis = getRedis();

    if (options.idempotencyKey) {
      const key = `pazypro:idem:${options.idempotencyKey}`;
      const isNew = await redis.set(key, "1", "EX", DEDUPE_TTL_SECONDS, "NX");
      if (!isNew) return null;
    }

    await redis.xadd(STREAM_KEY, "*", "event", JSON.stringify(envelope));
  } catch (err) {
    // Graceful fallback when Redis is offline during local dev/demos
    // eslint-disable-next-line no-console
    console.warn(`[EventBus] Redis offline, event ${eventType} fallback logged:`, envelope.eventId);
  }

  return envelope;
}

export interface ConsumeOptions {
  group: string;
  consumer: string;
  count?: number;
  blockMs?: number;
}

export async function* consumeEvents(options: ConsumeOptions): AsyncGenerator<EventEnvelope> {
  const redis = getRedis();
  const { group, consumer, count = 10, blockMs = 5000 } = options;

  try {
    await redis.xgroup("CREATE", STREAM_KEY, group, "0", "MKSTREAM");
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes("BUSYGROUP")) throw err;
  }

  while (true) {
    try {
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
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
