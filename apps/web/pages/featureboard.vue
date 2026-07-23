<script setup lang="ts">
import { ref } from "vue";
import { CheckCircle2, Clock, Calendar, ShieldCheck, Cpu, Zap, Activity } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface ModuleFeature {
  name: string;
  status: "LIVE" | "IN_PROGRESS" | "PLANNED";
  category: string;
  description: string;
  endpoint: string;
}

const features = ref<ModuleFeature[]>([
  {
    name: "Company Intelligence Graph",
    status: "LIVE",
    category: "Core Engine",
    description: "PostgreSQL + pgvector 1536-dim embeddings connecting all enterprise entities.",
    endpoint: "/api/v1/demo",
  },
  {
    name: "Dashboard & Financial Pulse",
    status: "LIVE",
    category: "Frontend",
    description: "Real-time cash flow pulse, urgent action cards, and soft pastel summary blocks.",
    endpoint: "/api/v1/invoices",
  },
  {
    name: "Invoice Ingestion & OCR",
    status: "LIVE",
    category: "AI & Ingestion",
    description: "SHA-256 deduplication, async BullMQ OCR worker, confidence scoring.",
    endpoint: "/api/v1/invoices",
  },
  {
    name: "Vendor Intelligence",
    status: "LIVE",
    category: "Compliance",
    description: "GSTIN/PAN validation, risk scoring, supplier profiles, and blacklist checks.",
    endpoint: "/api/v1/vendors",
  },
  {
    name: "Unified Action Center (Inbox)",
    status: "LIVE",
    category: "Workflows",
    description: "Multi-tier approval routing, executive sign-offs, and budget warnings.",
    endpoint: "/api/v1/approvals",
  },
  {
    name: "Payment Engine (PazyPay)",
    status: "LIVE",
    category: "Settlement",
    description: "Autonomous IMPS / NEFT / RTGS settlement rail selection & signed HMAC webhooks.",
    endpoint: "/api/v1/payments",
  },
  {
    name: "Mock Data Ingestion System",
    status: "LIVE",
    category: "Demo & Testing",
    description: "One-click financial graph instantiation & event fanout across Redis streams.",
    endpoint: "/api/v1/demo/ingest-mock-data",
  },
  {
    name: "Departmental Budgets & POs",
    status: "IN_PROGRESS",
    category: "Core Engine",
    description: "PO-to-invoice 2-way and 3-way matching engine with variance calculations.",
    endpoint: "/api/v1/budgets",
  },
  {
    name: "AI Agents Mesh Workspace",
    status: "IN_PROGRESS",
    category: "AI Layer",
    description: "Finance Brain reasoning graph logs, LangGraph agents, and prompt workspace.",
    endpoint: "/api/v1/ai",
  },
  {
    name: "Contracts Intelligence",
    status: "PLANNED",
    category: "Intelligence",
    description: "Clause extraction, auto-renewal alerts, and contract PDF semantic search.",
    endpoint: "/api/v1/contracts",
  },
  {
    name: "Cash Flow & Runway Modeling",
    status: "PLANNED",
    category: "Analytics",
    description: "Predictive liquidity curves and runway forecasts via Forecast Agent.",
    endpoint: "/api/v1/cash-flow",
  },
  {
    name: "Immutable Audit Ledger",
    status: "LIVE",
    category: "Auditing",
    description: "Event lineage log storing every user action, AI decision, and system mutation.",
    endpoint: "/api/v1/audit",
  },
]);

const filterStatus = ref<string>("ALL");
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div>
      <div class="flex items-center gap-2 text-xs font-mono font-medium text-carbon-500 uppercase tracking-wider mb-2">
        <Activity class="w-4 h-4 text-emerald-600" />
        PazyPro Release Matrix v1.0.0
      </div>
      <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
        System Feature Board
      </h1>
      <p class="mt-1 text-sm text-carbon-500">
        Live status of engineering modules, AI agent mesh readiness, event mesh coverage, and API endpoints.
      </p>
    </div>

    <!-- Summary Statistics Grid (UI.md Pastel Styles) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Live & Operational</span>
          <CheckCircle2 class="w-5 h-5 text-emerald-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ features.filter(f => f.status === 'LIVE').length }} Modules
        </div>
        <div class="text-xs text-carbon-500">Verified end-to-end capabilities</div>
      </div>

      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">In Active Pipeline</span>
          <Cpu class="w-5 h-5 text-purple-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ features.filter(f => f.status === 'IN_PROGRESS').length }} Modules
        </div>
        <div class="text-xs text-carbon-500">Scaffolded and undergoing integration</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Planned Roadmap</span>
          <Calendar class="w-5 h-5 text-carbon-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ features.filter(f => f.status === 'PLANNED').length }} Modules
        </div>
        <div class="text-xs text-carbon-500">Architected in skills.md specification</div>
      </div>
    </div>

    <!-- Features List Table -->
    <div class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-lg font-medium text-carbon-900">Feature Readiness Matrix</h2>
        <div class="flex items-center gap-2">
          <button
            @click="filterStatus = 'ALL'"
            class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="filterStatus === 'ALL' ? 'bg-carbon-900 text-white' : 'bg-cream-100 text-carbon-700 hover:bg-cream-200'"
          >
            All
          </button>
          <button
            @click="filterStatus = 'LIVE'"
            class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="filterStatus === 'LIVE' ? 'bg-emerald-600 text-white' : 'bg-cream-100 text-carbon-700 hover:bg-cream-200'"
          >
            Live
          </button>
          <button
            @click="filterStatus = 'IN_PROGRESS'"
            class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="filterStatus === 'IN_PROGRESS' ? 'bg-purple-600 text-white' : 'bg-cream-100 text-carbon-700 hover:bg-cream-200'"
          >
            In Progress
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-carbon-900">
          <thead>
            <tr class="border-b border-carbon-100 text-xs font-medium text-carbon-500 uppercase tracking-wider">
              <th class="py-3 px-4">Feature Module</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4">Description</th>
              <th class="py-3 px-4">Endpoint</th>
              <th class="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-carbon-100">
            <tr
              v-for="item in features.filter(f => filterStatus === 'ALL' || f.status === filterStatus)"
              :key="item.name"
              class="hover:bg-cream-50 transition-colors"
            >
              <td class="py-4 px-4 font-medium">{{ item.name }}</td>
              <td class="py-4 px-4 text-xs text-carbon-500 font-medium">{{ item.category }}</td>
              <td class="py-4 px-4 text-xs text-carbon-600 max-w-xs">{{ item.description }}</td>
              <td class="py-4 px-4 font-mono text-xs text-carbon-700">{{ item.endpoint }}</td>
              <td class="py-4 px-4">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-emerald-100 text-emerald-800': item.status === 'LIVE',
                    'bg-purple-100 text-purple-800': item.status === 'IN_PROGRESS',
                    'bg-cream-200 text-carbon-700': item.status === 'PLANNED',
                  }"
                >
                  {{ item.status === 'LIVE' ? '🟢 Live' : item.status === 'IN_PROGRESS' ? '🟡 In Progress' : '🔵 Planned' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
