<script setup lang="ts">
import { ref } from "vue";
import { FileText, ShieldAlert, CheckCircle, RefreshCw, Sparkles } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface ContractItem {
  id: string;
  vendorName: string;
  title: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  aiClauseSummary: string;
  status: "active" | "expiring_soon" | "renewed";
}

const contracts = ref<ContractItem[]>([
  {
    id: "c-101",
    vendorName: "CloudScale Software Solutions",
    title: "Master Enterprise Cloud Services Agreement",
    startDate: "2025-08-01",
    endDate: "2026-08-01",
    autoRenew: true,
    aiClauseSummary: "Includes 99.9% Uptime SLA, 30-day termination clause, and net-45 payment terms.",
    status: "active",
  },
  {
    id: "c-102",
    vendorName: "Acme Logistics India Pvt Ltd",
    title: "Logistics & Freight Services Contract",
    startDate: "2025-01-15",
    endDate: "2026-08-15",
    autoRenew: false,
    aiClauseSummary: "Volume discount tier active at 50,000 units/mo. Penalty clause for delays > 48h.",
    status: "expiring_soon",
  },
]);
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
        Contracts Intelligence
      </h1>
      <p class="mt-1 text-sm text-carbon-500">
        AI-extracted vendor agreement clauses, renewal timelines, and SLA monitoring.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Active Contracts</div>
        <div class="text-3xl font-medium text-carbon-900">{{ contracts.length }}</div>
        <div class="text-xs text-carbon-500">Monitored supplier agreements</div>
      </div>

      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Auto-Renewal Clause</div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ contracts.filter(c => c.autoRenew).length }} Active
        </div>
        <div class="text-xs text-carbon-500">Automated renewal protection</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Vector Index</div>
        <div class="text-3xl font-medium text-carbon-900">pgvector</div>
        <div class="text-xs text-carbon-500">1536-dim semantic search index</div>
      </div>
    </div>

    <div class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle space-y-6">
      <h2 class="text-lg font-medium text-carbon-900">Monitored Vendor Agreements</h2>

      <div class="space-y-4">
        <div v-for="c in contracts" :key="c.id" class="p-6 rounded-2xl bg-cream-50 border border-carbon-100 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="font-medium text-carbon-900 text-base">{{ c.title }}</h3>
              <p class="text-xs text-carbon-500 font-mono">{{ c.vendorName }} • Term: {{ c.startDate }} to {{ c.endDate }}</p>
            </div>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto"
              :class="c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ c.status === 'active' ? 'Active' : 'Expiring Soon' }}
            </span>
          </div>

          <div class="p-4 rounded-xl bg-white border border-carbon-100 flex items-start gap-3">
            <Sparkles class="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div class="text-xs text-carbon-700 leading-relaxed">
              <span class="font-medium text-carbon-900">AI Clause Summary:</span> {{ c.aiClauseSummary }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
