<script setup lang="ts">
import { ArrowUpRight, TrendingUp, ShieldAlert, Clock } from "lucide-vue-next";

definePageMeta({ layout: "default" });

const urgentActions = [
  { title: "3 invoices need approval", meta: "₹4,82,000 pending · Operations", icon: Clock },
  { title: "Vendor bank change flagged", meta: "Risk Agent · Acme Logistics", icon: ShieldAlert },
  { title: "Budget at 92% — Marketing", meta: "Q3 threshold breach imminent", icon: TrendingUp },
];
</script>

<template>
  <div class="flex flex-col gap-16">
    <section class="grid grid-cols-1 gap-6 lg:grid-cols-[2.2fr_1fr]">
      <div class="flex flex-col justify-between gap-8">
        <div>
          <p class="mb-4 text-[13px] font-medium uppercase tracking-[0.01em] text-text-muted">
            Financial Pulse
          </p>
          <h1 class="max-w-xl text-[44px] font-normal leading-[1.08] tracking-[-0.03em] text-text-primary lg:text-[64px]">
            Your company, understood — not just reconciled.
          </h1>
        </div>

        <div class="grid grid-cols-2 gap-6 text-[14px] text-text-secondary sm:grid-cols-4">
          <div>
            <p class="font-medium text-text-primary">Websites</p>
            <p>Runway curve</p>
          </div>
          <div>
            <p class="font-medium text-text-primary">Social Media</p>
            <p>Vendor graph</p>
          </div>
          <div>
            <p class="font-medium text-text-primary">Marketing API</p>
            <p>Risk signals</p>
          </div>
          <div>
            <p class="font-medium text-text-primary">Release Notes</p>
            <p>Agent activity</p>
          </div>
        </div>
      </div>

      <div class="hero-card-lavender flex flex-col justify-between">
        <div class="floating-pill w-fit">
          <ArrowUpRight class="h-4 w-4 text-status-success" :stroke-width="1.5" />
          <span>Cash position +12.4% ~ ₹2.4Cr</span>
        </div>
        <div class="mt-8 flex h-32 items-end gap-2">
          <div
            v-for="(h, i) in [40, 65, 50, 80, 60, 95, 70]"
            :key="i"
            class="flex-1 rounded-sm bg-text-primary/80"
            :style="{ height: `${h}%` }"
          />
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <article
        v-for="action in urgentActions"
        :key="action.title"
        class="rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-subtle transition-transform duration-smooth ease-smooth hover:-translate-y-1"
      >
        <component :is="action.icon" class="mb-4 h-5 w-5 text-text-primary" :stroke-width="1.5" />
        <h3 class="text-[18px] font-medium leading-[1.3] tracking-[-0.01em] text-text-primary">
          {{ action.title }}
        </h3>
        <p class="mt-1 text-[14px] text-text-secondary">{{ action.meta }}</p>
      </article>
    </section>

    <section class="hero-card-sage p-10">
      <p class="max-w-xl text-[24px] font-medium leading-[1.3] tracking-[-0.01em] text-text-primary">
        "We caught a split-invoicing pattern across two vendors before it touched payables."
      </p>
      <p class="mt-4 text-[13px] text-text-secondary">Risk Agent · Autonomous flag, 2 minutes ago</p>
    </section>
  </div>
</template>
