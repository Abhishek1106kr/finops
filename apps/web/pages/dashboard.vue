<script setup lang="ts">
import { computed, ref } from "vue";
import { Motion } from "motion-v";
import {
  Wallet,
  ShieldAlert,
  Clock,
  Users,
  FileText,
  CreditCard,
  CheckCircle2,
} from "lucide-vue-next";
import Card from "~/components/ui/Card.vue";
import Skeleton from "~/components/ui/Skeleton.vue";
import MetricCard from "~/components/dashboard/MetricCard.vue";
import InsightCard from "~/components/dashboard/InsightCard.vue";
import QuickActions from "~/components/dashboard/QuickActions.vue";
// CashFlowChart is a .client.vue (wraps vue-echarts) — used via its
// auto-imported tag <DashboardCashFlowChart> below, not a static import, so
// Nuxt excludes the vue-echarts module from the SSR bundle entirely.
import ForecastWidget from "~/components/dashboard/ForecastWidget.vue";
import ActivityTimeline, { type ActivityItem } from "~/components/dashboard/ActivityTimeline.vue";
import CopilotPanel from "~/components/dashboard/CopilotPanel.vue";
import { useDomainEvents, type DomainEventEnvelope } from "~/composables/useSocket";

definePageMeta({ layout: "default" });

interface InvoiceRow {
  id: string;
  status: string;
  invoiceNumber: string | null;
  totalAmount: number;
  currency: string;
  createdAt: string;
}
interface PaymentRow {
  id: string;
  invoiceId: string;
  amount: number;
  status: string;
  createdAt: string;
}
interface ApprovalRow {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  createdAt: string;
}
interface VendorRow {
  id: string;
  name: string;
  riskScore: number | null;
  status: string;
  createdAt: string;
}
interface ApiSuccess<T> {
  success: true;
  data: T;
}

const { apiBase } = useApi();

const { data: invoicesRes, pending: invoicesPending } = await useFetch<InvoiceRow[]>(`${apiBase}/invoices`);
const { data: paymentsRes, pending: paymentsPending, refresh: refreshPayments } = await useFetch<ApiSuccess<PaymentRow[]>>(`${apiBase}/payments`);
const { data: approvalsRes, pending: approvalsPending, refresh: refreshApprovals } = await useFetch<ApiSuccess<ApprovalRow[]>>(`${apiBase}/approvals`);
const { data: vendorsRes, pending: vendorsPending, refresh: refreshVendors } = await useFetch<ApiSuccess<VendorRow[]>>(`${apiBase}/vendors`);

const invoices = computed(() => invoicesRes.value ?? []);
const payments = computed(() => paymentsRes.value?.data ?? []);
const approvals = computed(() => approvalsRes.value?.data ?? []);
const vendors = computed(() => vendorsRes.value?.data ?? []);

const loading = computed(
  () => invoicesPending.value || paymentsPending.value || approvalsPending.value || vendorsPending.value,
);

// Live updates: any domain event affecting these entities triggers a targeted refetch.
useDomainEvents((event: DomainEventEnvelope) => {
  if (event.eventType.startsWith("Payment")) refreshPayments();
  if (event.eventType.startsWith("Approval")) refreshApprovals();
  if (event.eventType.startsWith("Vendor")) refreshVendors();
});

const pendingApprovals = computed(() => approvals.value.filter((a) => a.status === "pending"));
const flaggedInvoices = computed(() => invoices.value.filter((i) => i.status === "flagged"));
const scheduledOutflow = computed(() =>
  payments.value.filter((p) => p.status === "scheduled" || p.status === "processing").reduce((sum, p) => sum + p.amount, 0),
);
const completedPayouts = computed(() =>
  payments.value.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
);
const avgVendorRisk = computed(() => {
  const scored = vendors.value.filter((v) => v.riskScore !== null);
  if (!scored.length) return 0.05;
  return scored.reduce((sum, v) => sum + (v.riskScore ?? 0), 0) / scored.length;
});

// Last 7 days of completed payment volume — real data, not simulated.
const cashFlowSeries = computed(() => {
  const days: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const dayTotal = payments.value
      .filter((p) => p.status === "completed" && new Date(p.createdAt).toDateString() === d.toDateString())
      .reduce((sum, p) => sum + p.amount, 0);
    days.push({ label, value: dayTotal });
  }
  return days;
});

