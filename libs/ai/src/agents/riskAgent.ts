import { prisma } from "@pazy-pro/database";
import { createLogger } from "@pazy-pro/logging";
import { AgentGraph, type AgentNode } from "../agentGraph";

const DUPLICATE_WINDOW_DAYS = 30;
const SPLIT_INVOICE_WINDOW_HOURS = 24;
const SPLIT_INVOICE_COUNT_THRESHOLD = 3;

interface RiskAgentState {
  invoiceId: string;
  companyId: string;
  vendorId: string | null;
  amount: number;
  createdAt: Date;
  duplicateFound: boolean;
  splitInvoicingSuspected: boolean;
  score: number;
  riskType: "duplicate_invoice" | "split_invoicing" | "anomalous_amount" | "other" | null;
}

const checkDuplicateInvoice: AgentNode<RiskAgentState> = {
  name: "check_duplicate_invoice",
  async run(state) {
    if (!state.vendorId) return { duplicateFound: false };
    const windowStart = new Date(state.createdAt.getTime() - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const duplicate = await prisma.invoice.findFirst({
      where: {
        id: { not: state.invoiceId },
        vendorId: state.vendorId,
        totalAmount: state.amount,
        createdAt: { gte: windowStart },
        deletedAt: null,
      },
    });
    return { duplicateFound: Boolean(duplicate) };
  },
};

const checkSplitInvoicing: AgentNode<RiskAgentState> = {
  name: "check_split_invoicing",
  async run(state) {
    if (!state.vendorId) return { splitInvoicingSuspected: false };
    const windowStart = new Date(state.createdAt.getTime() - SPLIT_INVOICE_WINDOW_HOURS * 60 * 60 * 1000);
    const recentCount = await prisma.invoice.count({
      where: {
        vendorId: state.vendorId,
        createdAt: { gte: windowStart },
        deletedAt: null,
      },
    });
    return { splitInvoicingSuspected: recentCount >= SPLIT_INVOICE_COUNT_THRESHOLD };
  },
};

const scoreRisk: AgentNode<RiskAgentState> = {
  name: "score_risk",
  async run(state) {
    if (state.duplicateFound) return { score: 0.9, riskType: "duplicate_invoice" };
    if (state.splitInvoicingSuspected) return { score: 0.75, riskType: "split_invoicing" };
    if (state.amount > 1_000_000) return { score: 0.4, riskType: "anomalous_amount" };
    return { score: 0.05, riskType: null };
  },
};

const riskAgentGraph = new AgentGraph<RiskAgentState>("risk-agent", [
  checkDuplicateInvoice,
  checkSplitInvoicing,
  scoreRisk,
]);

const logger = createLogger("agent:risk");

/**
 * Risk Agent (skills.md §9.8): scans for duplicate invoices and
 * split-invoicing patterns against the vendor's recent invoice history,
 * and flags amounts far outside typical range.
 */
export async function runRiskAgent(invoiceId: string) {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });

  return riskAgentGraph.run(
    {
      invoiceId: invoice.id,
      companyId: invoice.companyId,
      vendorId: invoice.vendorId,
      amount: Number(invoice.totalAmount),
      createdAt: invoice.createdAt,
      duplicateFound: false,
      splitInvoicingSuspected: false,
      score: 0,
      riskType: null,
    },
    logger,
  );
}
