<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { X, Send, Loader2, Sparkles } from "lucide-vue-next";
import { useCopilotChat } from "~/composables/useCopilotChat";

const route = useRoute();
const isOpen = ref(false);
const input = ref("");
const scrollRef = ref<HTMLElement | null>(null);

const { messages, isStreaming, error, send } = useCopilotChat();

// Mouse-tracking interactive eye position logic
const pupilLeft = ref({ x: 0, y: 0 });
const pupilRight = ref({ x: 0, y: 0 });
const mascotRef = ref<HTMLElement | null>(null);

const handleMouseMove = (e: MouseEvent) => {
  if (!mascotRef.value) return;
  const rect = mascotRef.value.getBoundingClientRect();
  const mascotCenterX = rect.left + rect.width / 2;
  const mascotCenterY = rect.top + rect.height / 2;

  const deltaX = e.clientX - mascotCenterX;
  const deltaY = e.clientY - mascotCenterY;
  const angle = Math.atan2(deltaY, deltaX);
  const distance = Math.min(5, Math.hypot(deltaX, deltaY) / 20);

  const offsetX = Math.cos(angle) * distance;
  const offsetY = Math.sin(angle) * distance;

  pupilLeft.value = { x: offsetX, y: offsetY };
  pupilRight.value = { x: offsetX, y: offsetY };
};

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
});

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
  "Analyze active screen content 🔍",
  "Search RAG invoices & payments 🧠",
  "What needs my immediate sign-off? ⚡",
];

async function submitPrompt(text?: string) {
  const value = (text ?? input.value).trim();
  if (!value || isStreaming.value) return;
  input.value = "";

  const screenContext = `Active Screen: ${currentScreenLabel.value} (Route: ${route.path})`;
  await send(value, screenContext);

  nextTick(() => {
    scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: "smooth" });
  });
}
</script>

<template>
  <div>
    <!-- Cute Floating Dollar Mascot Trigger Button (Bottom-Right Corner) -->
    <div
      ref="mascotRef"
      @click="isOpen = !isOpen"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-3 cursor-pointer group"
    >
      <!-- Floating Label Nudge -->
      <div class="hidden sm:flex items-center gap-1.5 bg-carbon-900 text-white text-xs font-medium px-3.5 py-2 rounded-full shadow-floating group-hover:scale-105 transition-all">
        <Sparkles class="w-3.5 h-3.5 text-amber-300" />
        <span>Ask Pazy Bot</span>
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>

      <!-- Cute Animated Dollar Mascot SVG with Mouse-Tracking Eyes -->
      <div class="relative w-14 h-14 transition-transform group-hover:scale-110 active:scale-95 drop-shadow-lg">
        <svg
          viewBox="0 0 100 100"
          class="w-full h-full overflow-visible"
        >
          <!-- Dollar Mascot Body Outer Shadow & Stroke -->
          <path
            d="M 50,6 C 36,6 30,16 30,24 C 30,30 35,35 44,38 L 44,42 C 34,44 24,50 24,62 C 24,76 36,84 50,86 L 50,94 C 50,96 52,96 52,94 L 52,86 C 66,84 76,74 76,62 C 76,52 68,46 56,42 L 56,38 C 64,36 70,30 70,22 C 70,10 58,6 50,6 Z"
            fill="#FFCB47"
            stroke="#1A1A1A"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Inner Dollar Curve Accents -->
          <path
            d="M 50,12 C 40,12 36,18 36,24 C 36,30 42,34 50,36 C 60,38 64,44 64,52 C 64,62 54,68 50,68 C 40,68 34,62 34,56"
            fill="none"
            stroke="#1A1A1A"
            stroke-width="4.5"
            stroke-linecap="round"
          />

          <!-- Glossy White Highlights -->
          <path
            d="M 38,14 C 42,10 48,10 50,10"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M 30,54 C 28,60 30,68 34,72"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="3"
            stroke-linecap="round"
          />

          <!-- Cute Blushing Cheeks -->
          <ellipse cx="38" cy="52" rx="4.5" ry="3" fill="#FF5252" opacity="0.6" />
          <ellipse cx="62" cy="52" rx="4.5" ry="3" fill="#FF5252" opacity="0.6" />

          <!-- Interactive Mouse-Tracking Eyes (Left & Right Pupils) -->
          <g transform="translate(38, 44)">
            <circle cx="0" cy="0" r="4.5" fill="#1A1A1A" />
            <circle :cx="pupilLeft.x" :cy="pupilLeft.y" r="2.2" fill="#FFFFFF" />
          </g>
          <g transform="translate(62, 44)">
            <circle cx="0" cy="0" r="4.5" fill="#1A1A1A" />
            <circle :cx="pupilRight.x" :cy="pupilRight.y" r="2.2" fill="#FFFFFF" />
          </g>

          <!-- Cute Smile Mouth -->
          <path
            d="M 47,49 Q 50,52 53,49"
            fill="none"
            stroke="#1A1A1A"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>

    <!-- Cute Floating AI Chat Panel -->
    <div
      v-if="isOpen"
      class="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white border border-carbon-100 rounded-3xl shadow-floating overflow-hidden flex flex-col h-[520px] transition-all duration-300"
    >
      <!-- Panel Header -->
      <div class="bg-amber-100/70 p-4 border-b border-amber-200/60 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-amber-400 border border-carbon-900 flex items-center justify-center font-bold text-carbon-900 text-xs shrink-0 shadow-xs">
            $
          </div>
          <div>
            <h3 class="text-xs font-medium text-carbon-900 flex items-center gap-1.5">
              Pazy Bot (Finance Assistant)
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
            👋 Hi! I'm Pazy Bot! Ask me anything about the content on your screen or query your invoices, vendors, and payments using RAG embeddings.
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
          {{ msg.content || (isStreaming && idx === messages.length - 1 ? 'Pazy Bot is thinking...' : '') }}
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
          placeholder="Ask Pazy Bot about screen content..."
          class="flex-1 bg-cream-50 text-xs text-carbon-900 border border-carbon-200 rounded-full px-4 py-2.5 focus:outline-none focus:border-carbon-900"
        />
        <button
          type="submit"
          :disabled="isStreaming || !input.trim()"
          class="w-9 h-9 rounded-full bg-amber-400 border border-carbon-900 text-carbon-900 flex items-center justify-center hover:bg-amber-300 disabled:opacity-40 transition-all shrink-0 font-bold"
        >
          <Loader2 v-if="isStreaming" class="w-4 h-4 animate-spin" />
          <Send v-else class="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
</template>
