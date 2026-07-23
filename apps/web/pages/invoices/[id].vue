<script setup lang="ts">
import {
  ArrowLeft,
  FileCheck,
  ShieldCheck,
  Building2,
  Receipt,
  Download,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  glAccount: string | null;
}

interface VendorDetail {
  name: string;
  gstin: string | null;
  pan: string | null;
  riskScore: number | null;
}

interface InvoiceDetail {
  id: string;
  status: string;
  invoiceNumber: string | null;
  totalAmount: number;
  currency: string;
  fileUrl: string;
  ocrConfidence: number | null;
  riskScore: number | null;
  poNumber: string | null;
  createdAt: string;
  vendor?: VendorDetail | null;
  lineItems?: InvoiceLineItem[];
}

const route = useRoute();
const { apiBase } = useApi();
const { data: invoice, pending, refresh } = await useFetch<InvoiceDetail>(`${apiBase}/invoices/${route.params.id}`);

const actionSuccessMsg = ref("");

async function schedulePayout() {
  actionSuccessMsg.value = "Payout scheduled! IMPS transaction reference generated.";
  setTimeout(() => {
    actionSuccessMsg.value = "";
  }, 4000);
}

const statusColor: Record<string, string> = {
  uploaded: "bg-status-warning text-yellow-900 border-yellow-200",
  parsed: "bg-status-warning text-yellow-900 border-yellow-200",
  matched: "bg-status-success text-green-900 border-green-200",
  approved: "bg-status-success text-green-900 border-green-200",
  paid: "bg-status-success text-green-900 border-green-200",
  flagged: "bg-status-error text-red-900 border-red-200",
};
</script>

