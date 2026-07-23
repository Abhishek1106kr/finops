<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";
import Card from "~/components/ui/Card.vue";
import Badge from "~/components/ui/Badge.vue";

defineProps<{
  summary: string;
  priority: "low" | "medium" | "high";
  suggestedAction?: string;
  actionTo?: string;
}>();

const priorityVariant = { low: "neutral", medium: "warning", high: "danger" } as const;
</script>

<template>
  <Card variant="lavender" padding="lg" hover class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-carbon-600">
        <Sparkles class="h-3.5 w-3.5" />
        AI Insight
      </span>
      <Badge :variant="priorityVariant[priority]">{{ priority }} priority</Badge>
    </div>

    <p class="text-lg font-medium leading-snug text-carbon-900">{{ summary }}</p>

    <NuxtLink v-if="suggestedAction && actionTo" :to="actionTo" class="text-sm font-medium text-carbon-900 underline underline-offset-4 hover:no-underline">
      {{ suggestedAction }} →
    </NuxtLink>
  </Card>
</template>
