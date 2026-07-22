import { randomUUID } from "node:crypto";
import { prisma } from "@pazy-pro/database";
import { ApprovalRequestedPayload, DomainEventType, RiskDetectedPayload } from "@pazy-pro/types";
import { createWorker, publishEvent, QueueName, type Job } from "@pazy-pro/events";
import { runRiskAgent } from "@pazy-pro/ai";
import { createLogger } from "@pazy-pro/logging";
import type { Worker } from "bullmq";

interface RiskScoringJobData {
  invoiceId: string;
}

const logger = createLogger("worker:risk-scoring");
const FLAG_THRESHOLD = 0.5;

async function processRiskScoring(job: Job<RiskScoringJobData>) {
  const { invoiceId } = job.data;
  const result = await runRiskAgent(invoiceId);
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });

  const flagged = result.score >= FLAG_THRESHOLD;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { riskScore: result.score, status: flagged ? "flagged" : "pending_approval" },
  });

  if (flagged && result.riskType) {
    const riskPayload = RiskDetectedPayload.parse({
      riskId: randomUUID(),
      entityType: "invoice",
      entityId: invoiceId,
      riskType: result.riskType,
      score: result.score,
      details: { duplicateFound: result.duplicateFound, splitInvoicingSuspected: result.splitInvoicingSuspected },
    });
    await publishEvent(DomainEventType.RiskDetected, riskPayload, {
      companyId: invoice.companyId,
      actor: { type: "agent", id: "risk-agent" },
      idempotencyKey: `invoice:${invoiceId}:risk:${job.id}`,
    });
  }

  // Flagged invoices still route to approval — they just carry the flag
  // forward for the approver to see, rather than dead-ending the pipeline.
  const approver = await prisma.employee.findFirst({ where: { isApprover: true } });
  if (!approver) {
    logger.warn({ invoiceId }, "risk.scoring.no_approver_configured");
    return;
  }

  const approval = await prisma.approval.create({
    data: {
      entityType: "invoice",
      entityId: invoiceId,
      invoiceId,
      tier: 1,
      approverId: approver.id,
      status: "pending",
      createdBy: "risk-agent",
    },
  });

  const approvalPayload = ApprovalRequestedPayload.parse({
    approvalId: approval.id,
    entityType: "invoice",
    entityId: invoiceId,
    approverIds: [approver.id],
    tier: 1,
  });
  await publishEvent(DomainEventType.ApprovalRequested, approvalPayload, {
    companyId: invoice.companyId,
    actor: { type: "agent", id: "risk-agent" },
    idempotencyKey: `invoice:${invoiceId}:approval-requested:${job.id}`,
  });

  logger.info({ invoiceId, score: result.score, flagged }, "risk.scoring.completed");
}

export function startRiskScoringWorker(): Worker<RiskScoringJobData> {
  const worker = createWorker<RiskScoringJobData>(QueueName.RiskScoring, processRiskScoring, 5);
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "risk.scoring.failed"));
  return worker;
}
