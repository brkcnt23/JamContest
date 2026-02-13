
<template>
  <div class="user-profile-blank-layout">
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <p class="text-[hsl(var(--muted-foreground))]">Loading profile...</p>
    </div>

    <div v-else-if="error" class="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <p class="text-red-500">{{ error }}</p>
    </div>

    <div v-else-if="profile" class="bg-[hsl(var(--background))]">
      <div class="max-w-screen-2xl mx-auto px-4 pt-8 flex justify-end" v-if="authStore.user && authStore.user.id === profile.userId">
        <button
          class="px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors font-semibold"
          @click="$router.push(`/user/${profile.userId}/edit`)"
        >
          Edit Profile
        </button>
      </div>
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
      <FeaturedWorks :works="profile.works" :portfolio-link="profile.portfolioLink" :gallery-images="profile.galleryImageUrls || []" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ArtistHero from '@/components/ui/ArtistHero.vue';
import FeaturedWorks from '@/components/ui/FeaturedWorks.vue';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

type UserProfile = {
  userId: string;
  displayName: string;
  tagline: string;
  bio: string;
  profileImageUrl: string;
  galleryImageUrls: string[];
  portfolioLink?: string;
  works?: Array<{
    id: number;
    title: string;
    category: string;
    year: string;
    image: string;
    span?: 'large' | 'wide' | 'tall' | 'default';
  }>;
  socialLinks?: { instagram?: string; twitter?: string; email?: string };
};

const route = useRoute();
const profile = ref<UserProfile | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const id = String(route.params.id);
    console.log('Fetching user profile for id:', id);
    const { data } = await axios.get(`/api/users/${id}/profile`);
    console.log('Fetched user profile data:', data);
    profile.value = data;
  } catch (e: any) {
    error.value = e.message;
    console.error('Error fetching user profile:', e);
  } finally {
    loading.value = false;
  }
});
</script>


<style scoped>

.user-profile-blank-layout {
  position: fixed;
  inset: 0;
  min-height: 100vh;
  width: 100vw;
  z-index: 9999;
  background: hsl(var(--background));
  overflow-y: auto;
}
</style>