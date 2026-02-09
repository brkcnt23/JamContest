<script setup lang="ts">
import { computed } from 'vue';
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
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>