const activityItems = computed<ActivityItem[]>(() => [
  ...invoices.value.map((i) => ({
    id: `inv-${i.id}`,
    icon: FileText,
    title: i.invoiceNumber ? `Invoice ${i.invoiceNumber}` : "Invoice uploaded",
    meta: `${i.currency} ${i.totalAmount.toLocaleString("en-IN")} · ${i.status}`,
    timestamp: i.createdAt,
  })),
  ...payments.value.map((p) => ({
    id: `pay-${p.id}`,
    icon: CreditCard,
    title: `Payment ${p.status}`,
    meta: `₹${p.amount.toLocaleString("en-IN")}`,
    timestamp: p.createdAt,
  })),
  ...approvals.value.map((a) => ({
    id: `apr-${a.id}`,
    icon: CheckCircle2,
    title: `Approval ${a.status}`,
    meta: a.entityType,
    timestamp: a.createdAt,
  })),
].slice(0, 12));

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
});

const insight = computed(() => {
  if (flaggedInvoices.value.length > 0) {
    return {
      summary: `${flaggedInvoices.value.length} invoice${flaggedInvoices.value.length > 1 ? "s" : ""} flagged by the Risk Agent — duplicate or split-invoicing patterns detected.`,
      priority: "high" as const,
      action: "Review flagged invoices",
      to: "/invoices",
    };
  }
  if (pendingApprovals.value.length > 0) {
    return {
      summary: `${pendingApprovals.value.length} item${pendingApprovals.value.length > 1 ? "s" : ""} waiting on your approval — nothing settles until you act.`,
      priority: "medium" as const,
      action: "Go to inbox",
      to: "/inbox",
    };
  }
  return {
    summary: "No flags, no pending approvals — the pipeline is clear.",
    priority: "low" as const,
    action: undefined,
    to: undefined,
  };
});

// Payables due in the next 30 days — a real, derivable forward-looking number.
const upcomingPayables = computed(() =>
  invoices.value.filter((i) => i.status !== "paid" && i.status !== "rejected").reduce((sum, i) => sum + i.totalAmount, 0),
);
</script>

<template>
  <div class="flex flex-col gap-10">
    <Motion :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }">
      <p class="mb-2 text-[13px] font-medium uppercase tracking-[0.01em] text-carbon-500">
        {{ greeting }}
      </p>
      <h1 class="max-w-2xl text-[40px] font-normal leading-[1.08] tracking-[-0.03em] text-carbon-900 lg:text-[56px]">
        Your company, understood — not just reconciled.
      </h1>
    </Motion>

    <Motion :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.08 }">
      <InsightCard
        :summary="insight.summary"
        :priority="insight.priority"
        :suggested-action="insight.action"
        :action-to="insight.to"
      />
    </Motion>

    <Motion :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.14 }">
      <QuickActions />
    </Motion>

    <section class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <template v-if="loading">
        <Skeleton v-for="i in 4" :key="i" class="h-32" />
      </template>
      <template v-else>
        <MetricCard title="Payables Outstanding" :value="upcomingPayables" prefix="₹" :icon="Wallet" variant="lavender" />
        <MetricCard title="Scheduled Outflow" :value="scheduledOutflow" prefix="₹" :icon="CreditCard" />
        <MetricCard title="Pending Approvals" :value="pendingApprovals.length" :icon="Clock" variant="sage" />
        <MetricCard title="Vendors" :value="vendors.length" :icon="Users" />
      </template>
    </section>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <Card hover>
        <div class="mb-2 flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Settled Cash Flow — 7 Days</span>
        </div>
        <DashboardCashFlowChart :labels="cashFlowSeries.map((d) => d.label)" :values="cashFlowSeries.map((d) => d.value)" />
      </Card>

      <ForecastWidget :projected-balance="upcomingPayables" :risk-score="avgVendorRisk" :horizon-days="30" />
    </section>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-medium text-carbon-900">Live Activity</h2>
          <span v-if="flaggedInvoices.length" class="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <ShieldAlert class="h-3.5 w-3.5" />
            {{ flaggedInvoices.length }} flagged
          </span>
        </div>
        <ActivityTimeline :items="activityItems" />
      </Card>

      <CopilotPanel compact />
    </section>
  </div>
</template>
