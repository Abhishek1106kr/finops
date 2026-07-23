<script setup lang="ts">
import { computed } from "vue";
import VChart from "vue-echarts";
import "./echarts-setup";

const props = defineProps<{ value: number; label: string }>();

const color = computed(() => {
  if (props.value < 0.34) return "#22C55E";
  if (props.value < 0.67) return "#F59E0B";
  return "#EF4444";
});

const option = computed(() => ({
  series: [
    {
      type: "gauge",
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 1,
      radius: "100%",
      progress: { show: true, width: 10, itemStyle: { color: color.value } },
      axisLine: { lineStyle: { width: 10, color: [[1, "rgba(18,18,18,0.08)"]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      detail: {
        valueAnimation: true,
        formatter: (v: number) => `${Math.round(v * 100)}%`,
        color: "#121212",
        fontSize: 22,
        fontWeight: 500,
        offsetCenter: [0, "-10%"],
      },
      data: [{ value: props.value, name: props.label }],
      title: { show: false },
    },
  ],
}));
</script>

<template>
  <VChart :option="option" autoresize class="h-28 w-full" />
</template>
