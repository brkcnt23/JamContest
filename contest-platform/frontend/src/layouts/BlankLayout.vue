<script setup lang="ts">
</script>

<template>
  <div class="blank-layout">
    <slot />
  </div>
</template>

<style scoped>
.blank-layout {
  min-height: 100vh;
  background: hsl(var(--background));
}
</style>