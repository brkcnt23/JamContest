<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils/cn';

interface Props {
  variant?: 'top' | 'above' | 'bottom' | 'below' | 'center';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'top',
});

const variantClasses = {
  top: 'top-0',
  above: '-top-[128px]',
  bottom: 'bottom-0',
  below: '-bottom-[128px]',
  center: 'top-[50%]',
};

const classes = computed(() =>
  cn('absolute w-full', variantClasses[props.variant], props.class)
);

const centerTransform = computed(() =>
  props.variant === 'center' ? '-translate-y-1/2' : ''
);
</script>

<template>
  <div :class="classes">
    <div
      ::class="cn(
        'absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand-foreground)/.25)_10%,_hsla(var(--brand-foreground)/0)_60%)] sm:h-[512px]',
        centerTransform
      )"
    />
    <div
      :class="cn(
        'absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[1.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand)/.15)_10%,_hsla(var(--brand-foreground)/0)_60%)] sm:h-[256px]',
        centerTransform
      )"
    />
  </div>
</template>