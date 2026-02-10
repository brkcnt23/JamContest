<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '@/utils/cn';

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
});

const variantClasses = {
  default: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90',
  destructive: 'bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive))]/90',
  outline: 'border bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
  secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80',
  ghost: 'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
  link: 'text-[hsl(var(--primary))] underline-offset-4 hover:underline',
};

const sizeClasses = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md gap-1.5 px-3',
  lg: 'h-10 rounded-md px-6',
  icon: 'size-9',
};

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none',
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.class
  )
);

// Pencil cursor and random color on hover
const palette = [
  'var(--palette-purple)',
  'var(--palette-yellow)',
  'var(--palette-green)',
  'var(--palette-blue)',
  'var(--palette-pink)'
];
const buttonColor = ref('');
const setRandomColor = () => {
  const color = palette[Math.floor(Math.random() * palette.length)];
  buttonColor.value = `background: hsl(${color}) !important; color: #222 !important;`;
};
const resetColor = () => {
  buttonColor.value = '';
};
const buttonStyle = computed(() => buttonColor.value);
</script>

<template>
  <button
    :class="classes"
    :style="buttonStyle"
    @mouseenter="setRandomColor"
    @mouseleave="resetColor"
    style="cursor: url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\'><path fill=\'%23222\' d=\'M3 17.25V21h3.75l11.06-11.06-3.75-3.75zm2.92 2.92l-1.17-1.17 9.19-9.19 1.17 1.17zm13.06-13.06a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.34-1.34a1.003 1.003 0 0 0 0-1.42l-2.33-2.33z\'/></svg>') 4 24, pointer;"
  >
    <slot />
  </button>
</template>