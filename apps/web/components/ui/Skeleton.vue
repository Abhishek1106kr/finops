<script setup lang="ts">
import { cn } from "~/utils/cn";

const props = defineProps<{ class?: string }>();
</script>

<template>
  <div :class="cn('animate-pulse rounded-xl bg-cream-200/80', props.class)" />
</template>
