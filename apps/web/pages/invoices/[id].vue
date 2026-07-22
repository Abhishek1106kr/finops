<script setup lang="ts">
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

const route = useRoute();
const { apiBase } = useApi();
const { data: invoice, pending } = await useFetch<InvoiceRow>(`${apiBase}/invoices/${route.params.id}`);
</script>

<template>
  <div class="flex flex-col gap-8">
    <NuxtLink to="/invoices" class="text-[13px] text-text-secondary hover:text-text-primary">
      ← Back to invoices
    </NuxtLink>

    <div v-if="pending" class="text-[14px] text-text-muted">Loading…</div>

    <template v-else-if="invoice">
      <h1 class="text-[36px] font-normal tracking-[-0.02em] text-text-primary">
        {{ invoice.invoiceNumber ?? "Processing…" }}
      </h1>

      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div class="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p class="text-[13px] text-text-muted">Status</p>
          <p class="mt-1 text-[15px] font-medium text-text-primary">{{ invoice.status }}</p>
        </div>
        <div class="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p class="text-[13px] text-text-muted">Amount</p>
          <p class="mt-1 text-[15px] font-medium text-text-primary">
            {{ invoice.currency }} {{ invoice.totalAmount.toLocaleString() }}
          </p>
        </div>
        <div class="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p class="text-[13px] text-text-muted">Uploaded</p>
          <p class="mt-1 text-[15px] font-medium text-text-primary">
            {{ new Date(invoice.createdAt).toLocaleDateString() }}
          </p>
        </div>
        <a
          :href="invoice.fileUrl"
          target="_blank"
          rel="noopener"
          class="rounded-lg border border-border-subtle bg-bg-surface p-5 transition-colors hover:bg-bg-secondary"
        >
          <p class="text-[13px] text-text-muted">Source file</p>
          <p class="mt-1 text-[15px] font-medium text-text-primary">View original ↗</p>
        </a>
      </div>
    </template>
  </div>
</template>
