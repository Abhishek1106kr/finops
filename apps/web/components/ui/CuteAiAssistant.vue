<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { Sparkles, X, Send, Loader2, Bot, Layers, Search, ShieldCheck } from "lucide-vue-next";
import { useCopilotChat } from "~/composables/useCopilotChat";

const route = useRoute();
const isOpen = ref(false);
const input = ref("");
const scrollRef = ref<HTMLElement | null>(null);

const { messages, isStreaming, error, send } = useCopilotChat();

const currentScreenLabel = computed(() => {
  const path = route.path;
  if (path === "/dashboard") return "Dashboard & Financial Pulse";
  if (path === "/invoices") return "Invoice Ingestion & OCR Grid";
  if (path === "/payments") return "Payment Engine Ledger";
  if (path === "/vendors") return "Vendor Intelligence";
  if (path === "/inbox") return "Unified Action Center & Approvals";
  if (path === "/budgets") return "Departmental Budgets & POs";
  if (path === "/contracts") return "Contracts Intelligence";
  if (path === "/cash-flow") return "Predictive Cash Flow";
  if (path === "/audit") return "Immutable Audit Ledger";
  if (path === "/featureboard") return "System Feature Board";
  return `View (${path})`;
});

const quickPrompts = [
  "Analyze current screen content 🔍",
  "Search RAG invoices & payments 🧠",
  "What needs my immediate sign-off? ⚡",
];

async function submitPrompt(text?: string) {
  const value = (text ?? input.value).trim();
  if (!value || isStreaming.value) return;
  input.value = "";
  
  const screenContext = `Active Page: ${currentScreenLabel.value} (Route: ${route.path})`;
  await send(value, screenContext);
  
  nextTick(() => {
    scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: "smooth" });
  });
}
</script>

<template>
  <div>
    <!-- Cute Floating Trigger Button (Bottom-Right Corner) -->
    <button
      @click="isOpen = !isOpen"
      class="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 bg-carbon-900 text-white text-xs font-medium px-4 py-3 rounded-full shadow-floating hover:scale-105 transition-all duration-300 border border-carbon-800"
      aria-label="Open AI Assistant"
    >
      <div class="relative flex items-center justify-center">
        <Sparkles class="w-4 h-4 text-purple-300 animate-pulse" />
        <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      </div>
      <span>Finance AI Copilot</span>
      <span class="bg-carbon-800 text-purple-200 text-[10px] px-2 py-0.5 rounded-full font-mono">RAG</span>
    </button>

    <!-- Cute Floating AI Chat Panel -->
    <div
      v-if="isOpen"
      class="fixed bottom-20 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white border border-carbon-100 rounded-3xl shadow-floating overflow-hidden flex flex-col h-[520px] transition-all duration-300"
    >
      <!-- Panel Header -->
      <div class="bg-pastel-lavender p-4 border-b border-purple-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-carbon-900 flex items-center justify-center text-white shrink-0">
            <Bot class="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h3 class="text-xs font-medium text-carbon-900 flex items-center gap-1.5">
              PazyPro AI Copilot
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h3>
            <p class="text-[11px] text-carbon-600 truncate max-w-[220px]">
              Screen: {{ currentScreenLabel }}
            </p>
          </div>
        </div>
        <button
          @click="isOpen = false"
          class="w-7 h-7 rounded-full bg-white/80 text-carbon-600 flex items-center justify-center hover:bg-white transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Messages Scroll Body -->
      <div ref="scrollRef" class="flex-1 p-4 space-y-3.5 overflow-y-auto bg-cream-50/50 text-xs">
        <!-- Initial Greeting & Quick Prompts -->
        <div v-if="!messages.length" class="space-y-3">
          <div class="bg-white p-3.5 rounded-2xl border border-carbon-100 text-carbon-800 leading-relaxed shadow-sm">
            👋 Hi! I'm your PazyPro Finance AI Assistant. I can explain the content on your screen or use RAG embeddings to query invoices, vendors, and payout rails.
          </div>

          <div class="space-y-1.5">
            <p class="text-[11px] font-medium text-carbon-500 uppercase tracking-wider px-1">Suggested Quick Actions</p>
            <div class="flex flex-col gap-1.5">
              <button
                v-for="prompt in quickPrompts"
                :key="prompt"
                @click="submitPrompt(prompt)"
                class="text-left bg-white hover:bg-cream-100 border border-carbon-100 text-carbon-800 px-3 py-2 rounded-xl transition-all font-medium text-xs shadow-xs"
              >
                {{ prompt }}
              </button>
            </div>
          </div>
        </div>

        <!-- Chat History Messages -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="max-w-[88%] p-3 rounded-2xl leading-relaxed"
          :class="msg.role === 'user' ? 'ml-auto bg-carbon-900 text-white rounded-br-none' : 'bg-white border border-carbon-100 text-carbon-900 shadow-sm rounded-bl-none'"
        >
          {{ msg.content || (isStreaming && idx === messages.length - 1 ? 'Thinking...' : '') }}
        </div>

        <p v-if="error" class="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
          {{ error }}
        </p>
      </div>

      <!-- Chat Input Form -->
      <form @submit.prevent="submitPrompt()" class="p-3 bg-white border-t border-carbon-100 flex items-center gap-2">
        <input
          v-model="input"
          type="text"
          placeholder="Ask about screen content or RAG invoices..."
          class="flex-1 bg-cream-50 text-xs text-carbon-900 border border-carbon-200 rounded-full px-4 py-2.5 focus:outline-none focus:border-carbon-900"
        />
        <button
          type="submit"
          :disabled="isStreaming || !input.trim()"
          class="w-9 h-9 rounded-full bg-carbon-900 text-white flex items-center justify-center hover:bg-carbon-800 disabled:opacity-40 transition-all shrink-0"
        >
          <Loader2 v-if="isStreaming" class="w-4 h-4 animate-spin" />
          <Send v-else class="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
</template>
