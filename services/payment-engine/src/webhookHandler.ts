import { prisma } from "@pazy-pro/database";
import { DomainEventType, PaymentCompletedPayload } from "@pazy-pro/types";
import { publishEvent } from "@pazy-pro/events";
import { createLogger } from "@pazy-pro/logging";
import { createGateway } from "./gateway";
import { postSettlementEntries } from "./ledger";

const logger = createLogger("payment-engine:webhook");

export interface GatewayCallbackPayload {
  gatewayReference: string;
  outcome: "settled" | "failed";
  bankReference?: string;
  failureReason?: string;
}

const TERMINAL_STATUSES = new Set(["completed", "failed"]);

export async function handleGatewayCallback(
  payload: GatewayCallbackPayload,
  signature: string,
): Promise<{ handled: boolean }> {
  const gateway = createGateway();
  if (!gateway.verify(payload as unknown as Record<string, unknown>, signature)) {
    throw new Error("Invalid webhook signature");
  }

  const payment = await prisma.payment.findUnique({ where: { gatewayReference: payload.gatewayReference } });
  if (!payment) throw new Error(`No payment found for gateway reference ${payload.gatewayReference}`);

  if (TERMINAL_STATUSES.has(payment.status)) {
    logger.info({ paymentId: payment.id, status: payment.status }, "payment.webhook.already_terminal");
    return { handled: false };
  }

  if (payload.outcome === "settled") {
    await prisma.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "completed", bankReference: payload.bankReference },
      });
      await postSettlementEntries(tx, {
        companyId: payment.companyId,
        paymentId: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        createdBy: payment.createdBy,
      });
    });

    const completedPayload = PaymentCompletedPayload.parse({
      paymentId: payment.id,
      invoiceId: payment.invoiceId,
      bankReference: payload.bankReference ?? "",
      amount: Number(payment.amount),
      currency: payment.currency,
      completedAt: new Date().toISOString(),
    });
    await publishEvent(DomainEventType.PaymentCompleted, completedPayload, {
      companyId: payment.companyId,
      actor: { type: "system", id: "pazypay-gateway" },
      idempotencyKey: `payment:${payment.id}:completed`,
    });
    logger.info({ paymentId: payment.id }, "payment.settled");
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed", failureReason: payload.failureReason },
    });

    await publishEvent(
      DomainEventType.PaymentFailed,
      {
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        amount: Number(payment.amount),
        currency: payment.currency,
        failureReason: payload.failureReason ?? "unknown",
      },
      {
        companyId: payment.companyId,
        actor: { type: "system", id: "pazypay-gateway" },
        idempotencyKey: `payment:${payment.id}:failed`,
      },
    );
    logger.warn({ paymentId: payment.id, reason: payload.failureReason }, "payment.failed");
  }

  return { handled: true };
}
