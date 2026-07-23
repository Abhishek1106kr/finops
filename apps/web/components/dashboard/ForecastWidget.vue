<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
// RiskMeter is a .client.vue (wraps vue-echarts, which touches `document` at
// module scope) — referenced by its auto-imported tag, not a static import,
// so Nuxt excludes it from the SSR bundle entirely instead of just delaying
// its render.

defineProps<{
  projectedBalance: number;
  riskScore: number;
  horizonDays: number;
}>();
</script>

<template>
  <Card hover>
    <div class="flex items-center justify-between text-carbon-600">
      <span class="text-xs font-medium uppercase tracking-wider">{{ horizonDays }}-Day Forecast</span>
    </div>
    <DashboardRiskMeter :value="riskScore" label="risk" />
    <div class="text-center">
      <p class="text-lg font-medium text-carbon-900">
        ₹{{ Math.round(projectedBalance).toLocaleString("en-IN") }}
      </p>
      <p class="text-xs text-carbon-500">Projected balance</p>
    </div>
  </Card>
</template>
