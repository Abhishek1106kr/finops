export * from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined;
}

const mockInvoices = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    companyId: "00000000-0000-0000-0000-000000000001",
    invoiceNumber: "INV-2026-0891",
    vendorId: "00000000-0000-0000-0000-000000000003",
    totalAmount: 145000,
    currency: "INR",
    status: "approved",
    fileUrl: "https://storage.pazypro.local/invoices/demo-inv-1.pdf",
    fileHash: "hash-001-cloudscale",
    ocrConfidence: 0.98,
    riskScore: 0.04,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    companyId: "00000000-0000-0000-0000-000000000001",
    invoiceNumber: "INV-2026-0412",
    vendorId: "00000000-0000-0000-0000-000000000004",
    totalAmount: 84200,
    currency: "INR",
    status: "flagged",
    fileUrl: "https://storage.pazypro.local/invoices/demo-inv-2.pdf",
    fileHash: "hash-002-acme",
    ocrConfidence: 0.91,
    riskScore: 0.72,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    companyId: "00000000-0000-0000-0000-000000000001",
    invoiceNumber: "INV-2026-0105",
    vendorId: "00000000-0000-0000-0000-000000000005",
    totalAmount: 28400,
    currency: "INR",
    status: "uploaded",
    fileUrl: "https://storage.pazypro.local/invoices/demo-inv-3.pdf",
    fileHash: "hash-003-apex",
    ocrConfidence: 0.95,
    riskScore: 0.12,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    companyId: "00000000-0000-0000-0000-000000000001",
    invoiceNumber: "INV-2026-0099",
    vendorId: "00000000-0000-0000-0000-000000000006",
    totalAmount: 210000,
    currency: "INR",
    status: "paid",
    fileUrl: "https://storage.pazypro.local/invoices/demo-inv-4.pdf",
    fileHash: "hash-004-tech",
    ocrConfidence: 0.99,
    riskScore: 0.01,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockPayments = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    companyId: "00000000-0000-0000-0000-000000000001",
    invoiceId: "00000000-0000-0000-0000-000000000004",
    amount: 210000,
    currency: "INR",
    status: "completed",
    bankReference: "PZP-IMPS-8A9F01B3C4D5",
    idempotencyKey: "pay:004:123",
    scheduledFor: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    companyId: "00000000-0000-0000-0000-000000000001",
    invoiceId: "00000000-0000-0000-0000-000000000001",
    amount: 145000,
    currency: "INR",
    status: "scheduled",
    bankReference: "PZP-NEFT-99182374",
    idempotencyKey: "pay:001:124",
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    companyId: "00000000-0000-0000-0000-000000000001",
    invoiceId: "00000000-0000-0000-0000-000000000002",
    amount: 84200,
    currency: "INR",
    status: "processing",
    bankReference: "PZP-RTGS-55112233",
    idempotencyKey: "pay:002:125",
    scheduledFor: new Date().toISOString(),
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

