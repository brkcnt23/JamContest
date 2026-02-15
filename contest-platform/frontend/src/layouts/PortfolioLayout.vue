<script setup lang="ts">
// Minimal layout for portfolio/public pages - no sidebar
</script>

<template>
  <div class="portfolio-layout">
    <slot />
  </div>
</template>

<style scoped>
.portfolio-layout {
  min-height: 100vh;
  background: hsl(var(--background));
}
</style>