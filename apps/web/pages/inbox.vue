<script setup lang="ts">
import { ref } from "vue";
import { CheckCircle2, XCircle, AlertCircle, FileText, ArrowRight } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface ApprovalItem {
  id: string;
  invoiceId: string;
  vendorName: string;
  amount: number;
  currency: string;
  department: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

const approvals = ref<ApprovalItem[]>([
  {
    id: "app-101",
    invoiceId: "inv-901",
    vendorName: "CloudScale Software Solutions",
    amount: 145000,
    currency: "INR",
    department: "Engineering",
    requestedAt: "10 mins ago",
    status: "pending",
  },
  {
    id: "app-102",
    invoiceId: "inv-902",
    vendorName: "Apex Office Supplies",
    amount: 28400,
    currency: "INR",
    department: "Operations",
    requestedAt: "1 hour ago",
    status: "pending",
  },
]);

const approveItem = (id: string) => {
  const item = approvals.value.find((a) => a.id === id);
  if (item) item.status = "approved";
};

const rejectItem = (id: string) => {
  const item = approvals.value.find((a) => a.id === id);
  if (item) item.status = "rejected";
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div>
      <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
        Unified Action Center
      </h1>
      <p class="mt-1 text-sm text-carbon-500">
        Multi-tier invoice approvals, departmental budget warnings, and AI risk notifications.
      </p>
    </div>

    <!-- Stats Summary Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Pending Approvals</div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ approvals.filter(a => a.status === 'pending').length }}
        </div>
        <div class="text-xs text-carbon-500">Requires executive sign-off</div>
      </div>

      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Approved Today</div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ approvals.filter(a => a.status === 'approved').length }}
        </div>
        <div class="text-xs text-carbon-500">Ready for payment scheduling</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Budget Status</div>
        <div class="text-3xl font-medium text-carbon-900">Normal</div>
        <div class="text-xs text-carbon-500">All departments within limits</div>
      </div>
    </div>

    <!-- Approvals List -->
    <div class="space-y-4">
      <h2 class="text-xl font-medium text-carbon-900">Pending Actions</h2>
      
      <div v-if="approvals.length === 0" class="bg-white rounded-3xl p-8 border border-carbon-100 text-center text-carbon-500 text-sm">
        All approval queues are clear.
      </div>

      <div
        v-for="item in approvals"
        :key="item.id"
        class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-carbon-300"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-carbon-900 shrink-0 mt-1 sm:mt-0">
            <FileText class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h3 class="font-medium text-carbon-900">{{ item.vendorName }}</h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cream-200 text-carbon-700">
                {{ item.department }}
              </span>
            </div>
            <p class="text-xs text-carbon-500 mt-1">
              Invoice ID: <span class="font-mono text-carbon-700">{{ item.invoiceId }}</span> • {{ item.requestedAt }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-carbon-100">
          <div class="text-right">
            <div class="text-lg font-medium text-carbon-900">
              ₹{{ item.amount.toLocaleString('en-IN') }}
            </div>
            <div class="text-xs text-carbon-500">Total Outflow</div>
          </div>

          <div v-if="item.status === 'pending'" class="flex items-center gap-2">
            <button
              @click="approveItem(item.id)"
              class="inline-flex items-center gap-1.5 bg-carbon-900 text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-carbon-800 transition-all"
            >
              <CheckCircle2 class="w-4 h-4 text-emerald-400" />
              Approve
            </button>
            <button
              @click="rejectItem(item.id)"
              class="inline-flex items-center gap-1.5 bg-cream-200 text-carbon-800 text-xs font-medium px-4 py-2 rounded-full hover:bg-cream-300 transition-all"
            >
              <XCircle class="w-4 h-4 text-rose-500" />
              Reject
            </button>
          </div>

          <div v-else class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            :class="item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
          >
            {{ item.status === 'approved' ? 'Approved' : 'Rejected' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
