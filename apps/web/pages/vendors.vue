<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Users, ShieldCheck, AlertTriangle, Plus, Search } from "lucide-vue-next";

definePageMeta({ layout: "default" });

interface Vendor {
  id: string;
  name: string;
  gstin: string | null;
  pan: string | null;
  status: string;
  riskScore: number | null;
  blacklisted: boolean;
  createdAt: string;
}

const vendors = ref<Vendor[]>([
  {
    id: "v-001",
    name: "Acme Logistics India Pvt Ltd",
    gstin: "27AABCA1234D1ZP",
    pan: "AABCA1234D",
    status: "verified",
    riskScore: 0.02,
    blacklisted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "v-002",
    name: "CloudScale Software Solutions",
    gstin: "29AADCB9876E1ZQ",
    pan: "AADCB9876E",
    status: "verified",
    riskScore: 0.05,
    blacklisted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "v-003",
    name: "Apex Office Supplies",
    gstin: "07AAACA5555B1Z9",
    pan: "AAACA5555B",
    status: "pending_verification",
    riskScore: 0.28,
    blacklisted: false,
    createdAt: new Date().toISOString(),
  },
]);

const searchQuery = ref("");
const isModalOpen = ref(false);
const newVendor = ref({ name: "", gstin: "", pan: "" });

const addVendor = () => {
  if (!newVendor.value.name) return;
  vendors.value.unshift({
    id: `v-${Date.now()}`,
    name: newVendor.value.name,
    gstin: newVendor.value.gstin || null,
    pan: newVendor.value.pan || null,
    status: "pending_verification",
    riskScore: 0.1,
    blacklisted: false,
    createdAt: new Date().toISOString(),
  });
  newVendor.value = { name: "", gstin: "", pan: "" };
  isModalOpen.value = false;
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-medium tracking-tight text-carbon-900">
          Vendor Intelligence
        </h1>
        <p class="mt-1 text-sm text-carbon-500">
          Real-time risk scoring, GST compliance tracking, and contract intelligence.
        </p>
      </div>
      <button
        @click="isModalOpen = true"
        class="inline-flex items-center justify-center gap-2 bg-carbon-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-carbon-800 transition-all shadow-sm"
      >
        <Plus class="w-4 h-4" />
        Add Vendor
      </button>
    </div>

    <!-- Overview Cards Grid (UI.md Pastel Styles) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-pastel-lavender rounded-3xl p-6 border border-purple-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Active Vendors</span>
          <Users class="w-5 h-5 text-purple-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">{{ vendors.length }}</div>
        <div class="text-xs text-carbon-500">Connected enterprise suppliers</div>
      </div>

      <div class="bg-pastel-sage rounded-3xl p-6 border border-emerald-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">GST Verified</span>
          <ShieldCheck class="w-5 h-5 text-emerald-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">
          {{ vendors.filter(v => v.status === 'verified').length }}
        </div>
        <div class="text-xs text-carbon-500">Validated compliance records</div>
      </div>

      <div class="bg-cream-100 rounded-3xl p-6 border border-carbon-100 space-y-2">
        <div class="flex items-center justify-between text-carbon-600">
          <span class="text-xs font-medium uppercase tracking-wider">Risk Score Avg</span>
          <AlertTriangle class="w-5 h-5 text-amber-600" />
        </div>
        <div class="text-3xl font-medium text-carbon-900">Low (0.08)</div>
        <div class="text-xs text-carbon-500">Fraud & anomaly monitoring active</div>
      </div>
    </div>

    <!-- Vendor Table Container -->
    <div class="bg-white rounded-3xl p-6 border border-carbon-100 shadow-subtle space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div class="relative flex-1 max-w-xs">
          <Search class="w-4 h-4 absolute left-3.5 top-3 text-carbon-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search vendors..."
            class="w-full pl-10 pr-4 py-2 bg-cream-50 text-sm text-carbon-900 rounded-full border border-carbon-200 focus:outline-none focus:border-carbon-900"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-carbon-900">
          <thead>
            <tr class="border-b border-carbon-100 text-xs font-medium text-carbon-500 uppercase tracking-wider">
              <th class="py-3 px-4">Vendor Name</th>
              <th class="py-3 px-4">GSTIN</th>
              <th class="py-3 px-4">PAN</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Risk Level</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-carbon-100">
            <tr v-for="vendor in vendors" :key="vendor.id" class="hover:bg-cream-50 transition-colors">
              <td class="py-4 px-4 font-medium">{{ vendor.name }}</td>
              <td class="py-4 px-4 font-mono text-xs text-carbon-600">{{ vendor.gstin || '—' }}</td>
              <td class="py-4 px-4 font-mono text-xs text-carbon-600">{{ vendor.pan || '—' }}</td>
              <td class="py-4 px-4">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="vendor.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ vendor.status === 'verified' ? 'GST Verified' : 'Pending Verification' }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cream-200 text-carbon-800">
                  Risk: {{ vendor.riskScore ? (vendor.riskScore * 100).toFixed(0) + '%' : '0%' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
