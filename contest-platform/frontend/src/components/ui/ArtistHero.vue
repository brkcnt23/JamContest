<script setup lang="ts">
import { ref } from 'vue';
import { Menu, X, Instagram, Twitter, Mail, ArrowRight } from 'lucide-vue-next';

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
    <div class="relative min-h-screen bg-background text-foreground overflow-hidden">
        <!-- Header -->
        <header class="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-background/80 backdrop-blur-sm">
            <nav class="flex items-center justify-between max-w-screen-2xl mx-auto">
                <button type="button"
                    class="p-2 transition-colors duration-300 z-50 text-gray-500 hover:text-foreground"
                    @click="isMenuOpen = !isMenuOpen">
                    <X v-if="isMenuOpen" class="w-6 h-6" />
                    <Menu v-else class="w-6 h-6" />
                </button>

                <div class="text-2xl font-bold">SM</div>

                <div class="flex gap-4">
                    <a v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank"
                        class="text-gray-500 hover:text-foreground">
                        <Instagram class="w-5 h-5" />
                    </a>
                    <a v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank"
                        class="text-gray-500 hover:text-foreground">
                        <Twitter class="w-5 h-5" />
                    </a>
                    <a v-if="socialLinks.email" :href="socialLinks.email" class="text-gray-500 hover:text-foreground">
                        <Mail class="w-5 h-5" />
                    </a>
                </div>
            </nav>

            <div v-if="isMenuOpen"
                class="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-t border-gray-200 p-8">
                <div class="max-w-screen-2xl mx-auto">
                    <a
                        v-for="item in menuItems"
                        :key="item.label"
                        :href="item.href"
                        class="block text-2xl font-bold py-3 hover:text-primary transition-colors"
                        @click="isMenuOpen = false"
                        >
                        {{ item.label }}
                    </a>
                </div>
            </div>
        </header>

        <!-- Hero Content -->
        <main class="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
            <div class="max-w-screen-2xl mx-auto w-full">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <!-- Left -->
                    <div class="space-y-8">
                        <div
                            class="inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium animate-appear opacity-0">
                            <span class="text-gray-600">{{ badgeText }}</span>
                        </div>

                        <h1
                            class="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight animate-appear opacity-0 delay-100">
                            {{ artistName }}
                        </h1>

                        <div class="space-y-4 animate-appear opacity-0 delay-300">
                            <h2 class="text-2xl md:text-3xl font-semibold">{{ tagline }}</h2>
                            <p class="text-lg text-gray-600 max-w-xl">{{ description }}</p>
                        </div>

                        <div class="flex gap-4 animate-appear opacity-0 delay-500">
                            <button
                                class="h-10 px-6 rounded-md bg-primary text-white inline-flex items-center gap-2 hover:bg-primary/90">
                                View Portfolio
                                <ArrowRight class="h-4 w-4" />
                            </button>
                            <button class="h-10 px-6 rounded-md border bg-background hover:bg-gray-50">
                                Get in Touch
                            </button>
                        </div>
                    </div>

                    <!-- Right -->
                    <div class="relative h-[600px] animate-appear opacity-0 delay-700">
                        <!-- Profile Center -->
                        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div class="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-background">
                                <img :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
                            </div>
                        </div>

                        <!-- Floating Gallery -->
                        <div v-for="(img, idx) in galleryImages.slice(0, 5)" :key="idx"
                            class="absolute w-40 h-48 rounded-xl overflow-hidden shadow-lg animate-float-up" :style="{
                                left: positions[idx].left,
                                right: positions[idx].right,
                                top: positions[idx].top,
                                bottom: positions[idx].bottom,
                                animationDelay: positions[idx].delay,
                            }">
                            <img :src="img" :alt="`Gallery ${idx + 1}`" class="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scroll Indicator -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p class="text-sm text-gray-500 mb-2">Scroll to explore</p>
                <div class="w-6 h-10 border-2 border-gray-400 rounded-full mx-auto flex items-start justify-center p-2">
                    <div class="w-1 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
            </div>
        </main>
    </div>
</template>
<style>
            @keyframes float-up {

                0%,
                100% {
                    transform: translateY(0px);
                }

                50% {
                    transform: translateY(-15px);
                }
            }

            .animate-float-up {
                animation: float-up 6s ease-in-out infinite;
            }

            @keyframes appear {
                0% {
                    opacity: 0;
                    transform: translateY(10px);
                }

                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .animate-appear {
                animation: appear 0.5s ease-out forwards;
            }

            .delay-100 {
                animation-delay: 100ms;
            }

            .delay-300 {
                animation-delay: 300ms;
            }

            .delay-500 {
                animation-delay: 500ms;
            }

            .delay-700 {
                animation-delay: 700ms;
            }

            .delay-1000 {
                animation-delay: 1000ms;
            }
        </style>