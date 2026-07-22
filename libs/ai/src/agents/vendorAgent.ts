import { prisma } from "@pazy-pro/database";
import { createLogger } from "@pazy-pro/logging";
import { AgentGraph, type AgentNode } from "../agentGraph";

const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;
const BLACKLISTED_KEYWORDS = ["shell corp", "fraud", "sanctioned"];

interface VendorAgentState {
  vendorId: string;
  name: string;
  gstin: string | null;
  pan: string | null;
  gstValid: boolean;
  panValid: boolean;
  blacklisted: boolean;
  bankAccountValid: boolean;
  riskScore: number;
  decision: "verified" | "rejected";
}

const validateGstin: AgentNode<VendorAgentState> = {
  name: "validate_gstin",
  async run(state) {
    if (!state.gstin) return { gstValid: false };
    return { gstValid: GSTIN_PATTERN.test(state.gstin) };
  },
};

const validatePan: AgentNode<VendorAgentState> = {
  name: "validate_pan",
  async run(state) {
    if (!state.pan) return { panValid: false };
    return { panValid: PAN_PATTERN.test(state.pan) };
  },
};

const checkBlacklist: AgentNode<VendorAgentState> = {
  name: "check_blacklist",
  async run(state) {
    const lowerName = state.name.toLowerCase();
    const nameFlagged = BLACKLISTED_KEYWORDS.some((kw) => lowerName.includes(kw));
    const duplicate = await prisma.vendor.findFirst({
      where: { name: state.name, blacklisted: true, id: { not: state.vendorId } },
    });
    return { blacklisted: nameFlagged || Boolean(duplicate) };
  },
};

const checkBankAccount: AgentNode<VendorAgentState> = {
  name: "check_bank_account",
  async run(state) {
    const account = await prisma.vendorBankAccount.findFirst({ where: { vendorId: state.vendorId } });
    // No bank account on file yet is common at onboarding time — it's a
    // scoring input, not by itself a rejection reason.
    return { bankAccountValid: account?.verified ?? false };
  },
};

const scoreAndDecide: AgentNode<VendorAgentState> = {
  name: "score_and_decide",
  async run(state) {
    let risk = 0;
    if (!state.gstValid) risk += 0.35;
    if (!state.panValid) risk += 0.35;
    if (state.blacklisted) risk += 1;
    if (!state.bankAccountValid) risk += 0.1;
    const riskScore = Math.min(risk, 1);
    const decision = state.blacklisted || riskScore >= 0.7 ? "rejected" : "verified";
    return { riskScore, decision };
  },
};

const vendorAgentGraph = new AgentGraph<VendorAgentState>("vendor-agent", [
  validateGstin,
  validatePan,
  checkBlacklist,
  checkBankAccount,
  scoreAndDecide,
]);

const logger = createLogger("agent:vendor");

/**
 * Vendor Agent (skills.md §9.2): GST/PAN format validation, blacklist
 * cross-check, and bank-account presence, folded into a single risk score
 * that decides verified vs. rejected.
 */
export async function runVendorAgent(vendorId: string) {
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });

  return vendorAgentGraph.run(
    {
      vendorId: vendor.id,
      name: vendor.name,
      gstin: vendor.gstin,
      pan: vendor.pan,
      gstValid: false,
      panValid: false,
      blacklisted: false,
      bankAccountValid: false,
      riskScore: 0,
      decision: "verified",
    },
    logger,
  );
}
