<script setup lang="ts">
import { Upload, UserPlus, CheckCircle2, Landmark, RefreshCw } from "lucide-vue-next";

const actions = [
  { label: "Upload Invoice", icon: Upload, to: "/invoices" },
  { label: "Create Vendor", icon: UserPlus, to: "/vendors" },
  { label: "Approve Payments", icon: CheckCircle2, to: "/inbox" },
  { label: "Import Bank Statement", icon: Landmark, to: null },
  { label: "Sync ERP", icon: RefreshCw, to: null },
];
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <component
      :is="action.to ? 'NuxtLink' : 'button'"
      v-for="action in actions"
      :key="action.label"
      :to="action.to ?? undefined"
      :disabled="!action.to"
      class="inline-flex items-center gap-2 rounded-full border border-carbon-100 bg-white px-4 py-2 text-sm font-medium text-carbon-800 shadow-subtle transition-all duration-fast ease-fast hover:-translate-y-px hover:shadow-pill disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-subtle"
      :title="action.to ? undefined : 'Coming soon'"
    >
      <component :is="action.icon" class="h-4 w-4" />
      {{ action.label }}
    </component>
  </div>
</template>
