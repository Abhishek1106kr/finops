import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@pazy-pro/database";
import { DomainEventType } from "@pazy-pro/types";
import { publishEvent, getQueue, QueueName } from "@pazy-pro/events";

const VendorResponse = z.object({
  id: z.string().uuid(),
  name: z.string(),
  gstin: z.string().nullable(),
  pan: z.string().nullable(),
  status: z.string(),
  riskScore: z.number().nullable(),
  blacklisted: z.boolean(),
  createdAt: z.string(),
});

const ApiResponseSuccess = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });

const ApiResponseError = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const vendorRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000099";

  // GET /api/v1/vendors
  server.get(
    "/vendors",
    {
      schema: {
        response: {
          200: ApiResponseSuccess(z.array(VendorResponse)),
        },
      },
    },
    async () => {
      const vendors = await prisma.vendor.findMany({
        where: { companyId: DEMO_COMPANY_ID, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true as const,
        data: vendors.map((v: any) => ({
          id: v.id,
          name: v.name,
          gstin: v.gstin,
          pan: v.pan,
          status: v.status,
          riskScore: v.riskScore ? Number(v.riskScore) : null,
          blacklisted: v.blacklisted,
          createdAt: new Date(v.createdAt).toISOString(),
        })),
        meta: { count: vendors.length },
      };
    },
  );

  // POST /api/v1/vendors
  server.post(
    "/vendors",
    {
      schema: {
        body: z.object({
          name: z.string().min(2),
          gstin: z.string().optional(),
          pan: z.string().optional(),
        }),
        response: {
          201: ApiResponseSuccess(VendorResponse),
          400: ApiResponseError,
        },
      },
    },
    async (req, reply) => {
      const { name, gstin, pan } = req.body;

      const vendor = await prisma.vendor.create({
        data: {
          companyId: DEMO_COMPANY_ID,
          name,
          gstin,
          pan,
          status: "pending_verification",
          createdBy: DEMO_USER_ID,
        },
      });

      await publishEvent(
        DomainEventType.VendorCreated,
        {
          vendorId: vendor.id,
          name: vendor.name,
          gstin: vendor.gstin ?? undefined,
          createdBy: DEMO_USER_ID,
        },
        {
          companyId: DEMO_COMPANY_ID,
          actor: { type: "user", id: DEMO_USER_ID },
        },
      );

      await getQueue(QueueName.VendorVerification).add(
        "verify",
        { vendorId: vendor.id },
        { jobId: `verify:${vendor.id}` },
      );

      reply.status(201);
      return {
        success: true as const,
        data: {
          id: vendor.id,
          name: vendor.name,
          gstin: vendor.gstin,
          pan: vendor.pan,
          status: vendor.status,
          riskScore: vendor.riskScore ? Number(vendor.riskScore) : null,
          blacklisted: vendor.blacklisted,
          createdAt: new Date(vendor.createdAt).toISOString(),
        },
      };
    },
  );
};
