<script setup lang="ts">
import { cva } from "class-variance-authority";
import { cn } from "~/utils/cn";

const badge = cva("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-cream-200 text-carbon-800",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-rose-100 text-rose-800",
    },
  },
  defaultVariants: { variant: "neutral" },
});

const props = defineProps<{ variant?: "neutral" | "success" | "warning" | "danger"; class?: string }>();
</script>

<template>
  <span :class="cn(badge({ variant: props.variant }), props.class)">
    <slot />
  </span>
</template>
