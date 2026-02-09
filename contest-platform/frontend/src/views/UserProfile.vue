<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ArtistHero from '@/components/ui/ArtistHero.vue';
import GalleryGrid from '@/components/ui/GalleryGrid.vue';
import ProfileLinks from '@/components/ui/ProfileLinks.vue';

type UserProfile = {
  userId: string;
  displayName: string;
  tagline: string;
  bio: string;
  profileImageUrl: string;
  galleryImageUrls: string[];
  links: { label: string; url: string; icon?: string }[];
  socialLinks?: { instagram?: string; twitter?: string; email?: string };
};

const route = useRoute();
const profile = ref<UserProfile | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const id = String(route.params.id);
    const { data } = await axios.get(`/api/users/${id}/profile`);
    profile.value = data;
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <p class="text-gray-500">Loading profile...</p>
  </div>

  <div v-else-if="error" class="min-h-screen flex items-center justify-center">
    <p class="text-red-500">{{ error }}</p>
  </div>

  <div v-else-if="profile">
    <ArtistHero
      :artistName="profile.displayName"
      :tagline="profile.tagline"
      :description="profile.bio"
      :profileImage="profile.profileImageUrl"
      :galleryImages="profile.galleryImageUrls"
      :socialLinks="profile.socialLinks || {}"
    />
    <GalleryGrid :images="profile.galleryImageUrls" />
    <ProfileLinks :links="profile.links" />
  </div>
</template>