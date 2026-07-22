<script setup lang="ts">
import { Upload, FileText } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface InvoiceRow {
  id: string;
  status: string;
  invoiceNumber: string | null;
  totalAmount: number;
  currency: string;
  fileUrl: string;
  createdAt: string;
}

const { apiBase } = useApi();
const { data: invoices, refresh, pending } = await useFetch<InvoiceRow[]>(`${apiBase}/invoices`);
const uploading = ref(false);

const statusColor: Record<string, string> = {
  uploaded: "bg-status-warning",
  parsed: "bg-status-warning",
  matched: "bg-status-success",
  approved: "bg-status-success",
  paid: "bg-status-success",
  flagged: "bg-status-error",
};

async function onUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploading.value = true;
  try {
    const form = new FormData();
    form.append("file", file);
    await $fetch(`${apiBase}/invoices`, { method: "POST", body: form });
    await refresh();
  } finally {
    uploading.value = false;
    input.value = "";
  }
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="flex items-center justify-between">
      <h1 class="text-[36px] font-normal tracking-[-0.02em] text-text-primary">Invoices</h1>
      <label class="btn-pill-primary cursor-pointer">
        <Upload class="h-4 w-4" :stroke-width="1.5" />
        {{ uploading ? "Uploading…" : "Upload invoice" }}
        <input type="file" class="hidden" accept="application/pdf,image/*" @change="onUpload" />
      </label>
    </div>

    <div v-if="pending" class="text-[14px] text-text-muted">Loading invoices…</div>

    <div v-else-if="!invoices?.length" class="hero-card-lavender flex flex-col items-start gap-3 py-16">
      <FileText class="h-6 w-6 text-text-primary" :stroke-width="1.5" />
      <p class="text-[20px] font-medium tracking-[-0.01em] text-text-primary">No invoices yet</p>
      <p class="text-[14px] text-text-secondary">Upload one to watch the Invoice Agent parse and match it.</p>
    </div>

    <div v-else class="flex flex-col gap-3">
      <NuxtLink
        v-for="inv in invoices"
        :key="inv.id"
        :to="`/invoices/${inv.id}`"
        class="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-surface px-6 py-4 shadow-subtle transition-transform duration-fast ease-fast hover:-translate-y-px"
      >
        <div class="flex items-center gap-4">
          <span class="status-dot" :class="statusColor[inv.status] ?? 'bg-text-muted'" />
          <div>
            <p class="text-[15px] font-medium text-text-primary">
              {{ inv.invoiceNumber ?? "Processing…" }}
            </p>
            <p class="text-[13px] text-text-muted">{{ inv.status }}</p>
          </div>
        </div>
        <p class="text-[15px] font-medium text-text-primary">
          {{ inv.currency }} {{ inv.totalAmount.toLocaleString() }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
