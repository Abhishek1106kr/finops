import { Queue, Worker, type Job, type Processor } from "bullmq";
import { getRedis } from "./redis";

export const QueueName = {
  InvoiceOCR: "invoice-ocr",
  InvoiceMatching: "invoice-matching",
  VendorVerification: "vendor-verification",
  RiskScoring: "risk-scoring",
  PaymentExecution: "payment-execution",
  PaymentGatewayCallback: "payment-gateway-callback",
  Notification: "notification",
  ForecastRefresh: "forecast-refresh",
} as const;
export type QueueName = (typeof QueueName)[keyof typeof QueueName];

const defaultJobOptions = {
  attempts: 5,
  backoff: { type: "exponential" as const, delay: 2000 },
  removeOnComplete: { age: 60 * 60 * 24 * 7, count: 5000 },
  removeOnFail: { age: 60 * 60 * 24 * 30 },
};

const queues = new Map<QueueName, Queue>();

/** Lazily-created, shared BullMQ queue per domain job type. */
export function getQueue(name: QueueName): Queue {
  let queue = queues.get(name);
  if (!queue) {
    queue = new Queue(name, { connection: getRedis(), defaultJobOptions });
    queues.set(name, queue);
  }
  return queue;
}

/**
 * Creates a resilient worker with retries/backoff already configured.
 * Idempotency is the processor's responsibility (e.g. check entity status
 * before mutating) since BullMQ guarantees at-least-once execution.
 */
export function createWorker<T = unknown>(
  name: QueueName,
  processor: Processor<T>,
  concurrency = 5,
): Worker<T> {
  return new Worker<T>(name, processor, { connection: getRedis(), concurrency });
}

export type { Job };
