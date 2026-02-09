<script setup lang="ts">
defineProps<{ images: string[] }>();
</script>

<template>
  <section class="max-w-screen-2xl mx-auto px-6 py-16" id="portfolio">
    <div class="mb-8">
      <h2 class="text-3xl font-bold">Gallery</h2>
      <p class="text-gray-600">Selected works</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(img, i) in images.slice(0, 5)" :key="i" class="rounded-xl overflow-hidden bg-gray-100 aspect-[4/5]">
        <img :src="img" :alt="`Work ${i + 1}`" class="w-full h-full object-cover" />
      </div>
    </div>
  </section>
</template>