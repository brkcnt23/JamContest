<template>
  <div v-if="visible" class="fixed top-6 right-6 z-50">
    <div :class="['px-4 py-3 rounded shadow-lg flex items-center gap-2', toastTypeClass]">
      <slot>{{ message }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'  // ← TEKRAR KONTROL ET

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}>()

const visible = ref(false)
const toastTypeClass = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-600 text-white'
    case 'error': return 'bg-red-600 text-white'
    case 'info': return 'bg-blue-600 text-white'
    case 'warning': return 'bg-yellow-500 text-black'
    default: return 'bg-gray-800 text-white'
  }
})

watch(() => props.message, (val) => {
  if (val) {
    visible.value = true
    setTimeout(() => visible.value = false, props.duration || 3000)
  }
}, { immediate: true })
</script>