<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Sparkles, Send, Loader2 } from "lucide-vue-next";
import Card from "~/components/ui/Card.vue";
import Button from "~/components/ui/Button.vue";
import { useCopilotChat } from "~/composables/useCopilotChat";

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const { messages, isStreaming, error, send } = useCopilotChat();
const input = ref("");
const scrollRef = ref<HTMLElement | null>(null);

const suggestions = [
  "What's our cash runway right now?",
  "Which invoices need my attention?",
  "Summarize this week's vendor risk",
];

async function submit(text?: string) {
  const value = (text ?? input.value).trim();
  if (!value || isStreaming.value) return;
  input.value = "";
  await send(value);
  nextTick(() => scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: "smooth" }));
}
</script>

<template>
  <Card padding="none" class="flex flex-col overflow-hidden" :class="compact ? 'h-[420px]' : 'h-[600px]'">
    <div class="flex items-center gap-2 border-b border-carbon-100 px-5 py-4">
      <Sparkles class="h-4 w-4 text-carbon-900" />
      <span class="text-sm font-medium text-carbon-900">Finance Brain</span>
    </div>

    <div ref="scrollRef" class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
      <div v-if="!messages.length" class="flex flex-col gap-2">
        <p class="text-sm text-carbon-500">Ask about cash flow, risk, or what needs your attention.</p>
        <button
          v-for="s in suggestions"
          :key="s"
          class="w-fit rounded-full border border-carbon-100 bg-cream-50 px-3 py-1.5 text-left text-xs text-carbon-700 transition-colors hover:bg-cream-100"
          @click="submit(s)"
        >
          {{ s }}
        </button>
      </div>

      <div
        v-for="(m, i) in messages"
        :key="i"
        class="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        :class="m.role === 'user' ? 'ml-auto bg-carbon-900 text-white' : 'bg-cream-100 text-carbon-900'"
      >
        {{ m.content || (isStreaming && i === messages.length - 1 ? "…" : "") }}
      </div>

      <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
    </div>

    <form class="flex items-center gap-2 border-t border-carbon-100 p-3" @submit.prevent="submit()">
      <input
        v-model="input"
        type="text"
        placeholder="Ask the Finance Brain…"
        class="flex-1 rounded-full border border-carbon-200 bg-cream-50 px-4 py-2 text-sm text-carbon-900 focus:outline-none focus:border-carbon-900"
      />
      <Button type="submit" size="icon" :disabled="isStreaming || !input.trim()">
        <Loader2 v-if="isStreaming" class="h-4 w-4 animate-spin" />
        <Send v-else class="h-4 w-4" />
      </Button>
    </form>
  </Card>
</template>
