<script setup lang="ts">
import { cva } from "class-variance-authority";
import { cn } from "~/utils/cn";

const card = cva("rounded-3xl border shadow-subtle transition-all duration-smooth ease-smooth", {
  variants: {
    variant: {
      default: "bg-white border-carbon-100",
      lavender: "bg-pastel-lavender border-purple-100",
      sage: "bg-pastel-sage border-emerald-100",
      cream: "bg-cream-100 border-carbon-100",
    },
    padding: {
      default: "p-6",
      lg: "p-8",
      none: "",
    },
    hover: {
      true: "hover:-translate-y-1 hover:shadow-floating",
      false: "",
    },
  },
  defaultVariants: { variant: "default", padding: "default", hover: false },
});

export interface CardProps {
  variant?: "default" | "lavender" | "sage" | "cream";
  padding?: "default" | "lg" | "none";
  hover?: boolean;
  class?: string;
}

const props = defineProps<CardProps>();
</script>

<template>
  <div :class="cn(card({ variant: props.variant, padding: props.padding, hover: props.hover }), props.class)">
    <slot />
  </div>
</template>
