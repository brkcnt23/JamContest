<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils/cn';

interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const variantClasses = {
  default: 'border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
  secondary: 'border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
  destructive: 'border-transparent bg-[hsl(var(--destructive))] text-white',
  outline: 'text-[hsl(var(--foreground))]',
};

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden',
    variantClasses[props.variant],
    props.class
  )
);
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>