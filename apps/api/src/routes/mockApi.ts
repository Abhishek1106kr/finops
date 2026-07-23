import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const MockResponseEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    provider: z.string(),
    status: z.enum(["SUCCESS", "FAILED", "PENDING"]),
    timestamp: z.string(),
    requestId: z.string(),
    data: dataSchema,
  });

export const mockApiRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // 1. GST Verification Mock API: POST /api/v1/mock/gst/verify
  server.post(
    "/mock/gst/verify",
    {
      schema: {
        body: z.object({
          gstin: z.string().min(15).max(15),
        }),
        response: {
          200: MockResponseEnvelope(
            z.object({
              gstin: z.string(),
              legalName: z.string(),
              tradeName: z.string(),
              gstinStatus: z.string(),
              stateJurisdiction: z.string(),
              einvoiceEligible: z.boolean(),
            }),
          ),
        },
      },
    },
    async (req) => {
      const { gstin } = req.body;
      return {
        provider: "GST_PORTAL_INDIA",
        status: "SUCCESS" as const,
        timestamp: new Date().toISOString(),
        requestId: `mock-gst-${Date.now()}`,
        data: {
          gstin,
          legalName: "CloudScale Software Solutions Pvt Ltd",
          tradeName: "CloudScale Systems",
          gstinStatus: "Active",
          stateJurisdiction: "Karnataka - Zone 1",
          einvoiceEligible: true,
        },
      };
    },
  );

  // 2. Bank Payout Status Mock API: POST /api/v1/mock/bank/payout-status
  server.post(
    "/mock/bank/payout-status",
    {
      schema: {
        body: z.object({
          gatewayRef: z.string(),
        }),
        response: {
          200: MockResponseEnvelope(
            z.object({
              gatewayReference: z.string(),
              settlementRail: z.string(),
              bankUtr: z.string(),
              beneficiaryAccount: z.string(),
              clearanceTimeMs: z.number(),
            }),
          ),
        },
      },
    },
    async (req) => {
      const { gatewayRef } = req.body;
      return {
        provider: "PAZYPAY_BANK",
        status: "SUCCESS" as const,
        timestamp: new Date().toISOString(),
        requestId: `mock-bank-${Date.now()}`,
        data: {
          gatewayReference: gatewayRef,
          settlementRail: gatewayRef.includes("RTGS") ? "RTGS" : gatewayRef.includes("NEFT") ? "NEFT" : "IMPS",
          bankUtr: `UTR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          beneficiaryAccount: "918237465012",
          clearanceTimeMs: 120,
        },
      };
    },
  );

  // 3. ERP Sync Mock API (SAP/NetSuite): POST /api/v1/mock/erp/sync-invoice
  server.post(
    "/mock/erp/sync-invoice",
    {
      schema: {
        body: z.object({
          invoiceId: z.string().uuid(),
          glAccount: z.string().default("GL-6020-CLOUD"),
        }),
        response: {
          200: MockResponseEnvelope(
            z.object({
              invoiceId: z.string(),
              sapVoucherNumber: z.string(),
              glAccount: z.string(),
              postingPeriod: z.string(),
              reconciled: z.boolean(),
            }),
          ),
        },
      },
    },
    async (req) => {
      const { invoiceId, glAccount } = req.body;
      return {
        provider: "SAP_ERP_ADAPTER",
        status: "SUCCESS" as const,
        timestamp: new Date().toISOString(),
        requestId: `mock-erp-${Date.now()}`,
        data: {
          invoiceId,
          sapVoucherNumber: `SAP-DOC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          glAccount,
          postingPeriod: "2026-07",
          reconciled: true,
        },
      };
    },
  );
};
