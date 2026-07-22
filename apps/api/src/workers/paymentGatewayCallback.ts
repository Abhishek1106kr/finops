import { createWorker, QueueName, type Job } from "@pazy-pro/events";
import { createGateway, handleGatewayCallback } from "@pazy-pro/payment-engine";
import { createLogger } from "@pazy-pro/logging";
import type { Worker } from "bullmq";

interface CallbackJobData {
  paymentId: string;
  gatewayReference: string;
}

const logger = createLogger("worker:payment-gateway-callback");

/**
 * Stands in for the bank/gateway calling `POST /api/v1/payments/webhook`.
 * Builds a signed payload exactly like a real callback and hands it to the
 * same `handleGatewayCallback` the HTTP route uses, so this queue and the
 * webhook route are provably consistent — swap this worker out for a real
 * bank integration and nothing downstream changes.
 */
async function processGatewayCallback(job: Job<CallbackJobData>) {
  const gateway = createGateway();
  const outcome = gateway.simulateSettlement();
  const payload = { gatewayReference: job.data.gatewayReference, ...outcome };
  const signature = gateway.sign(payload as unknown as Record<string, unknown>);

  await handleGatewayCallback(payload, signature);
  logger.info({ paymentId: job.data.paymentId, outcome: outcome.outcome }, "payment.gateway_callback.processed");
}

export function startPaymentGatewayCallbackWorker(): Worker<CallbackJobData> {
  const worker = createWorker<CallbackJobData>(QueueName.PaymentGatewayCallback, processGatewayCallback, 5);
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "payment.gateway_callback.failed"));
  return worker;
}
