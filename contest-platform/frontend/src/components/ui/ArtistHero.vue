<script setup lang="ts">
import { ref } from 'vue';
import { Menu, X, Instagram, Twitter, Mail, ArrowRight } from 'lucide-vue-next';
import Badge from './Badge.vue';
import Button from './Button.vue';
import BlurText from './BlurText.vue';
import Glow from './Glow.vue';

interface Props {
  artistName: string;
  tagline: string;
  description: string;
  profileImage: string;
  galleryImages: string[];
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    email?: string;
  };
  badgeText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  socialLinks: () => ({}),
  badgeText: 'Available for commissions',
});

const isMenuOpen = ref(false);

const positions = [
  { left: '10%', top: '10%', delay: '-1s' },
  { right: '15%', top: '5%', delay: '-2.5s' },
  { right: '5%', bottom: '20%', delay: '-3.5s' },
  { left: '5%', bottom: '15%', delay: '-4.8s' },
  { left: '15%', top: '45%', delay: '-6s' },
];

const menuItems = [
  { label: 'HOME', href: '/' },
  { label: 'PORTFOLIO', href: '#portfolio' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
];
</script>

<template>
  <div class="relative min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-[hsl(var(--background))]/80 backdrop-blur-sm">
      <nav class="flex items-center justify-between max-w-screen-2xl mx-auto">
        <button
          type="button"
          class="p-2 transition-colors duration-300 z-50 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          @click="isMenuOpen = !isMenuOpen"
        >
          <X v-if="isMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>

        <div class="flex justify-center items-center w-full">
          <a href="/" class="focus:outline-none">
            <img src="/images/logo-JC.png" alt="JamContest Logo" class="h-48 w-auto mx-auto cursor-pointer transition-transform hover:scale-105 active:scale-95" />
          </a>
        </div>

        <div class="flex gap-4">
          <a
            v-if="socialLinks.instagram"
            :href="socialLinks.instagram"
            target="_blank"
            class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <Instagram class="w-5 h-5" />
          </a>
          <a
            v-if="socialLinks.twitter"
            :href="socialLinks.twitter"
            target="_blank"
            class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <Twitter class="w-5 h-5" />
          </a>
          <a
            v-if="socialLinks.email"
            :href="socialLinks.email"
            class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <Mail class="w-5 h-5" />
          </a>
        </div>
      </nav>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-5"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-5"
      >
        <div
          v-if="isMenuOpen"
          class="absolute top-full left-0 right-0 bg-[hsl(var(--background))]/95 backdrop-blur-md border-t border-[hsl(var(--border))] p-8"
        >
          <div class="max-w-screen-2xl mx-auto">
            <a
              v-for="(item, index) in menuItems"
              :key="item.label"
              :href="item.href"
              class="block text-2xl font-bold py-3 hover:text-[hsl(var(--brand))] transition-colors"
              :style="{ transitionDelay: `${index * 100}ms` }"
              @click="isMenuOpen = false"
            >
              {{ item.label }}
            </a>
          </div>
        </div>
      </transition>
    </header>

    <!-- Hero Content -->
    <main class="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
      <div class="max-w-screen-2xl mx-auto w-full">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Text Content -->
          <div class="space-y-8">
            <Badge variant="outline" class="animate-appear opacity-0">
              <span class="text-[hsl(var(--muted-foreground))]">{{ badgeText }}</span>
            </Badge>

            <div>
              <BlurText
                :text="artistName"
                :delay="80"
                animate-by="letters"
                direction="top"
                class="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight"
                style="color: hsl(var(--brand))"
              />
            </div>

            <div class="space-y-4 animate-appear opacity-0 delay-300">
              <h2 class="text-2xl md:text-3xl font-semibold text-[hsl(var(--foreground))]">
                {{ tagline }}
              </h2>
              <p class="text-lg text-[hsl(var(--muted-foreground))] max-w-xl">
                {{ description }}
              </p>
            </div>

            <div class="flex gap-4 animate-appear opacity-0 delay-500">
              <Button size="lg" class="group">
                View Portfolio
                <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
            </div>
          </div>

          <!-- Right: Image Gallery -->
          <div class="relative h-[600px] animate-appear opacity-0 delay-700">
            <!-- Profile Image - Center -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div class="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-[hsl(var(--background))]">
                <img :src="profileImage" alt="Artist" class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Gallery Images - Floating Around -->
            <div
              v-for="(img, index) in galleryImages.slice(0, 5)"
              :key="index"
              class="absolute w-40 h-48 rounded-xl overflow-hidden shadow-lg animate-float-up"
              :style="{
                left: positions[index].left,
                right: positions[index].right,
                top: positions[index].top,
                bottom: positions[index].bottom,
                animationDelay: positions[index].delay,
              }"
            >
              <img :src="img" :alt="`Gallery ${index + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <!-- Glow Effect -->
      <Glow variant="center" class="animate-appear opacity-0 delay-1000" />
    </main>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-appear opacity-0 delay-1000">
      <p class="text-sm text-[hsl(var(--muted-foreground))] mb-2">Scroll to explore</p>
      <div class="w-6 h-10 border-2 border-[hsl(var(--muted-foreground))] rounded-full mx-auto flex items-start justify-center p-2">
        <div class="w-1 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-bounce" />
      </div>
    </div>
  </div>
</template>