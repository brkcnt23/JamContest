<script setup lang="ts">
import { computed } from 'vue';
import { Moon, Sun } from 'lucide-vue-next';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggleDark = useToggle(isDark);

interface ThemeToggleProps {
  className?: string;
}
const props = defineProps<ThemeToggleProps>();
</script>

<template>
  <div
    :class="[
      'flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300',
      isDark ? 'bg-zinc-950 border border-zinc-800' : 'bg-white border border-zinc-200',
      props.className,
    ]"
    role="button"
    tabindex="0"
    @click="toggleDark()"
    @keydown.enter.prevent="toggleDark()"
    @keydown.space.prevent="toggleDark()"
  >
    <div class="flex justify-between items-center w-full">
      <div
        :class="[
          'flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300',
          isDark ? 'translate-x-0 bg-zinc-800' : 'translate-x-8 bg-gray-200',
        ]"
      >
        <Moon v-if="isDark" class="w-4 h-4 text-white" :stroke-width="1.5" />
        <Sun v-else class="w-4 h-4 text-gray-700" :stroke-width="1.5" />
      </div>

      <div
        :class="[
          'flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300',
          isDark ? 'bg-transparent' : '-translate-x-8',
        ]"
      >
        <Sun v-if="isDark" class="w-4 h-4 text-gray-500" :stroke-width="1.5" />
        <Moon v-else class="w-4 h-4 text-black" :stroke-width="1.5" />
      </div>
    </div>
  </div>
</template>