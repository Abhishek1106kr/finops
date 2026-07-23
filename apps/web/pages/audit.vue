<script setup lang="ts">
import { ref } from "vue";
import { ShieldCheck, History, Database, Cpu } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface AuditRecord {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  actorType: "user" | "agent" | "system";
  actorId: string;
  occurredAt: string;
}

const auditLogs = ref<AuditRecord[]>([
  {
    id: "log-1",
    eventType: "PaymentCompleted",
    entityType: "Payment",
    entityId: "pay-701",
    actorType: "system",
    actorId: "pazypay-gateway",
    occurredAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "log-2",
    eventType: "ApprovalGranted",
    entityType: "Approval",
    entityId: "app-101",
    actorType: "user",
    actorId: "priya-nair-vp-eng",
    occurredAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "log-3",
    eventType: "VendorCreated",
    entityType: "Vendor",
    entityId: "v-001",
    actorType: "user",
    actorId: "finance-admin-01",
    occurredAt: new Date(Date.now() - 86400000).toISOString(),
  },
]);
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
        Immutable Audit Ledger
      </h1>
      <p class="mt-1 text-sm text-carbon-500">
        Complete event lineage tracking every user action, AI agent decision, and financial mutation.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Total Audit Records</div>
        <div class="text-3xl font-medium text-carbon-900">{{ auditLogs.length }}</div>
        <div class="text-xs text-carbon-500">Persisted in Redis Stream & DB</div>
      </div>

      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Audit Agent Readiness</div>
        <div class="text-3xl font-medium text-carbon-900">100% Active</div>
        <div class="text-xs text-carbon-500">Zero data loss guarantee</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Storage Engine</div>
        <div class="text-3xl font-medium text-carbon-900">Redis Streams</div>
        <div class="text-xs text-carbon-500">Durable replay log</div>
      </div>
    </div>

    <div class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle space-y-4">
      <h2 class="text-lg font-medium text-carbon-900">System Event Lineage</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-carbon-900">
          <thead>
            <tr class="border-b border-carbon-100 text-xs font-medium text-carbon-500 uppercase tracking-wider">
              <th class="py-3 px-4">Event Type</th>
              <th class="py-3 px-4">Entity</th>
              <th class="py-3 px-4">Actor</th>
              <th class="py-3 px-4">Occurred At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-carbon-100">
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-cream-50 transition-colors">
              <td class="py-4 px-4 font-mono text-xs font-medium text-carbon-900">{{ log.eventType }}</td>
              <td class="py-4 px-4 font-mono text-xs text-carbon-600">{{ log.entityType }}:{{ log.entityId }}</td>
              <td class="py-4 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cream-200 text-carbon-800">
                  {{ log.actorType }}: {{ log.actorId }}
                </span>
              </td>
              <td class="py-4 px-4 font-mono text-xs text-carbon-500">{{ new Date(log.occurredAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
