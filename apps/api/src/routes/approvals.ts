import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@pazy-pro/database";
import { DomainEventType } from "@pazy-pro/types";
import { publishEvent } from "@pazy-pro/events";
import { schedulePaymentForInvoice } from "./payments";

const ApprovalResponse = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string(),
  invoiceId: z.string().nullable(),
  tier: z.number(),
  status: z.string(),
  createdAt: z.string(),
});

const ApiResponseSuccess = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });

export const approvalRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000099";

  // GET /api/v1/approvals
  server.get(
    "/approvals",
    {
      schema: {
        response: {
          200: ApiResponseSuccess(z.array(ApprovalResponse)),
        },
      },
    },
    async () => {
      const approvals = await prisma.approval.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true as const,
        data: approvals.map((a: any) => ({
          id: a.id,
          entityType: a.entityType,
          entityId: a.entityId,
          invoiceId: a.invoiceId,
          tier: a.tier,
          status: a.status,
          createdAt: a.createdAt.toISOString(),
        })),
        meta: { count: approvals.length },
      };
    },
  );

  // POST /api/v1/approvals/:id/approve
  server.post(
    "/approvals/:id/approve",
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: ApiResponseSuccess(ApprovalResponse),
        },
      },
    },
    async (req) => {
      const approval = await prisma.approval.update({
        where: { id: req.params.id },
        data: {
          status: "approved",
          decidedAt: new Date(),
        },
      });

      await publishEvent(
        DomainEventType.ApprovalGranted,
        {
          approvalId: approval.id,
          entityType: approval.entityType,
          entityId: approval.entityId,
          invoiceId: approval.invoiceId ?? undefined,
          approverId: DEMO_USER_ID,
          tier: approval.tier,
        },
        {
          companyId: DEMO_COMPANY_ID,
          actor: { type: "user", id: DEMO_USER_ID },
        },
      );

      if (approval.entityType === "invoice" && approval.invoiceId) {
        await prisma.invoice.update({
          where: { id: approval.invoiceId },
          data: { status: "approved" },
        });
        await schedulePaymentForInvoice(approval.invoiceId, DEMO_USER_ID);
      }

      return {
        success: true as const,
        data: {
          id: approval.id,
          entityType: approval.entityType,
          entityId: approval.entityId,
          invoiceId: approval.invoiceId,
          tier: approval.tier,
          status: approval.status,
          createdAt: approval.createdAt.toISOString(),
        },
      };
    },
  );
};
