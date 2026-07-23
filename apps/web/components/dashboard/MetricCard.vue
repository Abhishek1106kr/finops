<script setup lang="ts">
import { computed, toRef, type Component } from "vue";
import { ArrowUpRight, ArrowDownRight } from "lucide-vue-next";
import Card from "~/components/ui/Card.vue";
import { useCountUp } from "~/composables/useCountUp";

const props = defineProps<{
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trendPct?: number;
  icon?: Component;
  sparkline?: number[];
  variant?: "default" | "lavender" | "sage" | "cream";
}>();

const animated = useCountUp(toRef(props, "value"));
const displayValue = computed(() => Math.round(animated.value).toLocaleString("en-IN"));

const sparklinePoints = computed(() => {
  const data = props.sparkline;
  if (!data || data.length < 2) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 24 - ((v - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");
});
</script>

<template>
  <Card :variant="variant ?? 'default'" hover>
    <div class="flex items-center justify-between text-carbon-600">
      <span class="text-xs font-medium uppercase tracking-wider">{{ title }}</span>
      <component :is="icon" v-if="icon" class="h-4 w-4" />
    </div>

    <div class="mt-2 flex items-end justify-between gap-3">
      <div class="text-3xl font-medium text-carbon-900 tabular-nums">
        {{ prefix }}{{ displayValue }}{{ suffix }}
      </div>
      <svg v-if="sparkline?.length" viewBox="0 0 100 24" class="h-6 w-16 shrink-0" preserveAspectRatio="none">
        <polyline :points="sparklinePoints" fill="none" stroke="currentColor" stroke-width="2" class="text-carbon-900/60" />
      </svg>
    </div>

    <div v-if="trendPct !== undefined" class="mt-1 flex items-center gap-1 text-xs font-medium"
      :class="trendPct >= 0 ? 'text-emerald-600' : 'text-rose-600'"
    >
      <component :is="trendPct >= 0 ? ArrowUpRight : ArrowDownRight" class="h-3.5 w-3.5" />
      {{ Math.abs(trendPct).toFixed(1) }}%
    </div>
  </Card>
</template>
