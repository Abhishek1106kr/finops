import { prisma } from "@pazy-pro/database";
import { DomainEventType, InvoiceMatchedPayload } from "@pazy-pro/types";
import { createWorker, publishEvent, getQueue, QueueName, type Job } from "@pazy-pro/events";
import { createLogger } from "@pazy-pro/logging";
import type { Worker } from "bullmq";

interface MatchingJobData {
  invoiceId: string;
}

const logger = createLogger("worker:invoice-matching");
const MATCH_TOLERANCE_PCT = 0.02;

/**
 * 2-way match: invoice total vs. PO amount within tolerance. No PO on the
 * invoice yet (most of today's flow) means there's nothing to match against.
 */
async function processInvoiceMatching(job: Job<MatchingJobData>) {
  const { invoiceId } = job.data;
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });

  let matchType: "2-way" | "none" = "none";
  let matchStatus: "matched" | "partial" | "mismatched" = "matched";
  let variance = 0;

  if (invoice.purchaseOrderId) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: invoice.purchaseOrderId } });
    if (po) {
      matchType = "2-way";
      const poAmount = Number(po.amount);
      const invoiceAmount = Number(invoice.totalAmount);
      variance = poAmount === 0 ? 0 : Math.abs(invoiceAmount - poAmount) / poAmount;
      matchStatus = variance <= MATCH_TOLERANCE_PCT ? "matched" : variance <= 0.1 ? "partial" : "mismatched";
    }
  }

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "matched" } });

  const payload = InvoiceMatchedPayload.parse({
    invoiceId,
    purchaseOrderId: invoice.purchaseOrderId,
    matchType,
    matchStatus,
    variance,
  });
  await publishEvent(DomainEventType.InvoiceMatched, payload, {
    companyId: invoice.companyId,
    actor: { type: "agent", id: "invoice-agent" },
    idempotencyKey: `invoice:${invoiceId}:matched:${job.id}`,
  });

  await getQueue(QueueName.RiskScoring).add("score", { invoiceId }, { jobId: `risk:${invoiceId}` });

  logger.info({ invoiceId, matchType, matchStatus }, "invoice.matching.completed");
}

export function startInvoiceMatchingWorker(): Worker<MatchingJobData> {
  const worker = createWorker<MatchingJobData>(QueueName.InvoiceMatching, processInvoiceMatching, 5);
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "invoice.matching.failed"));
  return worker;
}
