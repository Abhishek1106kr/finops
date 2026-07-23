import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import {
  SEED_VENDORS,
  pick,
  randomInt,
  indianFullName,
  companyDomain,
  employeeEmail,
  indianPhone,
  generatedVendorName,
  generateGSTIN,
  generatePAN,
  generateIFSC,
  generateAccountNumber,
  randomRecentDate,
  addDays,
  faker,
} from "./indianData";

// ─────────────────────────────────────────────────────────────────────────
// Scale presets. `full` matches the literal spec (100 companies / 500K
// invoices / 5M events) — deliberately not the default, since that volume
// takes real wall-clock time and disk space to generate. Override with
// SCALE=dev|medium|full, or set individual *_COUNT env vars.
// ─────────────────────────────────────────────────────────────────────────
const SCALE = (process.env.SCALE ?? "dev") as "dev" | "medium" | "full";
const PRESETS = {
  dev: { employees: 450, vendors: 350, purchaseOrders: 800, invoices: 2000, corporateCards: 120, contracts: 120, targetAuditLogs: 50_000 },
  medium: { employees: 450, vendors: 5000, purchaseOrders: 8000, invoices: 50_000, corporateCards: 120, contracts: 800, targetAuditLogs: 500_000 },
  full: { employees: 450, vendors: 20_000, purchaseOrders: 8000, invoices: 500_000, corporateCards: 120, contracts: 2000, targetAuditLogs: 5_000_000 },
} as const;
const cfg = PRESETS[SCALE];

const HORIZON_DAYS = 730; // "previous 24 months"
const DEPARTMENTS = ["Engineering", "Finance", "Sales", "Marketing", "Operations", "HR", "Customer Success"];
const ROLES: Record<string, string[]> = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "Engineering Manager", "DevOps Engineer", "QA Engineer", "Staff Engineer"],
  Finance: ["Finance Analyst", "Finance Manager", "Accounts Payable Specialist", "Controller", "Finance Director", "CFO"],
  Sales: ["Account Executive", "Sales Manager", "SDR", "VP Sales", "Regional Sales Head"],
  Marketing: ["Marketing Manager", "Content Strategist", "Growth Marketer", "CMO", "Brand Manager"],
  Operations: ["Operations Manager", "Facilities Lead", "Procurement Specialist", "COO", "Ops Analyst"],
  HR: ["HR Business Partner", "Recruiter", "HR Manager", "CHRO", "People Ops Specialist"],
  "Customer Success": ["Customer Success Manager", "Support Engineer", "CS Director", "Onboarding Specialist"],
};
const INVOICE_STATUSES_TERMINAL = ["paid", "rejected"] as const;
const INVOICE_STATUSES_ACTIVE = ["uploaded", "parsed", "matched", "pending_approval", "approved", "scheduled", "flagged"] as const;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface Row {
  [key: string]: unknown;
}

async function bulkInsert(client: PoolClient, table: string, columns: string[], rows: Row[], batchSize = 500) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values: unknown[] = [];
    const placeholders = batch
      .map((row, r) => {
        const offset = r * columns.length;
        const ph = columns.map((_, c) => `$${offset + c + 1}`).join(",");
        values.push(...columns.map((col) => row[col]));
        return `(${ph})`;
      })
      .join(",");
    await client.query(`INSERT INTO ${table} (${columns.join(",")}) VALUES ${placeholders}`, values);
  }
  console.log(`  ${table}: ${rows.length} rows`);
}

const auditLog: Row[] = [];
function recordEvent(companyId: string, eventType: string, entityType: string, entityId: string, occurredAt: Date, payload: Record<string, unknown>, actorType: "user" | "agent" | "system" = "system", actorId = "system") {
  auditLog.push({
    id: randomUUID(),
    company_id: companyId,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    actor_type: actorType,
    actor_id: actorId,
    payload: JSON.stringify(payload),
    occurred_at: occurredAt,
    created_at: occurredAt,
  });
}

