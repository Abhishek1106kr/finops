import { prisma } from "@pazy-pro/database";
import { createWorker, getQueue, QueueName, withLock, type Job } from "@pazy-pro/events";
import { createGateway } from "@pazy-pro/payment-engine";
import { createLogger } from "@pazy-pro/logging";
import type { Worker } from "bullmq";

interface PaymentExecutionJobData {
  paymentId: string;
}

const logger = createLogger("worker:payment-execution");

/**
 * Hands a scheduled payment to PazyPro's own gateway (`PazyPayGateway`).
 * Locked per-payment via Redlock so a retried/duplicate job can never
 * initiate the same payout twice; the gateway reference is unique in the DB
 * as a second line of idempotency defense.
 */
async function processPaymentExecution(job: Job<PaymentExecutionJobData>) {
  const { paymentId } = job.data;

  await withLock(`payment:${paymentId}`, 30_000, async () => {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });

    if (payment.status !== "scheduled") {
      logger.info({ paymentId, status: payment.status }, "payment.execution.skipped_not_scheduled");
      return;
    }

    const gateway = createGateway();
    const { gatewayReference, railType } = gateway.initiate({
      paymentId,
      amount: Number(payment.amount),
      currency: payment.currency,
      beneficiaryAccount: "vendor-primary-account",
      beneficiaryIfsc: "HDFC0000001",
    });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "processing", gatewayReference, railType },
    });

    // Simulates the bank's async settlement callback. In production this
    // delay is real network/settlement time and the callback arrives over
    // HTTP at POST /api/v1/payments/webhook instead of this queue.
    await getQueue(QueueName.PaymentGatewayCallback).add(
      "callback",
      { paymentId, gatewayReference },
      { delay: 4000, jobId: `callback:${paymentId}` },
    );

    logger.info({ paymentId, gatewayReference, railType }, "payment.execution.initiated");
  });
}

export function startPaymentExecutionWorker(): Worker<PaymentExecutionJobData> {
  const worker = createWorker<PaymentExecutionJobData>(QueueName.PaymentExecution, processPaymentExecution, 5);
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "payment.execution.failed"));
  return worker;
}
