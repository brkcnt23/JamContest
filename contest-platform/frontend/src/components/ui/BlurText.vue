<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { cn } from '@/utils/cn';

interface Props {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 50,
  animateBy: 'words',
  direction: 'top',
});

const inView = ref(false);
const container = ref<HTMLElement | null>(null);

const segments = computed(() =>
  props.animateBy === 'words' ? props.text.split(' ') : props.text.split('')
);

const palette = [
  'var(--palette-purple)',
  'var(--palette-yellow)',
  'var(--palette-green)',
  'var(--palette-blue)',
  'var(--palette-pink)'
];
const randomColor = palette[Math.floor(Math.random() * palette.length)];
const getSegmentStyle = (index: number) => ({
  display: 'inline-block',
  filter: inView.value ? 'blur(0px)' : 'blur(10px)',
  opacity: inView.value ? 1 : 0,
  color: `hsl(${randomColor})`,
  transform: inView.value
    ? 'translateY(0)'
    : `translateY(${props.direction === 'top' ? '-20px' : '20px'})`,
  transition: `all 0.5s ease-out ${index * props.delay}ms`,
});

let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inView.value = true;
      }
    },
    { threshold: 0.1 }
  );

  if (container.value) {
    observer.observe(container.value);
  }
});

onUnmounted(() => {
  if (observer && container.value) {
    observer.unobserve(container.value);
  }
});
</script>

<template>
  <p ref="container" :class="cn('inline-flex flex-wrap', props.class)">
    <span
      v-for="(segment, i) in segments"
      :key="i"
      :style="getSegmentStyle(i)"
    >
      {{ segment }}{{ animateBy === 'words' && i < segments.length - 1 ? '\u00A0' : '' }}
    </span>
  </p>
</template>