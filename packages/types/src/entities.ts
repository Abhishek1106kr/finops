import { z } from "zod";

const Auditable = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  createdBy: z.string().uuid(),
});

export const InvoiceStatus = z.enum([
  "uploaded",
  "parsing",
  "parsed",
  "matching",
  "matched",
  "pending_approval",
  "approved",
  "rejected",
  "scheduled",
  "paid",
  "flagged",
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;

export const InvoiceSchema = Auditable.extend({
  companyId: z.string().uuid(),
  vendorId: z.string().uuid().nullable(),
  purchaseOrderId: z.string().uuid().nullable(),
  status: InvoiceStatus,
  invoiceNumber: z.string().nullable(),
  currency: z.string().length(3),
  totalAmount: z.number(),
  dueDate: z.string().datetime().nullable(),
  fileUrl: z.string().url(),
  ocrConfidence: z.number().min(0).max(1).nullable(),
  riskScore: z.number().min(0).max(1).nullable(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const VendorSchema = Auditable.extend({
  companyId: z.string().uuid(),
  name: z.string(),
  gstin: z.string().nullable(),
  pan: z.string().nullable(),
  riskScore: z.number().min(0).max(1).nullable(),
  blacklisted: z.boolean(),
  status: z.enum(["pending_verification", "verified", "rejected"]),
});
export type Vendor = z.infer<typeof VendorSchema>;

export const BudgetSchema = Auditable.extend({
  companyId: z.string().uuid(),
  departmentId: z.string().uuid(),
  fiscalPeriod: z.string(),
  allocated: z.number(),
  spent: z.number(),
  thresholdPct: z.number().min(0).max(1).default(0.9),
});
export type Budget = z.infer<typeof BudgetSchema>;

export const ApprovalStatus = z.enum(["pending", "granted", "rejected", "escalated"]);
export type ApprovalStatus = z.infer<typeof ApprovalStatus>;

export const ApprovalSchema = Auditable.extend({
  companyId: z.string().uuid(),
  entityType: z.enum(["invoice", "payment", "vendor", "budget"]),
  entityId: z.string().uuid(),
  tier: z.number().int().positive(),
  approverId: z.string().uuid(),
  status: ApprovalStatus,
  decidedAt: z.string().datetime().nullable(),
});
export type Approval = z.infer<typeof ApprovalSchema>;

export const PaymentStatus = z.enum(["scheduled", "processing", "completed", "failed", "cancelled"]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const PaymentSchema = Auditable.extend({
  companyId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number(),
  currency: z.string().length(3),
  status: PaymentStatus,
  scheduledFor: z.string().datetime().nullable(),
  bankReference: z.string().nullable(),
  idempotencyKey: z.string(),
});
export type Payment = z.infer<typeof PaymentSchema>;
