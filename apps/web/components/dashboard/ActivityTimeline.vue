<script setup lang="ts">
import { computed } from "vue";
import { Motion } from "motion-v";
import type { Component } from "vue";

export interface ActivityItem {
  id: string;
  icon: Component;
  title: string;
  meta: string;
  timestamp: string;
}

const props = defineProps<{ items: ActivityItem[] }>();

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const sorted = computed(() =>
  [...props.items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
);
</script>

<template>
  <div class="flex flex-col divide-y divide-carbon-100">
    <Motion
      v-for="(item, i) in sorted"
      :key="item.id"
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }"
      class="flex items-center gap-4 py-3"
    >
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-carbon-900">
        <component :is="item.icon" class="h-4 w-4" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-carbon-900">{{ item.title }}</p>
        <p class="truncate text-xs text-carbon-500">{{ item.meta }}</p>
      </div>
      <span class="shrink-0 text-xs text-carbon-400">{{ formatTime(item.timestamp) }}</span>
    </Motion>

    <p v-if="!sorted.length" class="py-8 text-center text-sm text-carbon-500">No activity yet.</p>
  </div>
</template>