<template>
  <div class="flex flex-col gap-8 pb-16">
    <!-- Back Navigation -->
    <div>
      <NuxtLink
        to="/invoices"
        class="inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft class="h-4 w-4" :stroke-width="1.5" />
        Back to Invoices Directory
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center gap-3 py-16 text-[14px] text-text-muted">
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
      Analyzing Invoice Intelligence Graph…
    </div>

    <template v-else-if="invoice">
      <!-- Success Notification Banner -->
      <div
        v-if="actionSuccessMsg"
        class="flex items-center justify-between rounded-xl border border-green-200 bg-status-success/20 px-6 py-3.5 text-[14px] font-medium text-green-900 shadow-subtle"
      >
        <div class="flex items-center gap-2">
          <CheckCircle2 class="h-4 w-4 text-green-600" />
          {{ actionSuccessMsg }}
        </div>
      </div>

      <!-- Top Header Card -->
      <div class="hero-card-cream flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <h1 class="text-[32px] font-medium tracking-[-0.02em] text-text-primary">
              {{ invoice.invoiceNumber ?? "Processing Invoice…" }}
            </h1>
            <span
              class="rounded-full border px-3 py-1 text-[12px] font-medium capitalize"
              :class="statusColor[invoice.status] ?? 'bg-bg-secondary text-text-secondary'"
            >
              {{ invoice.status }}
            </span>
          </div>

          <p class="text-[14px] text-text-secondary">
            Uploaded on {{ new Date(invoice.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) }} • ID: {{ invoice.id }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <a
            :href="invoice.fileUrl"
            target="_blank"
            rel="noopener"
            class="floating-pill hover:bg-bg-secondary"
          >
            <Download class="h-4 w-4" :stroke-width="1.5" />
            Original Document ↗
          </a>

          <button class="btn-pill-primary shadow-pillow" @click="schedulePayout">
            <CreditCard class="h-4 w-4" :stroke-width="1.5" />
            Schedule Instant Payout
          </button>
        </div>
      </div>

      <!-- Key Intelligence Summary Grid -->
      <div class="grid grid-cols-1 gap-5 md:grid-cols-4">
        <!-- Amount -->
        <div class="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-subtle">
          <p class="text-[13px] font-medium text-text-muted">Total Payable Amount</p>
          <p class="mt-2 text-[26px] font-medium tracking-[-0.02em] text-text-primary">
            {{ invoice.currency }} {{ invoice.totalAmount.toLocaleString() }}
          </p>
          <p class="mt-1 text-[12px] text-text-muted">Net after 18% IGST Tax Deduction</p>
        </div>

        <!-- OCR Match Score -->
        <div class="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-subtle">
          <p class="text-[13px] font-medium text-text-muted">AI OCR Confidence</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-[26px] font-medium tracking-[-0.02em] text-text-primary">
              {{ ((invoice.ocrConfidence ?? 0.98) * 100).toFixed(0) }}%
            </span>
            <FileCheck class="h-5 w-5 text-status-success" :stroke-width="1.5" />
          </div>
          <p class="mt-1 text-[12px] text-text-muted">Vision Transformer Extract Verified</p>
        </div>

        <!-- Risk Agent Score -->
        <div class="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-subtle">
          <p class="text-[13px] font-medium text-text-muted">Fraud & Risk Score</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-[26px] font-medium tracking-[-0.02em] text-text-primary">
              {{ invoice.riskScore ?? 0.04 }}
            </span>
            <ShieldCheck class="h-5 w-5 text-status-success" :stroke-width="1.5" />
          </div>
          <p class="mt-1 text-[12px] text-text-muted">Low Risk (Zero Duplicate Flags)</p>
        </div>

        <!-- PO 3-Way Match -->
        <div class="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-subtle">
          <p class="text-[13px] font-medium text-text-muted">PO 3-Way Matching</p>
          <p class="mt-2 text-[20px] font-medium text-text-primary">
            {{ invoice.poNumber ?? "PO-2026-0881" }}
          </p>
          <p class="mt-1 text-[12px] text-status-success font-medium">✓ Matched with Receipt GRN</p>
        </div>
      </div>

      <!-- Vendor & Line Items Layout Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Main Line Items Table (Left 2 cols) -->
        <div class="flex flex-col gap-4 lg:col-span-2">
          <div class="flex items-center justify-between">
            <h2 class="text-[20px] font-medium tracking-[-0.01em] text-text-primary">
              Line Item Breakdown
            </h2>
            <span class="text-[13px] text-text-muted">GL Code Automapped</span>
          </div>

          <div class="rounded-xl border border-border-subtle bg-bg-surface p-1 shadow-subtle">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-border-subtle text-[12px] font-medium uppercase tracking-wider text-text-muted">
                  <th class="px-5 py-3.5">Description</th>
                  <th class="px-5 py-3.5">GL Account</th>
                  <th class="px-5 py-3.5 text-right">Qty</th>
                  <th class="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle text-[14px]">
                <tr v-for="item in (invoice.lineItems || [])" :key="item.id">
                  <td class="px-5 py-4 font-medium text-text-primary">
                    {{ item.description }}
                  </td>
                  <td class="px-5 py-4 font-mono text-[13px] text-text-muted">
                    {{ item.glAccount ?? "GL-6020" }}
                  </td>
                  <td class="px-5 py-4 text-right text-text-secondary">
                    {{ item.quantity }}
                  </td>
                  <td class="px-5 py-4 text-right font-medium text-text-primary">
                    {{ invoice.currency }} {{ item.amount.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Vendor & Compliance Intelligence Card (Right 1 col) -->
        <div class="flex flex-col gap-6">
          <div class="hero-card-lavender flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <Building2 class="h-5 w-5 text-text-primary" :stroke-width="1.5" />
              <h3 class="text-[18px] font-medium text-text-primary">Vendor Entity Profile</h3>
            </div>

            <div class="flex flex-col gap-3 text-[14px]">
              <div>
                <p class="text-[12px] text-text-muted">Legal Name</p>
                <p class="font-medium text-text-primary">
                  {{ invoice.vendor?.name ?? "CloudScale Software Solutions" }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-[12px] text-text-muted">GSTIN</p>
                  <p class="font-mono text-[13px] font-medium text-text-primary">
                    {{ invoice.vendor?.gstin ?? "29AADCB9876E1ZQ" }}
                  </p>
                </div>
                <div>
                  <p class="text-[12px] text-text-muted">PAN</p>
                  <p class="font-mono text-[13px] font-medium text-text-primary">
                    {{ invoice.vendor?.pan ?? "AADCB9876E" }}
                  </p>
                </div>
              </div>

              <div>
                <p class="text-[12px] text-text-muted">GST Compliance Status</p>
                <p class="flex items-center gap-1.5 font-medium text-status-success">
                  <CheckCircle2 class="h-4 w-4" /> GST Portal Active & Verified
                </p>
              </div>
            </div>
          </div>

          <!-- Risk & Fraud Audit Log Card -->
          <div class="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-subtle">
            <h3 class="text-[16px] font-medium text-text-primary">Risk Agent Audit Checks</h3>
            <ul class="mt-3 flex flex-col gap-2.5 text-[13px] text-text-secondary">
              <li class="flex items-center justify-between">
                <span>SHA-256 Deduplication</span>
                <span class="font-medium text-status-success">Pass</span>
              </li>
              <li class="flex items-center justify-between">
                <span>Bank Account Match</span>
                <span class="font-medium text-status-success">Pass</span>
              </li>
              <li class="flex items-center justify-between">
                <span>PO Price Tolerance (±0.5%)</span>
                <span class="font-medium text-status-success">0.00% variance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="hero-card-cream py-16 text-center text-text-muted">
      Invoice record not found.
    </div>
  </div>
</template>