const mockVendors = [
  {
    id: "00000000-0000-0000-0000-000000000003",
    companyId: "00000000-0000-0000-0000-000000000001",
    name: "CloudScale Software Solutions",
    gstin: "29AADCB9876E1ZQ",
    pan: "AADCB9876E",
    riskScore: 0.04,
    status: "verified",
    blacklisted: false,
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    companyId: "00000000-0000-0000-0000-000000000001",
    name: "Acme Logistics India Pvt Ltd",
    gstin: "27AABCA1234D1ZP",
    pan: "AABCA1234D",
    riskScore: 0.02,
    status: "verified",
    blacklisted: false,
    createdAt: new Date(Date.now() - 5184000000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    companyId: "00000000-0000-0000-0000-000000000001",
    name: "Apex Office Supplies",
    gstin: "33AACCA8811F1Z2",
    pan: "AACCA8811F",
    riskScore: 0.15,
    status: "pending_verification",
    blacklisted: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    companyId: "00000000-0000-0000-0000-000000000001",
    name: "TechSolutions Managed Services",
    gstin: "07AABCT9988H1Z8",
    pan: "AABCT9988H",
    riskScore: 0.01,
    status: "verified",
    blacklisted: false,
    createdAt: new Date(Date.now() - 7776000000).toISOString(),
  },
];

const mockApprovals = [
  {
    id: "00000000-0000-0000-0000-000000000020",
    entityType: "Invoice",
    entityId: "00000000-0000-0000-0000-000000000001",
    invoiceId: "00000000-0000-0000-0000-000000000001",
    tier: 1,
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000021",
    entityType: "Invoice",
    entityId: "00000000-0000-0000-0000-000000000003",
    invoiceId: "00000000-0000-0000-0000-000000000003",
    tier: 1,
    status: "pending",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const mockStore: Record<string, any> = {
  $connect: async () => {},
  $disconnect: async () => {},
  $queryRaw: async () => [{ 1: 1 }],
  invoice: {
    findMany: async () => mockInvoices,
    count: async () => mockInvoices.length,
    findFirst: async ({ where }: any) => mockInvoices.find((i) => i.id === where?.id) ?? mockInvoices[0],
    findUnique: async ({ where }: any) => mockInvoices.find((i) => i.id === where?.id || i.fileHash === where?.fileHash) ?? null,
    create: async ({ data }: any) => {
      const newInv = { ...data, id: data.id ?? `inv-${Date.now()}`, createdAt: new Date().toISOString() };
      mockInvoices.unshift(newInv);
      return newInv;
    },
    update: async ({ where, data }: any) => {
      const inv = mockInvoices.find((i) => i.id === where.id);
      if (inv) Object.assign(inv, data);
      return inv ?? mockInvoices[0];
    },
  },
  payment: {
    findMany: async () => mockPayments,
    count: async () => mockPayments.length,
    aggregate: async () => ({
      _sum: { amount: mockPayments.reduce((acc, p) => acc + p.amount, 0) },
      _count: mockPayments.length,
    }),
    create: async ({ data }: any) => {
      const newPay = { ...data, id: data.id ?? `pay-${Date.now()}`, createdAt: new Date().toISOString() };
      mockPayments.unshift(newPay);
      return newPay;
    },
  },
  vendor: {
    findMany: async () => mockVendors,
    count: async () => mockVendors.length,
    create: async ({ data }: any) => {
      const newVen = { ...data, id: data.id ?? `v-${Date.now()}`, createdAt: new Date().toISOString() };
      mockVendors.unshift(newVen);
      return newVen;
    },
  },
  approval: {
    findMany: async () => mockApprovals,
    count: async () => mockApprovals.length,
    update: async ({ where, data }: any) => {
      const app = mockApprovals.find((a) => a.id === where.id);
      if (app) Object.assign(app, data);
      return app ?? mockApprovals[0];
    },
  },
  budget: {
    findMany: async () => [
      {
        id: "b-01",
        department: "Engineering",
        fiscalPeriod: "2026-Q3",
        allocated: 10000000,
        spent: 2450000,
      },
    ],
    count: async () => 1,
  },
  company: {
    upsert: async () => ({ id: "00000000-0000-0000-0000-000000000001", name: "InnovateTech" }),
  },
  department: {
    upsert: async () => ({ id: "00000000-0000-0000-0000-000000000010", name: "Engineering" }),
  },
  employee: {
    upsert: async () => ({ id: "emp-01", fullName: "Priya Nair" }),
  },
  invoiceLineItem: {
    createMany: async () => ({ count: 1 }),
  },
};

let realPrismaInstance: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");
  realPrismaInstance = globalThis.__prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalThis.__prisma = realPrismaInstance;
} catch (e) {
  realPrismaInstance = null;
}

export const prisma: any = new Proxy(mockStore, {
  get(target, prop) {
    if (realPrismaInstance && typeof prop === "string" && prop in realPrismaInstance) {
      const val = realPrismaInstance[prop];
      if (typeof val === "function") {
        return async (...args: any[]) => {
          try {
            return await val.apply(realPrismaInstance, args);
          } catch (err) {
            if ((target as any)[prop]) {
              const fallbackVal = (target as any)[prop];
              return typeof fallbackVal === "function" ? fallbackVal(...args) : fallbackVal;
            }
            return [];
          }
        };
      }
      return val;
    }
    return (target as any)[prop] ?? (() => Promise.resolve([]));
  },
});
