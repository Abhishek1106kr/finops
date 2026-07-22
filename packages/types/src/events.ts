import { z } from "zod";

/**
 * Every domain event carries a common envelope so the Event Mesh, Audit Agent,
 * and Knowledge Graph can process any event without knowing its payload shape.
 */
export const EventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  eventVersion: z.number().int().default(1),
  companyId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  actor: z.object({
    type: z.enum(["user", "agent", "system"]),
    id: z.string(),
  }),
  payload: z.record(z.unknown()),
});
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

export const DomainEventType = {
  InvoiceUploaded: "InvoiceUploaded",
  InvoiceParsed: "InvoiceParsed",
  OCRCompleted: "OCRCompleted",
  InvoiceMatched: "InvoiceMatched",
  VendorVerified: "VendorVerified",
  VendorCreated: "VendorCreated",
  VendorUpdated: "VendorUpdated",
  ApprovalRequested: "ApprovalRequested",
  ApprovalGranted: "ApprovalGranted",
  ApprovalRejected: "ApprovalRejected",
  BudgetExceeded: "BudgetExceeded",
  RiskDetected: "RiskDetected",
  PaymentScheduled: "PaymentScheduled",
  PaymentCompleted: "PaymentCompleted",
  PaymentFailed: "PaymentFailed",
  GSTVerified: "GSTVerified",
  ReminderTriggered: "ReminderTriggered",
  WebhookFailed: "WebhookFailed",
  WebhookRecovered: "WebhookRecovered",
  ForecastUpdated: "ForecastUpdated",
} as const;
export type DomainEventType = (typeof DomainEventType)[keyof typeof DomainEventType];

export const InvoiceUploadedPayload = z.object({
  invoiceId: z.string().uuid(),
  vendorId: z.string().uuid().nullable(),
  fileUrl: z.string().url(),
  fileHash: z.string(),
  uploadedBy: z.string().uuid(),
  sizeBytes: z.number().int().positive(),
  mimeType: z.string(),
});
export type InvoiceUploadedPayload = z.infer<typeof InvoiceUploadedPayload>;

export const InvoiceParsedPayload = z.object({
  invoiceId: z.string().uuid(),
  vendorName: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().datetime().nullable(),
  dueDate: z.string().datetime().nullable(),
  currency: z.string().length(3).nullable(),
  totalAmount: z.number().nullable(),
  lineItems: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        amount: z.number(),
        glAccount: z.string().optional(),
      }),
    )
    .default([]),
});
export type InvoiceParsedPayload = z.infer<typeof InvoiceParsedPayload>;

export const OCRCompletedPayload = z.object({
  invoiceId: z.string().uuid(),
  confidenceScore: z.number().min(0).max(1),
  requiresManualReview: z.boolean(),
  lowConfidenceFields: z.array(z.string()).default([]),
});
export type OCRCompletedPayload = z.infer<typeof OCRCompletedPayload>;

export const InvoiceMatchedPayload = z.object({
  invoiceId: z.string().uuid(),
  purchaseOrderId: z.string().uuid().nullable(),
  matchType: z.enum(["2-way", "3-way", "none"]),
  matchStatus: z.enum(["matched", "partial", "mismatched"]),
  variance: z.number().default(0),
});
export type InvoiceMatchedPayload = z.infer<typeof InvoiceMatchedPayload>;

export const VendorVerifiedPayload = z.object({
  vendorId: z.string().uuid(),
  gstValid: z.boolean(),
  panValid: z.boolean(),
  bankAccountValid: z.boolean(),
  blacklisted: z.boolean(),
});
export type VendorVerifiedPayload = z.infer<typeof VendorVerifiedPayload>;

export const VendorCreatedPayload = z.object({
  vendorId: z.string().uuid(),
  name: z.string(),
  gstin: z.string().optional(),
  createdBy: z.string().uuid(),
});
export type VendorCreatedPayload = z.infer<typeof VendorCreatedPayload>;

export const VendorUpdatedPayload = z.object({
  vendorId: z.string().uuid(),
  changes: z.record(z.unknown()),
});
export type VendorUpdatedPayload = z.infer<typeof VendorUpdatedPayload>;

export const ApprovalRequestedPayload = z.object({
  approvalId: z.string().uuid(),
  entityType: z.enum(["invoice", "payment", "vendor", "budget"]),
  entityId: z.string().uuid(),
  approverIds: z.array(z.string().uuid()),
  tier: z.number().int().positive(),
});
export type ApprovalRequestedPayload = z.infer<typeof ApprovalRequestedPayload>;

export const ApprovalGrantedPayload = z.object({
  approvalId: z.string().uuid(),
  approverId: z.string().uuid(),
  tier: z.number().int().positive(),
  isFinal: z.boolean(),
});
export type ApprovalGrantedPayload = z.infer<typeof ApprovalGrantedPayload>;

