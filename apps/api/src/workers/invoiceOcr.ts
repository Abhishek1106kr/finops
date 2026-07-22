import { prisma } from "@pazy-pro/database";
import { DomainEventType, InvoiceParsedPayload, OCRCompletedPayload } from "@pazy-pro/types";
import { createWorker, publishEvent, getQueue, QueueName, type Job } from "@pazy-pro/events";
import type { Worker } from "bullmq";
import { createLogger } from "@pazy-pro/logging";

interface OcrJobData {
  invoiceId: string;
}

const logger = createLogger("worker:invoice-ocr");

/**
 * Simulates OCR extraction (a real implementation calls an OCR/LLM provider).
 * Idempotent: re-running for the same invoiceId simply overwrites the OCR
 * metadata rather than creating a duplicate row.
 */
async function processInvoiceOcr(job: Job<OcrJobData>) {
  const { invoiceId } = job.data;
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });

  const confidence = 0.94;
  const mockExtraction = {
    vendorName: "Sample Vendor Pvt Ltd",
    invoiceNumber: `INV-${invoice.id.slice(0, 8).toUpperCase()}`,
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    currency: "INR",
    totalAmount: 42500,
    lineItems: [{ description: "Professional services", quantity: 1, unitPrice: 42500, amount: 42500 }],
  };

  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "parsed",
        invoiceNumber: mockExtraction.invoiceNumber,
        totalAmount: mockExtraction.totalAmount,
        dueDate: mockExtraction.dueDate,
        ocrConfidence: confidence,
      },
    }),
    prisma.oCRMetadata.upsert({
      where: { invoiceId },
      update: { confidenceScore: confidence, lowConfidenceFields: [] },
      create: {
        invoiceId,
        rawText: "[mock OCR raw text]",
        confidenceScore: confidence,
        lowConfidenceFields: [],
        createdBy: invoice.createdBy,
      },
    }),
  ]);

  const parsedPayload = InvoiceParsedPayload.parse({ invoiceId, ...mockExtraction });
  await publishEvent(DomainEventType.InvoiceParsed, parsedPayload, {
    companyId: invoice.companyId,
    actor: { type: "agent", id: "invoice-agent" },
    idempotencyKey: `invoice:${invoiceId}:parsed:${job.id}`,
  });

  const ocrPayload = OCRCompletedPayload.parse({
    invoiceId,
    confidenceScore: confidence,
    requiresManualReview: confidence < 0.85,
    lowConfidenceFields: [],
  });
  await publishEvent(DomainEventType.OCRCompleted, ocrPayload, {
    companyId: invoice.companyId,
    actor: { type: "agent", id: "invoice-agent" },
    idempotencyKey: `invoice:${invoiceId}:ocr-completed:${job.id}`,
  });

  await getQueue(QueueName.InvoiceMatching).add(
    "match",
    { invoiceId },
    { jobId: `match:${invoiceId}` },
  );

  logger.info({ invoiceId, confidence }, "invoice.ocr.completed");
}

export function startInvoiceOcrWorker(): Worker<OcrJobData> {
  const worker = createWorker<OcrJobData>(QueueName.InvoiceOCR, processInvoiceOcr, 5);
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "invoice.ocr.failed"));
  return worker;
}
