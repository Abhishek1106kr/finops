/// <reference path="./redlock.d.ts" />
import Redlock from "redlock";
import { getRedis } from "./redis";

let redlock: Redlock | undefined;

function getRedlock(): Redlock {
  if (!redlock) {
    redlock = new Redlock([getRedis()], { retryCount: 5, retryDelay: 200 });
  }
  return redlock;
}

/**
 * Runs `fn` under a distributed lock keyed by `resource`. Used to guard
 * payment execution and budget mutations so concurrent workers can never
 * double-spend or race on the same entity.
 */
export async function withLock<T>(resource: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const lock = await getRedlock().acquire([`pazypro:lock:${resource}`], ttlMs);
  try {
    return await fn();
  } finally {
    await lock.release();
  }
}
