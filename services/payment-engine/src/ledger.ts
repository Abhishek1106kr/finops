import type { Prisma } from "@pazy-pro/database";

interface PostSettlementInput {
  companyId: string;
  paymentId: string;
  amount: number;
  currency: string;
  createdBy: string;
}

/**
 * Posts a balanced double-entry pair for a settled vendor payment:
 * debit Accounts Payable (the liability is cleared), credit Cash/Operating
 * (cash leaves the bank). Runs inside the caller's transaction so ledger
 * rows and the payment status flip atomically.
 */
export async function postSettlementEntries(
  tx: Prisma.TransactionClient,
  input: PostSettlementInput,
): Promise<void> {
  const { companyId, paymentId, amount, currency, createdBy } = input;

  await tx.ledgerEntry.createMany({
    data: [
      {
        companyId,
        paymentId,
        account: "accounts_payable",
        direction: "debit",
        amount,
        currency,
        createdBy,
      },
      {
        companyId,
        paymentId,
        account: "cash_operating",
        direction: "credit",
        amount,
        currency,
        createdBy,
      },
    ],
  });
}
