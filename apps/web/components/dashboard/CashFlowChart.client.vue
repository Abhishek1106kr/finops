<script setup lang="ts">
import { computed } from "vue";
import VChart from "vue-echarts";
import "./echarts-setup";

const props = defineProps<{
  labels: string[];
  values: number[];
}>();

const option = computed(() => ({
  animationDuration: 600,
  grid: { left: 0, right: 0, top: 8, bottom: 20, containLabel: false },
  tooltip: {
    trigger: "axis",
    backgroundColor: "#121212",
    borderWidth: 0,
    textStyle: { color: "#FFFFFF", fontSize: 12 },
    valueFormatter: (v: number) => `₹${v.toLocaleString("en-IN")}`,
  },
  xAxis: {
    type: "category",
    data: props.labels,
    boundaryGap: false,
    axisLine: { lineStyle: { color: "rgba(18,18,18,0.08)" } },
    axisTick: { show: false },
    axisLabel: { color: "#8C8C8E", fontSize: 11 },
  },
  yAxis: { type: "value", show: false },
  series: [
    {
      type: "line",
      data: props.values,
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      showSymbol: false,
      lineStyle: { color: "#121212", width: 2 },
      itemStyle: { color: "#121212" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(18,18,18,0.14)" },
            { offset: 1, color: "rgba(18,18,18,0)" },
          ],
        },
      },
    },
  ],
}));
</script>

<template>
  <VChart :option="option" autoresize class="h-40 w-full" />
</template>