export const ApprovalRejectedPayload = z.object({
  approvalId: z.string().uuid(),
  approverId: z.string().uuid(),
  reasonCode: z.string(),
  reasonNote: z.string().optional(),
});
export type ApprovalRejectedPayload = z.infer<typeof ApprovalRejectedPayload>;

export const BudgetExceededPayload = z.object({
  budgetId: z.string().uuid(),
  departmentId: z.string().uuid(),
  allocated: z.number(),
  spent: z.number(),
  thresholdPct: z.number(),
  severity: z.enum(["warning", "block"]),
});
export type BudgetExceededPayload = z.infer<typeof BudgetExceededPayload>;

export const RiskDetectedPayload = z.object({
  riskId: z.string().uuid(),
  entityType: z.enum(["invoice", "vendor", "payment"]),
  entityId: z.string().uuid(),
  riskType: z.enum(["duplicate_invoice", "vendor_bank_change", "split_invoicing", "anomalous_amount", "other"]),
  score: z.number().min(0).max(1),
  details: z.record(z.unknown()).default({}),
});
export type RiskDetectedPayload = z.infer<typeof RiskDetectedPayload>;

export const PaymentScheduledPayload = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number(),
  currency: z.string().length(3),
  scheduledFor: z.string().datetime(),
  idempotencyKey: z.string(),
});
export type PaymentScheduledPayload = z.infer<typeof PaymentScheduledPayload>;

export const PaymentCompletedPayload = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  bankReference: z.string(),
  amount: z.number(),
  currency: z.string().length(3),
  completedAt: z.string().datetime(),
});
export type PaymentCompletedPayload = z.infer<typeof PaymentCompletedPayload>;

export const PaymentFailedPayload = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number(),
  currency: z.string().length(3),
  failureReason: z.string(),
});
export type PaymentFailedPayload = z.infer<typeof PaymentFailedPayload>;

export const GSTVerifiedPayload = z.object({
  vendorId: z.string().uuid(),
  gstin: z.string(),
  status: z.enum(["active", "inactive", "cancelled", "not_found"]),
});
export type GSTVerifiedPayload = z.infer<typeof GSTVerifiedPayload>;

export const ReminderTriggeredPayload = z.object({
  approvalId: z.string().uuid(),
  approverId: z.string().uuid(),
  channel: z.enum(["slack", "email", "in_app"]),
  attempt: z.number().int().positive(),
});
export type ReminderTriggeredPayload = z.infer<typeof ReminderTriggeredPayload>;

export const WebhookFailedPayload = z.object({
  webhookId: z.string().uuid(),
  targetUrl: z.string().url(),
  statusCode: z.number().optional(),
  errorMessage: z.string(),
  attempt: z.number().int().positive(),
});
export type WebhookFailedPayload = z.infer<typeof WebhookFailedPayload>;

export const WebhookRecoveredPayload = z.object({
  webhookId: z.string().uuid(),
  targetUrl: z.string().url(),
  attempt: z.number().int().positive(),
});
export type WebhookRecoveredPayload = z.infer<typeof WebhookRecoveredPayload>;

export const ForecastUpdatedPayload = z.object({
  forecastId: z.string().uuid(),
  horizonDays: z.number().int().positive(),
  projectedBalance: z.number(),
  confidenceInterval: z.tuple([z.number(), z.number()]),
});
export type ForecastUpdatedPayload = z.infer<typeof ForecastUpdatedPayload>;

export const EventPayloadSchemas = {
  [DomainEventType.InvoiceUploaded]: InvoiceUploadedPayload,
  [DomainEventType.InvoiceParsed]: InvoiceParsedPayload,
  [DomainEventType.OCRCompleted]: OCRCompletedPayload,
  [DomainEventType.InvoiceMatched]: InvoiceMatchedPayload,
  [DomainEventType.VendorVerified]: VendorVerifiedPayload,
  [DomainEventType.VendorCreated]: VendorCreatedPayload,
  [DomainEventType.VendorUpdated]: VendorUpdatedPayload,
  [DomainEventType.ApprovalRequested]: ApprovalRequestedPayload,
  [DomainEventType.ApprovalGranted]: ApprovalGrantedPayload,
  [DomainEventType.ApprovalRejected]: ApprovalRejectedPayload,
  [DomainEventType.BudgetExceeded]: BudgetExceededPayload,
  [DomainEventType.RiskDetected]: RiskDetectedPayload,
  [DomainEventType.PaymentScheduled]: PaymentScheduledPayload,
  [DomainEventType.PaymentCompleted]: PaymentCompletedPayload,
  [DomainEventType.PaymentFailed]: PaymentFailedPayload,
  [DomainEventType.GSTVerified]: GSTVerifiedPayload,
  [DomainEventType.ReminderTriggered]: ReminderTriggeredPayload,
  [DomainEventType.WebhookFailed]: WebhookFailedPayload,
  [DomainEventType.WebhookRecovered]: WebhookRecoveredPayload,
  [DomainEventType.ForecastUpdated]: ForecastUpdatedPayload,
} as const;
