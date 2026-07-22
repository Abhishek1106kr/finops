<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>

<template>
  <div class="hero-card-lavender flex flex-col items-start gap-3 py-20">
    <h1 class="text-[36px] font-normal tracking-[-0.02em] text-text-primary">{{ title }}</h1>
    <p class="max-w-md text-[15px] text-text-secondary">{{ description }}</p>
  </div>
</template>
