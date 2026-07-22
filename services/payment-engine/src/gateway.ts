import { createHash, createHmac, randomUUID } from "node:crypto";

export type RailType = "imps" | "neft" | "rtgs";

export interface GatewayInitiateInput {
  paymentId: string;
  amount: number;
  currency: string;
  beneficiaryAccount: string;
  beneficiaryIfsc: string;
}

export interface GatewayInitiateResult {
  gatewayReference: string;
  railType: RailType;
}

export type SettlementOutcome =
  | { outcome: "settled"; bankReference: string }
  | { outcome: "failed"; failureReason: "insufficient_funds" | "invalid_account" | "bank_timeout" };

/**
 * PazyPro's own payout gateway — not a wrapper around Razorpay/Stripe/etc.
 * Selects an Indian settlement rail by amount (mirrors real bank rail
 * limits), issues a gateway reference, and signs/verifies webhook payloads
 * with HMAC-SHA256 the same way a third-party gateway would, so the rest of
 * the system integrates with it exactly like it would any external PSP.
 */
export class PazyPayGateway {
  constructor(private readonly webhookSecret: string) {}

  selectRail(amount: number): RailType {
    if (amount <= 200_000) return "imps"; // instant, small-value
    if (amount <= 1_000_000) return "neft"; // batched settlement windows
    return "rtgs"; // large-value, real-time gross settlement
  }

  /** Initiates a payout. Idempotent by construction: callers pass a stable paymentId. */
  initiate(input: GatewayInitiateInput): GatewayInitiateResult {
    const railType = this.selectRail(input.amount);
    const suffix = createHash("sha256").update(input.paymentId).digest("hex").slice(0, 10);
    return {
      gatewayReference: `PZP-${railType.toUpperCase()}-${suffix}`,
      railType,
    };
  }

  /** Signs an outbound webhook payload the way PazyPay's callback service would. */
  sign(payload: Record<string, unknown>): string {
    const body = JSON.stringify(payload, Object.keys(payload).sort());
    return createHmac("sha256", this.webhookSecret).update(body).digest("hex");
  }

  /** Verifies an inbound webhook's signature before trusting its payload. */
  verify(payload: Record<string, unknown>, signature: string): boolean {
    const expected = this.sign(payload);
    return expected === signature;
  }

  /**
   * Simulates the bank rail's async settlement decision. A real deployment
   * replaces this with the actual NEFT/IMPS/RTGS network integration; every
   * caller-facing contract (gateway reference, signed webhook) stays
   * identical, so swapping the simulation for a real rail is a one-file change.
   */
  simulateSettlement(): SettlementOutcome {
    const roll = Math.random();
    if (roll < 0.9) {
      return { outcome: "settled", bankReference: `BANK-${randomUUID().slice(0, 12).toUpperCase()}` };
    }
    const reasons: SettlementOutcome[] = [
      { outcome: "failed", failureReason: "insufficient_funds" },
      { outcome: "failed", failureReason: "invalid_account" },
      { outcome: "failed", failureReason: "bank_timeout" },
    ];
    return reasons[Math.floor(Math.random() * reasons.length)]!;
  }
}

export function createGateway(): PazyPayGateway {
  const secret = process.env.PAZYPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("PAZYPAY_WEBHOOK_SECRET is not set");
  return new PazyPayGateway(secret);
}
