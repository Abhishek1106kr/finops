import { prisma } from "@pazy-pro/database";
import { DomainEventType, VendorVerifiedPayload } from "@pazy-pro/types";
import { createWorker, publishEvent, QueueName, type Job } from "@pazy-pro/events";
import { runVendorAgent } from "@pazy-pro/ai";
import { createLogger } from "@pazy-pro/logging";
import type { Worker } from "bullmq";

interface VendorVerificationJobData {
  vendorId: string;
}

const logger = createLogger("worker:vendor-verification");

async function processVendorVerification(job: Job<VendorVerificationJobData>) {
  const { vendorId } = job.data;
  const result = await runVendorAgent(vendorId);

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      status: result.decision,
      riskScore: result.riskScore,
      blacklisted: result.blacklisted,
    },
  });

  const payload = VendorVerifiedPayload.parse({
    vendorId,
    gstValid: result.gstValid,
    panValid: result.panValid,
    bankAccountValid: result.bankAccountValid,
    blacklisted: result.blacklisted,
  });

  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  await publishEvent(DomainEventType.VendorVerified, payload, {
    companyId: vendor.companyId,
    actor: { type: "agent", id: "vendor-agent" },
    idempotencyKey: `vendor:${vendorId}:verified:${job.id}`,
  });

  logger.info({ vendorId, decision: result.decision, riskScore: result.riskScore }, "vendor.verification.completed");
}

export function startVendorVerificationWorker(): Worker<VendorVerificationJobData> {
  const worker = createWorker<VendorVerificationJobData>(
    QueueName.VendorVerification,
    processVendorVerification,
    5,
  );
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "vendor.verification.failed"));
  return worker;
}