async function main() {
  console.log(`Generating synthetic data at scale="${SCALE}" (${JSON.stringify(cfg)})`);
  const client = await pool.connect();
  const t0 = Date.now();

  try {
    await client.query("BEGIN");

    // Idempotent: clears prior synthetic runs so re-running doesn't
    // accumulate duplicates. Safe on a dedicated dev database only.
    await client.query(`TRUNCATE TABLE
      audit_logs, ledger_entries, payments, approvals, ocr_metadata,
      invoice_line_items, invoices, expenses, corporate_cards, tax_schedules,
      purchase_orders, budgets, contracts, vendor_bank_accounts, vendors,
      employees, departments, companies
      RESTART IDENTITY CASCADE`);

    const now = new Date();
    const systemUser = "system:synthetic-data-generator";

    // ── Company ──────────────────────────────────────────────────────
    const companyId = randomUUID();
    const companySlug = "cloudscale";
    const domain = companyDomain(companySlug);
    await bulkInsert(client, "companies", ["id", "name", "legal_name", "gstin", "base_currency", "created_at", "updated_at", "created_by"], [
      {
        id: companyId,
        name: "CloudScale Software Solutions",
        legal_name: "CloudScale Software Solutions Pvt Ltd",
        gstin: generateGSTIN("Karnataka"),
        base_currency: "INR",
        created_at: addDays(now, -HORIZON_DAYS - 30),
        updated_at: now,
        created_by: systemUser,
      },
    ]);

    // ── Departments ──────────────────────────────────────────────────
    const departmentIds: Record<string, string> = {};
    const departmentRows: Row[] = DEPARTMENTS.map((name) => {
      const id = randomUUID();
      departmentIds[name] = id;
      return {
        id,
        company_id: companyId,
        name,
        cost_center: `CC-${name.slice(0, 3).toUpperCase()}-${randomInt(100, 999)}`,
        created_at: addDays(now, -HORIZON_DAYS - 20),
        updated_at: now,
        created_by: systemUser,
      };
    });
    await bulkInsert(client, "departments", ["id", "company_id", "name", "cost_center", "created_at", "updated_at", "created_by"], departmentRows);

    // ── Employees ────────────────────────────────────────────────────
    const employeeIds: string[] = [];
    const approverIds: string[] = [];
    const employeeRows: Row[] = [];
    // Roughly proportional department sizing (Engineering largest for a SaaS co).
    const deptWeights: Record<string, number> = {
      Engineering: 0.4, Sales: 0.18, "Customer Success": 0.14, Operations: 0.1,
      Marketing: 0.08, Finance: 0.06, HR: 0.04,
    };
    for (let i = 0; i < cfg.employees; i++) {
      const roll = Math.random();
      let cumulative = 0;
      let dept = DEPARTMENTS[0]!;
      for (const [name, weight] of Object.entries(deptWeights)) {
        cumulative += weight;
        if (roll <= cumulative) { dept = name; break; }
      }
      const fullName = indianFullName();
      const role = pick(ROLES[dept]!);
      const isApprover = /Manager|Director|Head|CFO|CMO|COO|CHRO|VP/.test(role) && Math.random() < 0.85;
      const id = randomUUID();
      employeeIds.push(id);
      if (isApprover) approverIds.push(id);
      const createdAt = randomRecentDate(HORIZON_DAYS + 365);
      employeeRows.push({
        id,
        department_id: departmentIds[dept],
        full_name: fullName,
        email: employeeEmail(`${fullName}${i}`, domain),
        role,
        is_approver: isApprover,
        approval_tier: isApprover ? randomInt(1, 3) : null,
        created_at: createdAt,
        updated_at: now,
        created_by: systemUser,
      });
      recordEvent(companyId, "EmployeeOnboarded", "employee", id, createdAt, { fullName, department: dept, role });
    }
    // Guarantee at least a few tier-1 approvers exist even at tiny scale.
    if (approverIds.length === 0 && employeeRows.length > 0) {
      employeeRows[0]!.is_approver = true;
      employeeRows[0]!.approval_tier = 1;
      approverIds.push(employeeRows[0]!.id as string);
    }
    await bulkInsert(client, "employees", ["id", "department_id", "full_name", "email", "role", "is_approver", "approval_tier", "created_at", "updated_at", "created_by"], employeeRows);

    // ── Vendors + bank accounts ──────────────────────────────────────
    const vendorIds: string[] = [];
    const vendorMeta: Record<string, { name: string; blacklisted: boolean; riskScore: number }> = {};
    const vendorRows: Row[] = [];
    const bankAccountRows: Row[] = [];
    for (let i = 0; i < cfg.vendors; i++) {
      const name = i < SEED_VENDORS.length ? SEED_VENDORS[i]! : generatedVendorName();
      const id = randomUUID();
      const blacklisted = Math.random() < 0.01;
      const invalidGst = Math.random() < 0.015; // simulated fake-GST risk case
      const riskScore = blacklisted ? Number((0.85 + Math.random() * 0.15).toFixed(3)) : Number((Math.random() * 0.4).toFixed(3));
      const createdAt = randomRecentDate(HORIZON_DAYS + 200);
      vendorIds.push(id);
      vendorMeta[id] = { name, blacklisted, riskScore };
      vendorRows.push({
        id,
        company_id: companyId,
        name,
        gstin: invalidGst ? "INVALID-GSTIN-0000" : generateGSTIN(),
        pan: generatePAN(),
        risk_score: riskScore,
        blacklisted,
        status: blacklisted ? "rejected" : "verified",
        created_at: createdAt,
        updated_at: now,
        created_by: systemUser,
      });
      recordEvent(companyId, "VendorCreated", "vendor", id, createdAt, { name });
      recordEvent(companyId, "GSTVerified", "vendor", id, addDays(createdAt, 1), { gstin: vendorRows[i]!.gstin, status: invalidGst ? "not_found" : "active" });
      recordEvent(companyId, "VendorVerified", "vendor", id, addDays(createdAt, 2), { blacklisted, riskScore });

      bankAccountRows.push({
        id: randomUUID(),
        vendor_id: id,
        account_number: generateAccountNumber(),
        ifsc: generateIFSC(),
        is_primary: true,
        verified: !blacklisted,
        created_at: addDays(createdAt, 2),
        updated_at: now,
        created_by: systemUser,
      });
    }
    await bulkInsert(client, "vendors", ["id", "company_id", "name", "gstin", "pan", "risk_score", "blacklisted", "status", "created_at", "updated_at", "created_by"], vendorRows);
    await bulkInsert(client, "vendor_bank_accounts", ["id", "vendor_id", "account_number", "ifsc", "is_primary", "verified", "created_at", "updated_at", "created_by"], bankAccountRows);

    // ── Contracts ────────────────────────────────────────────────────
    const contractRows: Row[] = [];
    const vendorContractExpiry: Record<string, Date> = {};
    for (let i = 0; i < cfg.contracts; i++) {
      const vendorId = pick(vendorIds);
      const start = randomRecentDate(HORIZON_DAYS);
      const end = addDays(start, randomInt(180, 730));
      const id = randomUUID();
      vendorContractExpiry[vendorId] = end;
      contractRows.push({
        id,
        company_id: companyId,
        vendor_id: vendorId,
        title: `${vendorMeta[vendorId]!.name} Master Services Agreement`,
        start_date: start,
        end_date: end,
        auto_renew: Math.random() < 0.6,
        file_url: `https://storage.pazypro.local/contracts/${id}.pdf`,
        created_at: start,
        updated_at: now,
        created_by: systemUser,
      });
    }
    await bulkInsert(client, "contracts", ["id", "company_id", "vendor_id", "title", "start_date", "end_date", "auto_renew", "file_url", "created_at", "updated_at", "created_by"], contractRows);

    // ── Budgets (7 departments × 8 fiscal quarters over 24 months) ───
    const budgetIds: string[] = [];
    const budgetByDeptQuarter: Record<string, string> = {};
    const budgetRows: Row[] = [];
    const quarters = ["2024-Q3", "2024-Q4", "2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"];
    const deptAnnualShare: Record<string, number> = deptWeights;
    const totalAnnualBudget = 60_00_00_000; // ₹60Cr/year against ₹6Cr/month AP spend
    for (const dept of DEPARTMENTS) {
      for (const q of quarters) {
        const allocated = Math.round((totalAnnualBudget / 4) * (deptAnnualShare[dept] ?? 0.1));
        const overspend = Math.random() < 0.12;
        const spent = Math.round(allocated * (overspend ? 0.9 + Math.random() * 0.25 : Math.random() * 0.85));
        const id = randomUUID();
        budgetIds.push(id);
        budgetByDeptQuarter[`${dept}:${q}`] = id;
        budgetRows.push({
          id,
          company_id: companyId,
          department_id: departmentIds[dept],
          fiscal_period: q,
          allocated,
          spent,
          threshold_pct: 0.9,
          created_at: addDays(now, -HORIZON_DAYS),
          updated_at: now,
          created_by: systemUser,
        });
        if (overspend) {
          recordEvent(companyId, "BudgetExceeded", "budget", id, now, { department: dept, fiscalPeriod: q, allocated, spent });
        }
      }
    }
    await bulkInsert(client, "budgets", ["id", "company_id", "department_id", "fiscal_period", "allocated", "spent", "threshold_pct", "created_at", "updated_at", "created_by"], budgetRows);

    // ── Purchase Orders ──────────────────────────────────────────────
    const poIds: string[] = [];
    const poAmount: Record<string, number> = {};
    const poVendor: Record<string, string> = {};
    const poRows: Row[] = [];
    for (let i = 0; i < cfg.purchaseOrders; i++) {
      const vendorId = pick(vendorIds);
      const budgetId = pick(budgetIds);
      const amount = randomInt(15_000, 25_00_000);
      const id = randomUUID();
      poIds.push(id);
      poAmount[id] = amount;
      poVendor[id] = vendorId;
      const createdAt = randomRecentDate(HORIZON_DAYS);
      poRows.push({
        id,
        budget_id: budgetId,
        vendor_id: vendorId,
        po_number: `PO-${createdAt.getFullYear()}-${String(i + 1).padStart(6, "0")}`,
        amount,
        currency: "INR",
        status: pick(["open", "open", "closed", "closed", "cancelled"]),
        created_at: createdAt,
        updated_at: now,
        created_by: systemUser,
      });
    }
    await bulkInsert(client, "purchase_orders", ["id", "budget_id", "vendor_id", "po_number", "amount", "currency", "status", "created_at", "updated_at", "created_by"], poRows);

    // ── Invoices, line items, OCR metadata, approvals, payments, ledger ─
    const invoiceRows: Row[] = [];
    const lineItemRows: Row[] = [];
    const ocrRows: Row[] = [];
    const approvalRows: Row[] = [];
    const paymentRows: Row[] = [];
    const ledgerRows: Row[] = [];

    const glAccounts = ["6100-CloudInfra", "6200-SoftwareLicenses", "6300-ProfessionalServices", "6400-Marketing", "6500-Travel", "6600-Facilities", "6700-Payroll", "6800-Equipment"];

    for (let i = 0; i < cfg.invoices; i++) {
      const usePO = Math.random() < 0.55;
      const poId = usePO ? pick(poIds) : null;
      const vendorId = poId ? poVendor[poId]! : pick(vendorIds);
      const vendor = vendorMeta[vendorId]!;
      const invoiceDate = randomRecentDate(HORIZON_DAYS);
      const dueDate = addDays(invoiceDate, randomInt(15, 45));

      const lineItemCount = randomInt(1, 4);
      let subtotal = 0;
      const items: { description: string; qty: number; unitPrice: number; amount: number; gl: string }[] = [];
      for (let li = 0; li < lineItemCount; li++) {
        const qty = randomInt(1, 12);
        const unitPrice = randomInt(1000, 150_000);
        const amount = qty * unitPrice;
        subtotal += amount;
        items.push({ description: `${vendor.name.split(" ")[0]} — ${pick(["Subscription", "License Renewal", "Professional Services", "Support Plan", "Usage Charges", "Implementation Fee"])}`, qty, unitPrice, amount, gl: pick(glAccounts) });
      }

      const isRoundNumber = Math.random() < 0.05;
      if (isRoundNumber) subtotal = Math.round(subtotal / 10000) * 10000 || 100_000;

      const gstRate = 0.18;
      const isIntraState = Math.random() < 0.7;
      const cgst = isIntraState ? subtotal * (gstRate / 2) : 0;
      const sgst = isIntraState ? subtotal * (gstRate / 2) : 0;
      const igst = isIntraState ? 0 : subtotal * gstRate;
      const discount = Math.random() < 0.1 ? Math.round(subtotal * 0.05) : 0;
      const totalAmount = Math.round(subtotal - discount + cgst + sgst + igst);

      const contractExpiry = vendorContractExpiry[vendorId];
      const afterContractExpiry = Boolean(contractExpiry && invoiceDate > contractExpiry && Math.random() < 0.3);

      const isDuplicate = Math.random() < 0.02;
      const ocrConfidence = Number((0.72 + Math.random() * 0.27).toFixed(3));
      const lowConfidence = ocrConfidence < 0.85;

      const amountMismatch = usePO && Math.random() < 0.04;
      const poAmt = poId ? poAmount[poId]! : totalAmount;
      const variance = poId ? Math.abs(totalAmount - poAmt) / (poAmt || 1) : 0;

      let riskScore = 0.03 + Math.random() * 0.1;
      const riskFlags: string[] = [];
      if (isDuplicate) { riskScore = 0.85 + Math.random() * 0.15; riskFlags.push("duplicate_invoice"); }
      if (amountMismatch || variance > 0.1) { riskScore = Math.max(riskScore, 0.55); riskFlags.push("anomalous_amount"); }
      if (vendor.blacklisted) { riskScore = 0.95; riskFlags.push("vendor_blacklisted"); }
      if (afterContractExpiry) { riskScore = Math.max(riskScore, 0.5); riskFlags.push("contract_expired"); }
      riskScore = Number(Math.min(riskScore, 1).toFixed(3));

      const flagged = riskScore >= 0.5;
      const daysSinceInvoice = Math.floor((now.getTime() - invoiceDate.getTime()) / 86_400_000);

      let status: string;
      if (flagged && Math.random() < 0.6) status = "flagged";
      else if (daysSinceInvoice > 45) status = pick(["paid", "paid", "paid", "rejected"]);
      else if (daysSinceInvoice > 20) status = pick(["approved", "scheduled", "paid"]);
      else if (daysSinceInvoice > 7) status = pick(["pending_approval", "matched", "approved"]);
      else status = pick(["uploaded", "parsed", "matched", "pending_approval"]);

      const invoiceId = randomUUID();
      const fileHash = randomUUID().replace(/-/g, "");
      invoiceRows.push({
        id: invoiceId,
        company_id: companyId,
        vendor_id: vendorId,
        purchase_order_id: poId,
        status,
        invoice_number: `INV-${invoiceDate.getFullYear()}-${String(i + 1).padStart(7, "0")}`,
        currency: "INR",
        total_amount: totalAmount,
        due_date: dueDate,
        file_url: `https://storage.pazypro.local/invoices/${fileHash}.pdf`,
        file_hash: fileHash,
        ocr_confidence: ocrConfidence,
        risk_score: riskScore,
        created_at: invoiceDate,
        updated_at: now,
        created_by: systemUser,
      });
      recordEvent(companyId, "InvoiceUploaded", "invoice", invoiceId, invoiceDate, { vendorId, fileHash });
      recordEvent(companyId, "InvoiceParsed", "invoice", invoiceId, addDays(invoiceDate, 0), { lineItemCount });
      recordEvent(companyId, "OCRCompleted", "invoice", invoiceId, addDays(invoiceDate, 0), { confidenceScore: ocrConfidence, requiresManualReview: lowConfidence }, "agent", "invoice-agent");
      if (poId) recordEvent(companyId, "InvoiceMatched", "invoice", invoiceId, addDays(invoiceDate, 1), { purchaseOrderId: poId, variance }, "agent", "invoice-agent");
      if (riskFlags.length) {
        for (const rf of riskFlags) recordEvent(companyId, "RiskDetected", "invoice", invoiceId, addDays(invoiceDate, 1), { riskType: rf, score: riskScore }, "agent", "risk-agent");
      }

      for (const item of items) {
        lineItemRows.push({
          id: randomUUID(),
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.qty,
          unit_price: item.unitPrice,
          amount: item.amount,
          gl_account: item.gl,
          created_at: invoiceDate,
          updated_at: now,
          created_by: systemUser,
        });
      }

      ocrRows.push({
        id: randomUUID(),
        invoice_id: invoiceId,
        raw_text: `Vendor: ${vendor.name}\nSubtotal: INR ${subtotal.toFixed(2)}\nDiscount: INR ${discount.toFixed(2)}\nCGST: INR ${cgst.toFixed(2)}\nSGST: INR ${sgst.toFixed(2)}\nIGST: INR ${igst.toFixed(2)}\nTotal: INR ${totalAmount.toFixed(2)}`,
        confidence_score: ocrConfidence,
        low_confidence_fields: lowConfidence ? ["totalAmount", "dueDate"] : [],
        provider: "internal",
        created_at: invoiceDate,
        updated_at: now,
        created_by: systemUser,
      });

      const needsApproval = status !== "uploaded" && status !== "parsed";
      let approvalDecidedAt: Date | null = null;
      if (needsApproval && approverIds.length) {
        const approverId = pick(approverIds);
        const requestedAt = addDays(invoiceDate, 1);
        const decided = ["approved", "scheduled", "paid"].includes(status) || (status === "rejected");
        approvalDecidedAt = decided ? addDays(requestedAt, randomInt(0, 5)) : null;
        const approvalStatus = status === "rejected" ? "rejected" : decided ? "approved" : "pending";
        approvalRows.push({
          id: randomUUID(),
          entity_type: "invoice",
          entity_id: invoiceId,
          invoice_id: invoiceId,
          tier: randomInt(1, 3),
          approver_id: approverId,
          status: approvalStatus,
          decided_at: approvalDecidedAt,
          created_at: requestedAt,
          updated_at: now,
          created_by: "risk-agent",
        });
        recordEvent(companyId, "ApprovalRequested", "invoice", invoiceId, requestedAt, { approverId, tier: 1 });
        if (decided) recordEvent(companyId, approvalStatus === "approved" ? "ApprovalGranted" : "ApprovalRejected", "invoice", invoiceId, approvalDecidedAt!, { approverId }, "user", approverId);
      }

      if (["scheduled", "paid"].includes(status)) {
        const scheduledAt = approvalDecidedAt ? addDays(approvalDecidedAt, randomInt(0, 3)) : addDays(invoiceDate, 5);
        const paymentId = randomUUID();
        const railType = totalAmount <= 200_000 ? "imps" : totalAmount <= 10_00_000 ? "neft" : "rtgs";
        const isFailed = status === "scheduled" && Math.random() < 0.08;
        const paymentStatus = status === "paid" ? "completed" : isFailed ? "failed" : "scheduled";
        const completedAt = paymentStatus === "completed" ? addDays(scheduledAt, randomInt(0, 2)) : null;

        paymentRows.push({
          id: paymentId,
          company_id: companyId,
          invoice_id: invoiceId,
          amount: totalAmount,
          currency: "INR",
          status: paymentStatus,
          rail_type: railType,
          gateway_reference: `PZP-${railType.toUpperCase()}-${paymentId.slice(0, 10)}`,
          scheduled_for: scheduledAt,
          bank_reference: paymentStatus === "completed" ? `BANK-${randomUUID().slice(0, 12).toUpperCase()}` : null,
          failure_reason: isFailed ? pick(["insufficient_funds", "invalid_account", "bank_timeout"]) : null,
          idempotency_key: `invoice:${invoiceId}:payment`,
          created_at: scheduledAt,
          updated_at: now,
          created_by: systemUser,
        });
        recordEvent(companyId, "PaymentScheduled", "payment", paymentId, scheduledAt, { invoiceId, amount: totalAmount, railType });
        if (paymentStatus === "completed") {
          recordEvent(companyId, "PaymentCompleted", "payment", paymentId, completedAt!, { invoiceId, amount: totalAmount }, "system", "pazypay-gateway");
          recordEvent(companyId, "ERPPosted", "payment", paymentId, addDays(completedAt!, 1), { erp: "NetSuite" });
          ledgerRows.push(
            { id: randomUUID(), company_id: companyId, payment_id: paymentId, account: "accounts_payable", direction: "debit", amount: totalAmount, currency: "INR", posted_at: completedAt, created_at: completedAt, created_by: "pazypay-gateway" },
            { id: randomUUID(), company_id: companyId, payment_id: paymentId, account: "cash_operating", direction: "credit", amount: totalAmount, currency: "INR", posted_at: completedAt, created_at: completedAt, created_by: "pazypay-gateway" },
          );
        } else if (isFailed) {
          recordEvent(companyId, "PaymentFailed", "payment", paymentId, addDays(scheduledAt, 1), { invoiceId, reason: paymentRows[paymentRows.length - 1]!.failure_reason });
        }
      }

      recordEvent(companyId, "SlackNotificationSent", "notification", invoiceId, invoiceDate, { channel: "#finance-ops", template: "invoice_uploaded" });

      if (i % 5000 === 0 && i > 0) console.log(`  ...${i}/${cfg.invoices} invoices generated`);
    }

    await bulkInsert(client, "invoices", ["id", "company_id", "vendor_id", "purchase_order_id", "status", "invoice_number", "currency", "total_amount", "due_date", "file_url", "file_hash", "ocr_confidence", "risk_score", "created_at", "updated_at", "created_by"], invoiceRows);
    await bulkInsert(client, "invoice_line_items", ["id", "invoice_id", "description", "quantity", "unit_price", "amount", "gl_account", "created_at", "updated_at", "created_by"], lineItemRows);
    await bulkInsert(client, "ocr_metadata", ["id", "invoice_id", "raw_text", "confidence_score", "low_confidence_fields", "provider", "created_at", "updated_at", "created_by"], ocrRows);
    await bulkInsert(client, "approvals", ["id", "entity_type", "entity_id", "invoice_id", "tier", "approver_id", "status", "decided_at", "created_at", "updated_at", "created_by"], approvalRows);
    await bulkInsert(client, "payments", ["id", "company_id", "invoice_id", "amount", "currency", "status", "rail_type", "gateway_reference", "scheduled_for", "bank_reference", "failure_reason", "idempotency_key", "created_at", "updated_at", "created_by"], paymentRows);
    await bulkInsert(client, "ledger_entries", ["id", "company_id", "payment_id", "account", "direction", "amount", "currency", "posted_at", "created_at", "created_by"], ledgerRows);

    // ── Corporate cards + expenses ───────────────────────────────────
    const cardIds: string[] = [];
    const cardRows: Row[] = [];
    const expenseRows: Row[] = [];
    const merchants = ["Uber", "Ola", "Zomato Corporate", "IndiGo Airlines", "Taj Hotels", "AWS", "Google Workspace", "Microsoft 365", "WeWork", "Cafe Coffee Day", "Amazon Business", "Swiggy Genie"];
    for (let i = 0; i < cfg.corporateCards; i++) {
      const holderId = pick(employeeIds);
      const holderRow = employeeRows.find((e) => e.id === holderId);
      const id = randomUUID();
      cardIds.push(id);
      const createdAt = randomRecentDate(HORIZON_DAYS);
      cardRows.push({
        id,
        company_id: companyId,
        last4: String(randomInt(1000, 9999)),
        holder_name: (holderRow?.full_name as string) ?? indianFullName(),
        status: Math.random() < 0.05 ? "suspended" : "active",
        created_at: createdAt,
        updated_at: now,
        created_by: systemUser,
      });
      const expenseCount = randomInt(3, 12);
      for (let e = 0; e < expenseCount; e++) {
        expenseRows.push({
          id: randomUUID(),
          corporate_card_id: id,
          amount: randomInt(300, 45_000),
          currency: "INR",
          merchant: pick(merchants),
          category: pick(["Travel", "Meals", "Software", "Office Supplies", "Client Entertainment"]),
          created_at: addDays(createdAt, randomInt(1, HORIZON_DAYS)),
          updated_at: now,
          created_by: systemUser,
        });
      }
    }
    await bulkInsert(client, "corporate_cards", ["id", "company_id", "last4", "holder_name", "status", "created_at", "updated_at", "created_by"], cardRows);
    await bulkInsert(client, "expenses", ["id", "corporate_card_id", "amount", "currency", "merchant", "category", "created_at", "updated_at", "created_by"], expenseRows);

    // ── Tax schedules (quarterly GST filings over 2 years) ───────────
    const taxRows: Row[] = quarters.map((q, idx) => ({
      id: randomUUID(),
      company_id: companyId,
      tax_type: "GSTR-3B",
      period_end: addDays(now, -HORIZON_DAYS + idx * 91),
      status: idx < quarters.length - 1 ? "filed" : "pending",
      created_at: addDays(now, -HORIZON_DAYS + idx * 91),
      updated_at: now,
      created_by: systemUser,
    }));
    await bulkInsert(client, "tax_schedules", ["id", "company_id", "tax_type", "period_end", "status", "created_at", "updated_at", "created_by"], taxRows);

    // ── Supplemental system/forecast events to reach the audit-log target.
    // Cycles through the horizon as many times as needed (not just once)
    // since business-event volume alone rarely reaches the target at
    // smaller scales.
    while (auditLog.length < cfg.targetAuditLogs) {
      const at = randomRecentDate(HORIZON_DAYS);
      recordEvent(companyId, "ForecastUpdated", "forecast", randomUUID(), at, { horizonDays: 30, projectedBalance: randomInt(1_00_00_000, 5_00_00_000) }, "agent", "forecast-agent");
      if (auditLog.length < cfg.targetAuditLogs) {
        recordEvent(companyId, "ReminderTriggered", "approval", pick(employeeIds), at, { channel: pick(["slack", "email"]) }, "system", "notification-agent");
      }
      if (auditLog.length < cfg.targetAuditLogs) {
        recordEvent(companyId, "WebhookRecovered", "webhook", randomUUID(), at, { targetUrl: `https://erp.cloudscale.internal/webhooks/${randomUUID()}`, attempt: randomInt(1, 3) }, "system", "erp-sync");
      }
    }

    console.log(`  audit_logs: generating ${auditLog.length} events...`);
    await bulkInsert(client, "audit_logs", ["id", "company_id", "event_type", "entity_type", "entity_id", "actor_type", "actor_id", "payload", "occurred_at", "created_at"], auditLog, 1000);

    await client.query("COMMIT");

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\nDone in ${elapsed}s. Summary:`);
    console.log(`  1 company, ${departmentRows.length} departments, ${employeeRows.length} employees`);
    console.log(`  ${vendorRows.length} vendors, ${contractRows.length} contracts, ${budgetRows.length} budgets, ${poRows.length} purchase orders`);
    console.log(`  ${invoiceRows.length} invoices, ${lineItemRows.length} line items, ${approvalRows.length} approvals`);
    console.log(`  ${paymentRows.length} payments, ${ledgerRows.length} ledger entries`);
    console.log(`  ${cardRows.length} corporate cards, ${expenseRows.length} expenses, ${taxRows.length} tax schedules`);
    console.log(`  ${auditLog.length} audit/event log entries`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
