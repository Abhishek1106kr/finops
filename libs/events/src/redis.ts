import Redis from "ioredis";

let client: Redis | undefined;

/** Singleton ioredis connection shared by the event bus, BullMQ, and Redlock. */
export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
  }
  return client;
}
