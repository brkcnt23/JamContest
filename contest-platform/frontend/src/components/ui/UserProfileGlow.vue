<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isButtonHover = ref(false);

function checkButtonHover(e: MouseEvent) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  isButtonHover.value = !!(el && (el.tagName === 'BUTTON' || el.closest('button')));
}

const glowRef = ref<HTMLElement | null>(null);
const mouseX = ref(150);
const mouseY = ref(150);

function handleMouseMove(e: MouseEvent) {
  const rect = glowRef.value?.getBoundingClientRect();
  if (!rect) return;
  mouseX.value = e.clientX - rect.left;
  mouseY.value = e.clientY - rect.top;
}

onMounted(() => {
  if (glowRef.value) {
    glowRef.value.addEventListener('mousemove', handleMouseMove);
    glowRef.value.addEventListener('mousemove', checkButtonHover);
  }
});

onUnmounted(() => {
  if (glowRef.value) {
    glowRef.value.removeEventListener('mousemove', handleMouseMove);
    glowRef.value.removeEventListener('mousemove', checkButtonHover);
  }
});
</script>

<template>
  <div ref="glowRef" class="relative w-full h-full" style="min-height:400px; cursor: none;">
    <svg
      class="absolute"
      :style="{
        left: mouseX + 'px',
        top: mouseY + 'px',
        width: '28px',
        height: '28px',
        transform: 'translate(-6px, -18px)',
        zIndex: 10,
        pointerEvents: 'none',
        cursor: 'none',
      }"
      viewBox="0 0 24 24"
      fill="none"
      :stroke="isButtonHover ? '#ffb300' : 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
    <slot />
  </div>
</template>

<style scoped>
.relative *, .relative *:hover, .relative *:active, .relative *:focus {
  cursor: none !important;
}
button, button:hover, button:active, button:focus {
  cursor: none !important;
}
</style>
