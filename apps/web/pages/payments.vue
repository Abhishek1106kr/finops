<script setup lang="ts">
import { ref } from "vue";
import { CreditCard, Send, CheckCircle2, AlertCircle, RefreshCw, Zap } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface PaymentItem {
  id: string;
  invoiceId: string;
  vendorName: string;
  amount: number;
  currency: string;
  railType: "IMPS" | "NEFT" | "RTGS";
  status: "scheduled" | "processing" | "completed" | "failed";
  bankReference: string;
  createdAt: string;
}

const payments = ref<PaymentItem[]>([
  {
    id: "pay-701",
    invoiceId: "INV-2026-0891",
    vendorName: "CloudScale Software Solutions",
    amount: 145000,
    currency: "INR",
    railType: "IMPS",
    status: "completed",
    bankReference: "BANK-8A9F01B3C4D5",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "pay-702",
    invoiceId: "INV-2026-0902",
    vendorName: "Acme Logistics India Pvt Ltd",
    amount: 520000,
    currency: "INR",
    railType: "NEFT",
    status: "scheduled",
    bankReference: "PZP-NEFT-9912AB34CD",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "pay-703",
    invoiceId: "INV-2026-0955",
    vendorName: "Apex Office Supplies",
    amount: 28400,
    currency: "INR",
    railType: "IMPS",
    status: "completed",
    bankReference: "BANK-77B11C22D33E",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]);

const isProcessing = ref(false);

const processInstantPayout = () => {
  isProcessing.value = true;
  setTimeout(() => {
    payments.value.unshift({
      id: `pay-${Date.now()}`,
      invoiceId: "INV-DEMO-EXECUTIVE",
      vendorName: "CloudScale Software Solutions",
      amount: 180000,
      currency: "INR",
      railType: "IMPS",
      status: "completed",
      bankReference: `BANK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });
    isProcessing.value = false;
  }, 1200);
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
          Payment Engine
        </h1>
        <p class="mt-1 text-sm text-carbon-500">
          Autonomous Indian settlement rail selection (IMPS / NEFT / RTGS) & idempotent bank payouts.
        </p>
      </div>
      <button
        @click="processInstantPayout"
        :disabled="isProcessing"
        class="inline-flex items-center justify-center gap-2 bg-carbon-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-carbon-800 transition-all shadow-sm disabled:opacity-50"
      >
        <Zap class="w-4 h-4 text-amber-400" />
        {{ isProcessing ? "Processing Payout..." : "Execute Payout" }}
      </button>
    </div>

    <!-- Overview Cards Grid (UI.md Pastel Styles) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Total Disbursed</span>
          <CreditCard class="w-5 h-5 text-purple-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">
          ₹{{ payments.reduce((acc, p) => acc + (p.status === 'completed' ? p.amount : 0), 0).toLocaleString('en-IN') }}
        </div>
        <div class="text-xs text-carbon-500">Settled payouts</div>
      </div>

      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Active Rails</span>
          <Send class="w-5 h-5 text-emerald-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">IMPS / NEFT / RTGS</div>
        <div class="text-xs text-carbon-500">Automatic rail selection active</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Idempotency Guarantee</span>
          <CheckCircle2 class="w-5 h-5 text-emerald-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">100% Locked</div>
        <div class="text-xs text-carbon-500">Zero double-payment risk</div>
      </div>
    </div>

    <!-- Payment Ledger Table Container -->
    <div class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-carbon-900">Payment Ledger</h2>
        <span class="text-xs text-carbon-500 font-mono">PazyPay Gateway v1.0</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-carbon-900">
          <thead>
            <tr class="border-b border-carbon-100 text-xs font-medium text-carbon-500 uppercase tracking-wider">
              <th class="py-3 px-4">Bank Reference</th>
              <th class="py-3 px-4">Beneficiary Vendor</th>
              <th class="py-3 px-4">Amount</th>
              <th class="py-3 px-4">Settlement Rail</th>
              <th class="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-carbon-100">
            <tr v-for="item in payments" :key="item.id" class="hover:bg-cream-50 transition-colors">
              <td class="py-4 px-4 font-mono text-xs text-carbon-700 font-medium">{{ item.bankReference }}</td>
              <td class="py-4 px-4 font-medium">{{ item.vendorName }}</td>
              <td class="py-4 px-4 font-medium">₹{{ item.amount.toLocaleString('en-IN') }}</td>
              <td class="py-4 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cream-200 text-carbon-800">
                  {{ item.railType }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ item.status === 'completed' ? 'Settled' : 'Scheduled' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
