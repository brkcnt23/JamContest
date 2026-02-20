<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import ArtistHero from '@/components/ui/ArtistHero.vue';
import FeaturedWorks from '@/components/ui/FeaturedWorks.vue';
import ImageLightbox from '@/components/ui/ImageLightbox.vue'; // YENİ

const route = useRoute();
const authStore = useAuthStore();

const userId = computed(() => String(route.params.id));

interface GalleryArtwork {
  title: string;
  url: string;
}

interface Profile {
  userId: string;
  displayName: string;
  tagline: string;
  bio: string;
  about: string;
  profileImageUrl: string;
  portfolioLink: string;
  galleryArtworks: GalleryArtwork[]; // YENİ
  contactEmail?: string;
  contactInstagram?: string;
  contactTwitter?: string;
  contactBehance?: string;
  contactArtStation?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    behance?: string;
    artstation?: string;
  };
  works?: any[];
}

const profile = ref<Profile | null>(null);
const loading = ref(false);
const error = ref('');

// Lightbox state
const lightboxOpen = ref(false);
const lightboxImage = ref('');
const lightboxTitle = ref('');

const openLightbox = (artwork: GalleryArtwork) => {
  lightboxImage.value = artwork.url;
  lightboxTitle.value = artwork.title;
  lightboxOpen.value = true;
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  lightboxImage.value = '';
  lightboxTitle.value = '';
};

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`/api/users/${userId.value}/profile`);
    
    profile.value = {
      ...data,
      socialLinks: {
        instagram: data.contactInstagram,
        twitter: data.contactTwitter,
        behance: data.contactBehance,
        artstation: data.contactArtStation,
      },
      works: [], // Mock - gerçekte API'den gelecek
    };
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
});
</script>

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
        :gallery-images="profile.galleryArtworks.map(a => a.url)" 
        :social-links="profile.socialLinks || {}"
        :portfolio-link="profile.portfolioLink"
        :profile-user-id="profile.userId"
      />

      <!-- Portfolio Grid - WITH LIGHTBOX -->
      <section id="portfolio" class="py-24 px-6 bg-[hsl(var(--background))] scroll-mt-20">
        <div class="max-w-screen-2xl mx-auto">
          <h2 class="text-4xl font-bold mb-12 text-center">Portfolio</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="(artwork, idx) in profile.galleryArtworks" 
              :key="idx"
              class="portfolio-item"
              @click="openLightbox(artwork)"
            >
              <img 
                :src="artwork.url" 
                :alt="artwork.title"
                class="portfolio-image"
              />
              <div class="portfolio-overlay">
                <h3 class="portfolio-title">{{ artwork.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section 
        v-if="profile.about" 
        id="about" 
        class="py-24 px-6 bg-[hsl(var(--muted))] scroll-mt-20"
      >
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl font-bold mb-8 text-center">About</h2>
          <div class="prose prose-lg max-w-none text-[hsl(var(--foreground))]">
            <p class="whitespace-pre-line">{{ profile.about }}</p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section 
        id="contact" 
        class="py-24 px-6 bg-[hsl(var(--background))] scroll-mt-20"
      >
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl font-bold mb-8">Get in Touch</h2>
          
          <div class="flex flex-wrap justify-center gap-6 mt-8">
            <a 
              v-if="profile.contactEmail"
              :href="`mailto:${profile.contactEmail}`"
              class="contact-link"
            >
              Email
            </a>
            <a 
              v-if="profile.contactInstagram"
              :href="`https://instagram.com/${profile.contactInstagram.replace('@', '')}`"
              target="_blank"
              class="contact-link"
            >
              Instagram
            </a>
            <a 
              v-if="profile.contactTwitter"
              :href="`https://twitter.com/${profile.contactTwitter.replace('@', '')}`"
              target="_blank"
              class="contact-link"
            >
              Twitter
            </a>
            <a 
              v-if="profile.contactBehance"
              :href="profile.contactBehance"
              target="_blank"
              class="contact-link"
            >
              Behance
            </a>
            <a 
              v-if="profile.contactArtStation"
              :href="profile.contactArtStation"
              target="_blank"
              class="contact-link"
            >
              ArtStation
            </a>
          </div>
        </div>
      </section>
    </div>

    <!-- Lightbox Modal -->
    <ImageLightbox
      v-if="lightboxOpen"
      :image-url="lightboxImage"
      :image-title="lightboxTitle"
      @close="closeLightbox"
    />
  </div>
</template>

<style scoped>
.portfolio-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.portfolio-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.portfolio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.portfolio-item:hover .portfolio-image {
  transform: scale(1.05);
}

.portfolio-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.portfolio-item:hover .portfolio-overlay {
  opacity: 1;
}

.portfolio-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.contact-link {
  @apply px-6 py-3 rounded-lg bg-[hsl(var(--brand))] text-white font-semibold hover:bg-[hsl(var(--brand))]/90 transition-colors;
}
</style>