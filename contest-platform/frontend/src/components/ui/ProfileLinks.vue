<script setup lang="ts">
import { Globe, Instagram, Twitter, Github, Linkedin, Youtube, Mail } from 'lucide-vue-next';

type LinkItem = { label: string; url: string; icon?: string };

defineProps<{ links: LinkItem[] }>();

const iconMap: Record<string, any> = {
  website: Globe,
  instagram: Instagram,
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  mail: Mail,
};
</script>

<template>
  <section class="max-w-screen-2xl mx-auto px-6 pb-24" id="contact">
    <h3 class="text-2xl font-bold mb-6">Links</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a
        v-for="(link, i) in links"
        :key="i"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 rounded-xl border bg-white p-4 hover:bg-gray-50 transition-colors"
      >
        <component :is="link.icon ? iconMap[link.icon] : Globe" class="w-5 h-5 text-gray-500" />
        <div class="min-w-0">
          <div class="font-medium truncate">{{ link.label }}</div>
          <div class="text-sm text-gray-500 truncate">{{ link.url }}</div>
        </div>
      </a>
    </div>
  </section>
</template>