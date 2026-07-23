<script setup lang="ts">
import CopilotPanel from "~/components/dashboard/CopilotPanel.vue";

definePageMeta({ layout: "default" });
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-normal tracking-[-0.02em] text-carbon-900">Finance Brain</h1>
      <p class="mt-1 text-sm text-carbon-500">
        Ask about cash flow, risk, vendors, or approvals — grounded in your live company data.
      </p>
    </div>
    <CopilotPanel />
  </div>
</template>
