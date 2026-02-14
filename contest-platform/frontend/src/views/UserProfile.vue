<template>
  <div class="user-profile-blank-layout">
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <p class="text-[hsl(var(--muted-foreground))]">Loading profile...</p>
    </div>

    <div v-else-if="error" class="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <p class="text-red-500">{{ error }}</p>
    </div>

    <div v-else-if="profile" class="bg-[hsl(var(--background))]">
      <!-- Edit Button -->
      <div class="max-w-screen-2xl mx-auto px-4 pt-8 flex justify-end" v-if="authStore.user && authStore.user.id === profile.userId">
        <button
          class="px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors font-semibold"
          @click="$router.push(`/user/${profile.userId}/edit`)"
        >
          Edit Profile
        </button>
      </div>

      <!-- Hero Section -->
      <ArtistHero
        :artist-name="profile.displayName"
        :tagline="profile.tagline"
        :description="profile.bio"
        :profile-image="profile.profileImageUrl"
        :gallery-images="profile.galleryImageUrls || []"
        :social-links="profile.socialLinks || {}"
        :portfolio-link="profile.portfolioLink"
        :profile-user-id="profile.userId"
      />

      <!-- Portfolio Grid -->
      <section id="portfolio">
        <FeaturedWorks 
          :works="profile.works" 
          :portfolio-link="profile.portfolioLink" 
          :gallery-images="profile.galleryImageUrls || []" 
        />
      </section>

      <!-- About Section -->
      <section 
        v-if="profile.about" 
        id="about" 
        class="py-24 px-6 bg-[hsl(var(--muted))] scroll-mt-20"
      >
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl font-bold text-[hsl(var(--foreground))] mb-8">About</h2>
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <p class="text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-wrap text-sm">
              {{ profile.about }}
            </p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section 
        v-if="hasContactInfo" 
        id="contact" 
        class="py-24 px-6 bg-[hsl(var(--background))] scroll-mt-20"
      >
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl font-bold text-[hsl(var(--foreground))] mb-12 text-center">Get In Touch</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Email -->
            <a 
              v-if="profile.contactEmail" 
              :href="`mailto:${profile.contactEmail}`"
              class="flex items-center gap-4 p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail class="w-6 h-6 text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">Email</p>
                <p class="font-semibold text-[hsl(var(--foreground))]">Send Message</p>
              </div>
            </a>

            <!-- Instagram -->
            <a 
              v-if="profile.contactInstagram" 
              :href="profile.contactInstagram"
              target="_blank"
              class="flex items-center gap-4 p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Instagram class="w-6 h-6 text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">Instagram</p>
                <p class="font-semibold text-[hsl(var(--foreground))]">Follow</p>
              </div>
            </a>

            <!-- Twitter -->
            <a 
              v-if="profile.contactTwitter" 
              :href="profile.contactTwitter"
              target="_blank"
              class="flex items-center gap-4 p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Twitter class="w-6 h-6 text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">Twitter</p>
                <p class="font-semibold text-[hsl(var(--foreground))]">Connect</p>
              </div>
            </a>

            <!-- Behance -->
            <a 
              v-if="profile.contactBehance" 
              :href="profile.contactBehance"
              target="_blank"
              class="flex items-center gap-4 p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe class="w-6 h-6 text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">Behance</p>
                <p class="font-semibold text-[hsl(var(--foreground))]">View Work</p>
              </div>
            </a>

            <!-- ArtStation -->
            <a 
              v-if="profile.contactArtStation" 
              :href="profile.contactArtStation"
              target="_blank"
              class="flex items-center gap-4 p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette class="w-6 h-6 text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">ArtStation</p>
                <p class="font-semibold text-[hsl(var(--foreground))]">Portfolio</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ArtistHero from '@/components/ui/ArtistHero.vue';
import FeaturedWorks from '@/components/ui/FeaturedWorks.vue';
import { useAuthStore } from '@/stores/auth';
import { Mail, Instagram, Twitter, Globe, Palette } from 'lucide-vue-next';

const authStore = useAuthStore();
const route = useRoute();

type UserProfile = {
  userId: string;
  displayName: string;
  tagline: string;
  bio: string;
  about: string;
  profileImageUrl: string;
  galleryImageUrls: string[];
  portfolioLink?: string;
  contactEmail?: string;
  contactInstagram?: string;
  contactTwitter?: string;
  contactBehance?: string;
  contactArtStation?: string;
  works?: Array<{
    id: number;
    title: string;
    category: string;
    year: string;
    image: string;
    span?: 'large' | 'wide' | 'tall' | 'default';
  }>;
  socialLinks?: { 
    instagram?: string; 
    twitter?: string; 
    email?: string;
  };
};

const profile = ref<UserProfile | null>(null);
const loading = ref(true);
const error = ref('');

const hasContactInfo = computed(() => {
  if (!profile.value) return false;
  return !!(
    profile.value.contactEmail ||
    profile.value.contactInstagram ||
    profile.value.contactTwitter ||
    profile.value.contactBehance ||
    profile.value.contactArtStation
  );
});

onMounted(async () => {
  const userId = route.params.id as string;
  console.log('Fetching user profile for id:', userId);
  try {
    const { data } = await axios.get(`/api/users/${userId}/profile`);
    console.log('Fetched user profile data:', data);
    profile.value = data;
  } catch (e: any) {
    console.error('Error fetching profile:', e);
    error.value = e.response?.data?.message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
});
</script>