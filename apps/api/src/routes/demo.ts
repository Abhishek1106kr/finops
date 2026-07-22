import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@pazy-pro/database";
import { DomainEventType } from "@pazy-pro/types";
import { publishEvent } from "@pazy-pro/events";

const ApiResponseSuccess = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });

export const demoRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000099";

  // POST /api/v1/demo/ingest-mock-data
  server.post(
    "/demo/ingest-mock-data",
    {
      schema: {
        response: {
          200: ApiResponseSuccess(z.object({ seededEntitiesCount: z.number(), message: z.string() })),
        },
      },
    },
    async () => {
      // 1. Company
      const company = await prisma.company.upsert({
        where: { id: DEMO_COMPANY_ID },
        update: {},
        create: {
          id: DEMO_COMPANY_ID,
          name: "InnovateTech Solutions",
          legalName: "InnovateTech Solutions India Pvt Ltd",
          gstin: "27AABCA9999F1Z0",
          baseCurrency: "INR",
          createdBy: "system",
        },
      });

      // 2. Department & Employee Approver
      const dept = await prisma.department.upsert({
        where: { id: "00000000-0000-0000-0000-000000000010" },
        update: {},
        create: {
          id: "00000000-0000-0000-0000-000000000010",
          companyId: company.id,
          name: "Engineering",
          costCenter: "ENG-01",
          createdBy: "system",
        },
      });

      const approver = await prisma.employee.upsert({
        where: { email: "priya.nair@innovatetech.example" },
        update: {},
        create: {
          departmentId: dept.id,
          fullName: "Priya Nair",
          email: "priya.nair@innovatetech.example",
          role: "VP of Engineering",
          isApprover: true,
          approvalTier: 1,
          createdBy: "system",
        },
      });

      // 3. Budget & Purchase Order
      const budget = await prisma.budget.upsert({
        where: { departmentId_fiscalPeriod: { departmentId: dept.id, fiscalPeriod: "2026-Q3" } },
        update: {},
        create: {
          companyId: company.id,
          departmentId: dept.id,
          fiscalPeriod: "2026-Q3",
          allocated: 10_000_000,
          spent: 2_450_000,
          createdBy: "system",
        },
      });

      // 4. Vendors
      const vendor1 = await prisma.vendor.create({
        data: {
          companyId: company.id,
          name: "CloudScale Software Solutions",
          gstin: "29AADCB9876E1ZQ",
          pan: "AADCB9876E",
          riskScore: 0.04,
          status: "verified",
          createdBy: DEMO_USER_ID,
        },
      });

      // 5. Invoices & Line Items
      const invoice = await prisma.invoice.create({
        data: {
          companyId: company.id,
          vendorId: vendor1.id,
          invoiceNumber: "INV-2026-0891",
          currency: "INR",
          totalAmount: 145000,
          status: "approved",
          fileUrl: "https://storage.pazypro.local/invoices/demo-inv-1.pdf",
          fileHash: `hash-${Date.now()}-${Math.random()}`,
          ocrConfidence: 0.98,
          riskScore: 0.02,
          createdBy: DEMO_USER_ID,
        },
      });

      await prisma.invoiceLineItem.createMany({
        data: [
          {
            invoiceId: invoice.id,
            description: "Cloud Infrastructure Hosting - Monthly Reserved Instance",
            quantity: 1,
            unitPrice: 145000,
            amount: 145000,
            glAccount: "GL-6020-CLOUD",
            createdBy: DEMO_USER_ID,
          },
        ],
      });

      // Emit domain event for mock ingestion
      await publishEvent(
        DomainEventType.InvoiceUploaded,
        {
          invoiceId: invoice.id,
          vendorId: vendor1.id,
          fileUrl: invoice.fileUrl,
          fileHash: invoice.fileHash,
          uploadedBy: DEMO_USER_ID,
          sizeBytes: 409600,
          mimeType: "application/pdf",
        },
        {
          companyId: company.id,
          actor: { type: "system", id: "demo-ingestion-system" },
        },
      );

      return {
        success: true as const,
        data: {
          seededEntitiesCount: 5,
          message: "Mock financial intelligence data successfully ingested into Company Intelligence Graph.",
        },
      };
    },
  );
};
