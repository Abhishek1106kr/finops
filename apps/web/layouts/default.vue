<script setup lang="ts">
import { Sparkle, Bell } from "lucide-vue-next";
import CuteAiAssistant from "~/components/ui/CuteAiAssistant.vue";

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Inbox", to: "/inbox" },
  { label: "Invoices", to: "/invoices" },
  { label: "Payments", to: "/payments" },
  { label: "Vendors", to: "/vendors" },
  { label: "Budgets", to: "/budgets" },
];
</script>

<template>
  <div class="min-h-screen bg-bg-primary text-text-primary relative">
    <header class="mx-auto flex max-w-content items-center justify-between px-10 pt-8">
      <NuxtLink to="/dashboard" class="flex items-center gap-2">
        <Sparkle class="h-5 w-5" :stroke-width="1.5" />
        <span class="text-[13px] text-text-muted">/ finance@pazypro.io</span>
      </NuxtLink>

      <nav class="hidden items-center gap-8 md:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-[13px] font-medium text-text-secondary transition-colors duration-fast hover:text-text-primary"
          active-class="text-text-primary"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <button class="floating-pill" aria-label="Notifications">
          <Bell class="h-4 w-4" :stroke-width="1.5" />
        </button>
        <NuxtLink to="/ai" class="btn-pill-primary">Ask Finance Brain ✳</NuxtLink>
      </div>
    </header>

    <main class="mx-auto max-w-content px-10 py-12">
      <slot />
    </main>

    <!-- Cute Floating AI Assistant (Bottom-Right Corner) -->
    <CuteAiAssistant />
  </div>
</template>
