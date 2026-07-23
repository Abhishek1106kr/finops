import { createHash, randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@pazy-pro/database";
import { DomainEventType, InvoiceUploadedPayload } from "@pazy-pro/types";
import { publishEvent, getQueue, QueueName } from "@pazy-pro/events";

const InvoiceResponse = z.object({
  id: z.string().uuid(),
  status: z.string(),
  invoiceNumber: z.string().nullable(),
  totalAmount: z.number(),
  currency: z.string(),
  fileUrl: z.string(),
  createdAt: z.string(),
});

export const invoiceRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000099";

  server.get(
    "/invoices",
    {
      schema: {
        querystring: z.object({ status: z.string().optional() }),
        response: { 200: z.array(InvoiceResponse) },
      },
    },
    async (req) => {
      const invoices = await prisma.invoice.findMany({
        where: {
          companyId: DEMO_COMPANY_ID,
          deletedAt: null,
          status: req.query.status,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return invoices.map((inv: any) => ({
        id: inv.id,
        status: inv.status,
        invoiceNumber: inv.invoiceNumber,
        totalAmount: Number(inv.totalAmount),
        currency: inv.currency,
        fileUrl: inv.fileUrl,
        createdAt: new Date(inv.createdAt).toISOString(),
      }));
    },
  );

  server.get(
    "/invoices/:id",
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: { 200: InvoiceResponse, 404: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const inv = await prisma.invoice.findFirst({
        where: { id: req.params.id, companyId: DEMO_COMPANY_ID, deletedAt: null },
      });
      if (!inv) {
        reply.status(404);
        return { message: "Invoice not found" };
      }
      return {
        id: inv.id,
        status: inv.status,
        invoiceNumber: inv.invoiceNumber,
        totalAmount: Number(inv.totalAmount),
        currency: inv.currency,
        fileUrl: inv.fileUrl,
        createdAt: new Date(inv.createdAt).toISOString(),
      };
    },
  );

  server.post(
    "/invoices",
    {
      schema: {
        response: { 201: InvoiceResponse, 400: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const file = await req.file();
      if (!file) {
        reply.status(400);
        return { message: "No file uploaded" };
      }

      const buffer = await file.toBuffer();
      const fileHash = createHash("sha256").update(buffer).digest("hex");

      const existing = await prisma.invoice.findUnique({ where: { fileHash } });
      if (existing) {
        reply.status(201);
        return {
          id: existing.id,
          status: existing.status,
          invoiceNumber: existing.invoiceNumber,
          totalAmount: Number(existing.totalAmount),
          currency: existing.currency,
          fileUrl: existing.fileUrl,
          createdAt: new Date(existing.createdAt).toISOString(),
        };
      }

      const fileUrl = `https://storage.pazypro.local/invoices/${fileHash}/${file.filename}`;
      const generatedInvNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const invoice = await prisma.invoice.create({
        data: {
          id: randomUUID(),
          companyId: DEMO_COMPANY_ID,
          invoiceNumber: generatedInvNumber,
          totalAmount: 145000,
          status: "uploaded",
          currency: "INR",
          fileUrl,
          fileHash,
          createdBy: DEMO_USER_ID,
        },
      });

      const payload = InvoiceUploadedPayload.parse({
        invoiceId: invoice.id,
        vendorId: null,
        fileUrl,
        fileHash,
        uploadedBy: DEMO_USER_ID,
        sizeBytes: buffer.byteLength,
        mimeType: file.mimetype,
      });

      try {
        await publishEvent(DomainEventType.InvoiceUploaded, payload, {
          companyId: DEMO_COMPANY_ID,
          actor: { type: "user", id: DEMO_USER_ID },
          idempotencyKey: `invoice:${invoice.id}:uploaded`,
        });

        await getQueue(QueueName.InvoiceOCR).add(
          "ocr",
          { invoiceId: invoice.id },
          { jobId: `ocr-${invoice.id}` },
        );
      } catch (e) {
        req.log.warn({ invoiceId: invoice.id }, "redis.offline.queue_skipped");
      }

      req.log.info({ invoiceId: invoice.id }, "invoice.uploaded");

      reply.status(201);
      return {
        id: invoice.id,
        status: invoice.status,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.totalAmount),
        currency: invoice.currency,
        fileUrl: invoice.fileUrl,
        createdAt: new Date(invoice.createdAt).toISOString(),
      };
    },
  );
};
