<script setup lang="ts">
import { cva } from "class-variance-authority";
import { cn } from "~/utils/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-fast ease-fast disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-carbon-900 text-white hover:bg-carbon-800 shadow-sm",
        secondary: "bg-cream-200 text-carbon-800 hover:bg-cream-100",
        ghost: "bg-transparent text-carbon-700 hover:bg-cream-100",
      },
      size: {
        default: "px-5 py-2.5",
        sm: "px-4 py-2 text-xs",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm" | "icon";
  class?: string;
  disabled?: boolean;
}

const props = defineProps<ButtonProps>();
</script>

<template>
  <button
    :disabled="props.disabled"
    :class="cn(button({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </button>
</template>
