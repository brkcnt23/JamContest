
<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { useTheme } from '@/stores/theme';
import { Menu, X, Instagram, Twitter, Mail, ArrowRight } from 'lucide-vue-next';
import Badge from './Badge.vue';
import Button from './Button.vue';
import BlurText from './BlurText.vue';
import Glow from './Glow.vue';
import { Sun, Moon } from 'lucide-vue-next';

import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

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
  portfolioLink?: string;
  profileUserId?: string;
}
const { theme, toggleTheme } = useTheme();
const overlayActive = ref(false);
const animationKey = ref(0);
let overlayTimeout: ReturnType<typeof setTimeout> | null = null;
let lastTheme = theme.value;
let firstLoad = true;

function playOverlayOnce() {
  if (overlayActive.value) return;
  overlayActive.value = true;
  if (overlayTimeout) clearTimeout(overlayTimeout);
  overlayTimeout = setTimeout(() => {
    overlayActive.value = false;
    animationKey.value++;
  }, 600);
}
function openPortfolio() {
  if (props.portfolioLink) {
    window.open(props.portfolioLink, '_blank');
  }
}
onMounted(() => {
  playOverlayOnce();
  firstLoad = false;
  lastTheme = theme.value;
});

watch(theme, (newTheme, oldTheme) => {
  if (firstLoad) return;
  if (newTheme !== oldTheme) {
    playOverlayOnce();
    lastTheme = newTheme;
  }
});
function debugToggleTheme() {
  toggleTheme();
}
const props = withDefaults(defineProps<Props>(), {
  socialLinks: () => ({}),
  badgeText: 'Available for commissions',
  portfolioLink: '',
  profileUserId: '',
});

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

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
  <div class="relative min-h-screen overflow-hidden">
    <!-- White overlay for theme change -->
    <transition name="overlay-fade">
      <div v-if="overlayActive" class="fixed left-0 top-0 w-full h-full z-[9999] pointer-events-none" style="background: white; animation: overlay-slide-down 0.6s cubic-bezier(.7,0,.3,1);"></div>
    </transition>
    <!-- Header -->
      <header
        class="custom-header fixed top-0 left-0 right-0 z-50 px-4 bg-[hsl(var(--background))]/80 backdrop-blur-sm flex items-center justify-center"
        style="height: 72px; min-height: 0;">
        <nav class="flex flex-row items-center justify-between w-full max-w-screen-2xl mx-auto h-full">
        <div class="flex items-center h-[56px]">
          <button type="button"
            class="p-2 transition-colors duration-300 z-50 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            @click="isMenuOpen = !isMenuOpen" aria-label="Menu">
            <X v-if="isMenuOpen" class="w-6 h-6" />
            <Menu v-else class="w-6 h-6" />
          </button>
        </div>
        <!-- Center: Logo -->
        <div class="flex items-center justify-center h-[56px] relative">
          <a href="/" class="focus:outline-none cursor-pencil flex items-center justify-center">
            <img :src="theme === 'dark' ? '/images/jamcontest_logo_white_for_dark.png' : '/images/logo-JC.png'" alt="JamContest Logo"
              class="h-36 w-auto mx-auto transition-transform hover:scale-105 active:scale-95 cursor-pencil"
              style="max-height: 120px;" />
          </a>
        </div>
        <!-- Right: Socials + Theme -->
        <div class="flex items-center justify-end gap-4 h-[56px]">
          <a v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank"
            class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <Instagram class="w-5 h-5" />
          </a>
          <a v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank"
            class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <Twitter class="w-5 h-5" />
          </a>
          <a v-if="socialLinks.email" :href="socialLinks.email"
            class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <Mail class="w-5 h-5" />
          </a>
          <!-- Theme toggle -->
          <button @click="debugToggleTheme" class="ml-2 p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Toggle theme">
            <Sun v-if="theme === 'light'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </div>
      </nav>

      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-5"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-5">
        <div v-if="isMenuOpen"
          class="absolute top-full left-0 right-0 bg-[hsl(var(--background))]/95 backdrop-blur-md border-t border-[hsl(var(--border))] p-8">
          <div class="max-w-screen-2xl mx-auto">
            <a v-for="(item, index) in menuItems" :key="item.label" :href="item.href"
              class="block text-2xl font-bold py-3 hover:text-[hsl(var(--brand))] transition-colors"
              :style="{ transitionDelay: `${index * 100}ms` }" @click="isMenuOpen = false">
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

            <div v-if="authStore.user && props.profileUserId && authStore.user.id === props.profileUserId" class="mb-2">
              <Button
                size="sm"
                variant="outline"
                class="font-semibold"
                @click="() => router.push(`/user/${props.profileUserId}/edit`)"
              >
                Edit Profile
              </Button>
            </div>
            <Badge :key="animationKey + '-badge'" variant="outline" class="animate-appear opacity-0">
              <span class="text-[hsl(var(--muted-foreground))]">{{ badgeText }}</span>
            </Badge>

            <div>
              <BlurText :key="animationKey + '-blur'" :text="artistName" :delay="80" animate-by="letters" direction="top"
                class="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight" style="color: hsl(var(--brand))" />
            </div>

            <div :key="animationKey + '-desc'" class="space-y-4 animate-appear opacity-0 delay-300">
              <h2 class="text-2xl md:text-3xl font-semibold text-[hsl(var(--foreground))]">
                {{ tagline }}
              </h2>
              <p class="text-lg text-[hsl(var(--muted-foreground))] max-w-xl">
                {{ description }}
              </p>
            </div>

            <div :key="animationKey + '-btns'" class="flex gap-4 animate-appear opacity-0 delay-500">
              <Button
                v-if="props.portfolioLink"
                size="lg"
                class="group"
                @click="openPortfolio"
              >
                View Portfolio
                <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
              <Button
                v-if="authStore.user && props.profileUserId && authStore.user.id === props.profileUserId"
                size="lg"
                variant="outline"
                @click="() => router.push(`/user/${props.profileUserId}/edit`)"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <!-- Right: Image Gallery -->
          <div :key="animationKey + '-gallery'" class="relative h-[600px] animate-appear opacity-0 delay-700">
            <!-- Profile Image - Center -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div class="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-[hsl(var(--background))]">
                <img :src="profileImage" alt="Artist" class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Gallery Images - Floating Around -->
            <div v-for="(img, index) in galleryImages.slice(0, 5)" :key="animationKey + '-img-' + index"
              class="absolute w-40 h-48 rounded-xl overflow-hidden shadow-lg animate-float-up" :style="{
                left: positions[index].left,
                right: positions[index].right,
                top: positions[index].top,
                bottom: positions[index].bottom,
                animationDelay: positions[index].delay,
              }">
              <img :src="img" :alt="`Gallery ${index + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <!-- Glow Effect -->
      <Glow :key="animationKey + '-glow'" variant="center" class="animate-appear opacity-0 delay-1000" />
    </main>

    <!-- Scroll Indicator -->
    <div :key="animationKey + '-scroll'" class="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-appear opacity-0 delay-1000">
      <p class="text-sm text-[hsl(var(--muted-foreground))] mb-2">Scroll to explore</p>
      <div
        class="w-6 h-10 border-2 border-[hsl(var(--muted-foreground))] rounded-full mx-auto flex items-start justify-center p-2">
        <div class="w-1 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-bounce" />
      </div>
    </div>
  </div>
</template>
<style>
.custom-header {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 50;
  height: 72px;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsla(var(--background), 0.8);
  backdrop-filter: blur(8px);
}
.custom-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-bottom: 1.5px solid hsl(var(--border));
  top: 72px;
  z-index: 51;
}

.cursor-pencil {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%23222" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75zm2.92 2.92l-1.17-1.17 9.19-9.19 1.17 1.17zm13.06-13.06a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.34-1.34a1.003 1.003 0 0 0 0-1.42l-2.33-2.33z"/></svg>') 4 24, pointer !important;
}
@keyframes overlay-slide-down {
  0% {
    opacity: 0.9;
    transform: translateY(-100%);
  }
  80% {
    opacity: 1;
    transform: translateY(8%);
  }
  100% {
    opacity: 0;
    transform: translateY(0);
  }
}
.overlay-fade-enter-active, .overlay-fade-leave-active {
  transition: opacity 0.6s cubic-bezier(.7,0,.3,1);
}
.overlay-fade-enter-from, .overlay-fade-leave-to {
  opacity: 0;
}
.overlay-fade-enter-to, .overlay-fade-leave-from {
  opacity: 1;
}
</style>