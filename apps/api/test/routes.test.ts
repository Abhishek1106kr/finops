import { describe, it, expect, beforeAll, vi } from "vitest";

// Mock @pazy-pro/database to avoid requiring active DB connection during unit test runs
vi.mock("@pazy-pro/database", () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    vendor: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Acme Logistics India Pvt Ltd",
          gstin: "27AABCA1234D1ZP",
          pan: "AABCA1234D",
          status: "verified",
          riskScore: 0.02,
          blacklisted: false,
          createdAt: new Date("2026-07-23T00:00:00Z"),
        },
      ]),
      create: vi.fn().mockResolvedValue({
        id: "00000000-0000-0000-0000-000000000002",
        name: "CloudScale Software Solutions",
        gstin: "29AADCB9876E1ZQ",
        pan: "AADCB9876E",
        status: "pending_verification",
        riskScore: null,
        blacklisted: false,
        createdAt: new Date("2026-07-23T00:00:00Z"),
      }),
    },
    payment: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000003",
          invoiceId: "00000000-0000-0000-0000-000000000001",
          amount: 145000,
          currency: "INR",
          status: "completed",
          scheduledFor: null,
          bankReference: "BANK-8A9F01B3C4D5",
          idempotencyKey: "pay:001:123",
          createdAt: new Date("2026-07-23T00:00:00Z"),
        },
      ]),
    },
  },
}));

// Mock @pazy-pro/events redis client
vi.mock("@pazy-pro/events", () => ({
  redisClient: {
    ping: vi.fn().mockResolvedValue("PONG"),
  },
  publishEvent: vi.fn().mockResolvedValue(true),
  getQueue: vi.fn().mockReturnValue({
    add: vi.fn().mockResolvedValue({ id: "job-1" }),
  }),
  QueueName: {
    InvoiceOCR: "invoice-ocr",
  },
}));

import { buildApp } from "../src/app";
import type { FastifyInstance } from "fastify";

describe("Fastify Backend API Routes (/api/v1)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  it("POST /api/v1/mock/gst/verify - should validate GSTIN format and return mock response envelope", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/mock/gst/verify",
      payload: {
        gstin: "29AADCB9876E1ZQ",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.provider).toBe("GST_PORTAL_INDIA");
    expect(body.status).toBe("SUCCESS");
    expect(body.data.gstin).toBe("29AADCB9876E1ZQ");
    expect(body.data.legalName).toBe("CloudScale Software Solutions Pvt Ltd");
    expect(body.data.gstinStatus).toBe("Active");
  });

  it("POST /api/v1/mock/bank/payout-status - should return settlement rail details", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/mock/bank/payout-status",
      payload: {
        gatewayRef: "PZP-IMPS-8A9F01B3C4D5",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.provider).toBe("PAZYPAY_BANK");
    expect(body.data.settlementRail).toBe("IMPS");
    expect(body.data.bankUtr).toContain("UTR-2026");
  });

  it("POST /api/v1/mock/erp/sync-invoice - should return SAP document voucher number", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/mock/erp/sync-invoice",
      payload: {
        invoiceId: "00000000-0000-0000-0000-000000000001",
        glAccount: "GL-6020-CLOUD",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.provider).toBe("SAP_ERP_ADAPTER");
    expect(body.data.sapVoucherNumber).toContain("SAP-DOC-2026");
    expect(body.data.reconciled).toBe(true);
  });

  it("GET /api/v1/vendors - should return vendor list with standard success envelope", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/vendors",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0].name).toBe("Acme Logistics India Pvt Ltd");
  });

  it("GET /api/v1/payments - should return payment transactions list", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/payments",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0].bankReference).toBe("BANK-8A9F01B3C4D5");
  });
});
