<script setup lang="ts">
import { ref } from "vue";
import { PieChart, FileCheck, DollarSign, Layers, Plus } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface BudgetItem {
  id: string;
  department: string;
  fiscalPeriod: string;
  allocated: number;
  spent: number;
  thresholdPct: number;
  poCount: number;
}

const budgets = ref<BudgetItem[]>([
  {
    id: "b-01",
    department: "Engineering",
    fiscalPeriod: "2026-Q3",
    allocated: 10000000,
    spent: 2450000,
    thresholdPct: 0.9,
    poCount: 14,
  },
  {
    id: "b-02",
    department: "Operations",
    fiscalPeriod: "2026-Q3",
    allocated: 5000000,
    spent: 1250000,
    thresholdPct: 0.85,
    poCount: 8,
  },
  {
    id: "b-03",
    department: "Marketing",
    fiscalPeriod: "2026-Q3",
    allocated: 3500000,
    spent: 2100000,
    thresholdPct: 0.8,
    poCount: 6,
  },
]);
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
          Departmental Budgets & POs
        </h1>
        <p class="mt-1 text-sm text-carbon-500">
          Real-time fiscal period allocation, 3-way matching engine, and purchase order tracking.
        </p>
      </div>
    </div>

    <!-- Overview Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Total Allocated</div>
        <div class="text-3xl font-medium text-carbon-900">
          ₹{{ budgets.reduce((acc, b) => acc + b.allocated, 0).toLocaleString('en-IN') }}
        </div>
        <div class="text-xs text-carbon-500">Fiscal Period 2026-Q3</div>
      </div>

      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Spent to Date</div>
        <div class="text-3xl font-medium text-carbon-900">
          ₹{{ budgets.reduce((acc, b) => acc + b.spent, 0).toLocaleString('en-IN') }}
        </div>
        <div class="text-xs text-carbon-500">31.3% Average budget utilization</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="text-xs font-medium text-carbon-600 uppercase tracking-wider">Active POs</div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ budgets.reduce((acc, b) => acc + b.poCount, 0) }} Orders
        </div>
        <div class="text-xs text-carbon-500">Linked Purchase Orders</div>
      </div>
    </div>

    <!-- Budget Breakdown List -->
    <div class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle space-y-6">
      <h2 class="text-lg font-medium text-carbon-900">Department Allocations</h2>

      <div class="space-y-6">
        <div v-for="item in budgets" :key="item.id" class="p-5 rounded-2xl bg-cream-50 border border-carbon-100 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-carbon-900">{{ item.department }}</h3>
              <p class="text-xs text-carbon-500 font-mono">{{ item.fiscalPeriod }} • {{ item.poCount }} Purchase Orders</p>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-carbon-900">
                ₹{{ item.spent.toLocaleString('en-IN') }} / ₹{{ item.allocated.toLocaleString('en-IN') }}
              </div>
              <div class="text-xs text-carbon-500">
                {{ ((item.spent / item.allocated) * 100).toFixed(1) }}% Used
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="(item.spent / item.allocated) > item.thresholdPct ? 'bg-amber-500' : 'bg-emerald-500'"
              :style="{ width: `${(item.spent / item.allocated) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
