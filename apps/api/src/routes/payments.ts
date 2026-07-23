import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@pazy-pro/database";
import { DomainEventType } from "@pazy-pro/types";
import { publishEvent } from "@pazy-pro/events";
import { PazyPayGateway } from "@pazy-pro/payment-engine";

const PaymentResponse = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  scheduledFor: z.string().nullable(),
  bankReference: z.string().nullable(),
  idempotencyKey: z.string(),
  createdAt: z.string(),
});

const ApiResponseSuccess = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });

export const paymentRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000099";
  const gateway = new PazyPayGateway("demo-secret-key-12345");

  // GET /api/v1/payments
  server.get(
    "/payments",
    {
      schema: {
        response: {
          200: ApiResponseSuccess(z.array(PaymentResponse)),
        },
      },
    },
    async () => {
      const payments = await prisma.payment.findMany({
        where: { companyId: DEMO_COMPANY_ID, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true as const,
        data: payments.map((p: any) => ({
          id: p.id,
          invoiceId: p.invoiceId,
          amount: Number(p.amount),
          currency: p.currency,
          status: p.status,
          scheduledFor: p.scheduledFor ? new Date(p.scheduledFor).toISOString() : null,
          bankReference: p.bankReference,
          idempotencyKey: p.idempotencyKey,
          createdAt: new Date(p.createdAt).toISOString(),
        })),
        meta: { count: payments.length },
      };
    },
  );

  // POST /api/v1/payments/process
  server.post(
    "/payments/process",
    {
      schema: {
        body: z.object({
          invoiceId: z.string().uuid(),
          amount: z.number().positive(),
          beneficiaryAccount: z.string().default("918237465012"),
          beneficiaryIfsc: z.string().default("HDFC0001234"),
        }),
        response: {
          200: ApiResponseSuccess(PaymentResponse),
        },
      },
    },
    async (req) => {
      const { invoiceId, amount, beneficiaryAccount, beneficiaryIfsc } = req.body;
      const idempotencyKey = `pay:${invoiceId}:${Date.now()}`;

      const initResult = gateway.initiate({
        paymentId: idempotencyKey,
        amount,
        currency: "INR",
        beneficiaryAccount,
        beneficiaryIfsc,
      });

      const outcome = gateway.simulateSettlement();
      const isSettled = outcome.outcome === "settled";
      const bankRef = isSettled ? outcome.bankReference : initResult.gatewayReference;
      const status = isSettled ? "completed" : "failed";

      const payment = await prisma.payment.create({
        data: {
          companyId: DEMO_COMPANY_ID,
          invoiceId,
          amount,
          currency: "INR",
          status,
          bankReference: bankRef,
          idempotencyKey,
          createdBy: DEMO_USER_ID,
        },
      });

      if (isSettled) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "paid" },
        });

        await publishEvent(
          DomainEventType.PaymentCompleted,
          {
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
            bankReference: bankRef,
            amount: Number(payment.amount),
            currency: payment.currency,
            completedAt: new Date().toISOString(),
          },
          {
            companyId: DEMO_COMPANY_ID,
            actor: { type: "system", id: "pazypay-gateway" },
            idempotencyKey: `event:payment:${payment.id}:completed`,
          },
        );
      }

      return {
        success: true as const,
        data: {
          id: payment.id,
          invoiceId: payment.invoiceId,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status,
          scheduledFor: payment.scheduledFor ? new Date(payment.scheduledFor).toISOString() : null,
          bankReference: payment.bankReference,
          idempotencyKey: payment.idempotencyKey,
          createdAt: new Date(payment.createdAt).toISOString(),
        },
      };
    },
  );
};

export async function schedulePaymentForInvoice(invoiceId: string, actorId: string) {
  const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) return;

  const idempotencyKey = `pay:auto:${invoiceId}:${Date.now()}`;
  const payment = await prisma.payment.create({
    data: {
      companyId: inv.companyId,
      invoiceId: inv.id,
      amount: inv.totalAmount,
      currency: inv.currency,
      status: "scheduled",
      idempotencyKey,
      createdBy: actorId,
    },
  });

  await publishEvent(
    DomainEventType.PaymentScheduled,
    {
      paymentId: payment.id,
      invoiceId: inv.id,
      amount: Number(inv.totalAmount),
      currency: inv.currency,
      scheduledFor: new Date().toISOString(),
      idempotencyKey,
    },
    {
      companyId: inv.companyId,
      actor: { type: "user", id: actorId },
    },
  );

  return payment;
}
