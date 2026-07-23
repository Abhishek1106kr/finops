<script setup lang="ts">
import { ref } from "vue";
import { TrendingUp, Activity, ShieldCheck, Zap } from "lucide-vue-next";

definePageMeta({ layout: "default" });

const forecastHorizon = ref(30);
const projectedBalance = ref(7550000);
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
        Predictive Cash Flow & Runway
      </h1>
      <p class="mt-1 text-sm text-carbon-500">
        Forecast Agent probabilistic liquidity modeling, working capital optimization, and runway forecasting.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Projected Cash (30d)</div>
        <div class="text-3xl font-medium text-carbon-900">₹{{ projectedBalance.toLocaleString('en-IN') }}</div>
        <div class="text-xs text-carbon-500">95% Confidence Interval</div>
      </div>

      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Estimated Runway</div>
        <div class="text-3xl font-medium text-carbon-900">18.4 Months</div>
        <div class="text-xs text-carbon-500">Based on historical burn velocity</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Forecast Agent Status</div>
        <div class="text-3xl font-medium text-carbon-900">Active</div>
        <div class="text-xs text-carbon-500">Event Stream synced</div>
      </div>
    </div>

    <div class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle space-y-4">
      <h2 class="text-lg font-medium text-carbon-900">Liquidity Curve Projection</h2>
      <div class="p-8 rounded-2xl bg-cream-50 border border-carbon-100 text-center space-y-3">
        <Activity class="w-8 h-8 text-carbon-600 mx-auto" />
        <p class="text-sm font-medium text-carbon-900">30/60/90-Day Cash Availability Model</p>
        <p class="text-xs text-carbon-500 max-w-md mx-auto">
          Inflows from receivables combined with scheduled payouts from PazyPay gateway yield a healthy net positive working capital buffer.
        </p>
      </div>
    </div>
  </div>
</template>
