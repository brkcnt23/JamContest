<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { showToast } from '@/composables/useToast';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Button from '@/components/ui/Button.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const userId = computed(() => String(route.params.id));

const form = ref({
  displayName: '',
  tagline: '',
  bio: '',
  about: '',
  portfolioLink: '',
  avatar: '',
  galleryImages: [] as string[],
  contactEmail: '',
  contactInstagram: '',
  contactTwitter: '',
  contactBehance: '',
  contactArtStation: '',
});

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const validationErrors = ref<Record<string, string>>({});

// Character limits
const BIO_LIMIT = 250;
const ABOUT_LIMIT = 1000;

const bioCharCount = computed(() => form.value.bio.length);
const aboutCharCount = computed(() => form.value.about.length);

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  loading.value = true;
  try {
    const { data } = await axios.get(`/api/users/${userId.value}/profile`);
    console.log('[EditProfile] Loaded profile data:', data);
    console.log('[EditProfile] Gallery images:', data.galleryImages);
    console.log('[EditProfile] Gallery image URLs:', data.galleryImageUrls);
    
    form.value = {
      displayName: data.displayName || '',
      tagline: data.tagline || '',
      bio: data.bio || '',
      about: data.about || '',
      portfolioLink: data.portfolioLink || '',
      avatar: data.profileImageUrl || '',
      galleryImages: Array.isArray(data.galleryImageUrls) ? data.galleryImageUrls : (Array.isArray(data.galleryImages) ? data.galleryImages : []),
      contactEmail: data.contactEmail || '',
      contactInstagram: data.contactInstagram || '',
      contactTwitter: data.contactTwitter || '',
      contactBehance: data.contactBehance || '',
      contactArtStation: data.contactArtStation || '',
    };
    console.log('[EditProfile] Form gallery images after load:', form.value.galleryImages);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
});

const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validate = (): boolean => {
  validationErrors.value = {};

  if (!form.value.displayName.trim()) {
    validationErrors.value.displayName = 'Display name is required';
  }

  if (form.value.bio.length > BIO_LIMIT) {
    validationErrors.value.bio = `Bio must be ${BIO_LIMIT} characters or less`;
  }

  if (form.value.about.length > ABOUT_LIMIT) {
    validationErrors.value.about = `About must be ${ABOUT_LIMIT} characters or less`;
  }

  if (form.value.portfolioLink && !isValidUrl(form.value.portfolioLink)) {
    validationErrors.value.portfolioLink = 'Invalid URL';
  }

  if (form.value.avatar && !isValidUrl(form.value.avatar)) {
    validationErrors.value.avatar = 'Invalid URL';
  }

  form.value.galleryImages.forEach((url, idx) => {
    if (url && !isValidUrl(url)) {
      validationErrors.value[`galleryImages_${idx}`] = 'Invalid URL';
    }
  });

  const contactFields = ['contactInstagram', 'contactTwitter', 'contactBehance', 'contactArtStation'] as const;
  contactFields.forEach(field => {
    if (form.value[field] && !isValidUrl(form.value[field])) {
      validationErrors.value[field] = 'Invalid URL';
    }
  });

  return Object.keys(validationErrors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;

  saving.value = true;
  error.value = '';

  const payload = {
    displayName: form.value.displayName.trim(),
    tagline: form.value.tagline.trim() || null,
    bio: form.value.bio.trim() || null,
    about: form.value.about.trim() || null,
    portfolioLink: form.value.portfolioLink.trim() || null,
    avatar: form.value.avatar.trim() || null,
    galleryImages: form.value.galleryImages.map(url => url.trim()).filter(Boolean),
    contactEmail: form.value.contactEmail.trim() || null,
    contactInstagram: form.value.contactInstagram.trim() || null,
    contactTwitter: form.value.contactTwitter.trim() || null,
    contactBehance: form.value.contactBehance.trim() || null,
    contactArtStation: form.value.contactArtStation.trim() || null,
  };

  console.log('[EditProfile] Submitting payload:', payload);
  console.log('[EditProfile] Gallery images being saved:', payload.galleryImages);

  try {
    const response = await axios.put(`/api/users/${userId.value}/profile`, payload);
    console.log('[EditProfile] Save response:', response.data);
    showToast('Profile updated successfully!', 'success');
    setTimeout(() => router.push(`/user/${userId.value}`), 1200);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to update profile';
    showToast(error.value, 'error');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push(`/user/${userId.value}`);
};
</script>

<template>
  <div class="min-h-screen bg-[hsl(var(--background))] py-12 px-6">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">Edit Profile</h1>
        <p class="text-[hsl(var(--muted-foreground))]">Update your artist portfolio information</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <p class="text-[hsl(var(--muted-foreground))]">Loading profile...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-8">
        <div v-if="error" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {{ error }}
        </div>

        <!-- Basic Info Section -->
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-[hsl(var(--foreground))] border-b pb-2">Basic Information</h2>
          
          <!-- Display Name -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
              Display Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.displayName"
              type="text"
              required
              class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              placeholder="Your Name"
            />
            <p v-if="validationErrors.displayName" class="text-sm text-red-500">{{ validationErrors.displayName }}</p>
          </div>

          <!-- Tagline -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))]">Tagline</label>
            <input
              v-model="form.tagline"
              type="text"
              class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              placeholder="Visual Artist & Creative Director"
            />
          </div>

          <!-- Bio -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
              Bio <span class="text-xs text-[hsl(var(--muted-foreground))]">(3-5 sentences, max {{ BIO_LIMIT }} characters)</span>
            </label>
            <textarea
              v-model="form.bio"
              rows="4"
              :maxlength="BIO_LIMIT"
              class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              placeholder="Brief introduction..."
            />
            <p class="text-xs text-[hsl(var(--muted-foreground))] text-right">{{ bioCharCount }}/{{ BIO_LIMIT }}</p>
            <p v-if="validationErrors.bio" class="text-sm text-red-500">{{ validationErrors.bio }}</p>
          </div>

          <!-- About -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
              About <span class="text-xs text-[hsl(var(--muted-foreground))]">(3-4 paragraphs, max {{ ABOUT_LIMIT }} characters)</span>
            </label>
            <textarea
              v-model="form.about"
              rows="8"
              :maxlength="ABOUT_LIMIT"
              class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-sm"
              placeholder="Tell your story, your artistic journey, influences, and what drives your work..."
            />
            <p class="text-xs text-[hsl(var(--muted-foreground))] text-right">{{ aboutCharCount }}/{{ ABOUT_LIMIT }}</p>
            <p v-if="validationErrors.about" class="text-sm text-red-500">{{ validationErrors.about }}</p>
          </div>

          <!-- Portfolio Link -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))]">Portfolio Link</label>
            <input
              v-model="form.portfolioLink"
              type="url"
              class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              placeholder="https://portfolio.example.com"
            />
            <p v-if="validationErrors.portfolioLink" class="text-sm text-red-500">{{ validationErrors.portfolioLink }}</p>
          </div>

          <!-- Profile Image -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))]">Profile Image URL</label>
            <div class="flex gap-4">
              <input
                v-model="form.avatar"
                type="url"
                class="flex-1 px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://images.example.com/profile.jpg"
              />
              <img 
                v-if="form.avatar && isValidUrl(form.avatar)" 
                :src="form.avatar" 
                alt="Avatar preview"
                class="w-16 h-16 rounded-full object-cover border-2 border-[hsl(var(--border))]"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
            </div>
            <p v-if="validationErrors.avatar" class="text-sm text-red-500">{{ validationErrors.avatar }}</p>
          </div>
        </section>

        <!-- Contact Section -->
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-[hsl(var(--foreground))] border-b pb-2">Contact Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-[hsl(var(--foreground))]">Email</label>
              <input
                v-model="form.contactEmail"
                type="email"
                class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="artist@example.com"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-[hsl(var(--foreground))]">Instagram</label>
              <input
                v-model="form.contactInstagram"
                type="url"
                class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://instagram.com/username"
              />
              <p v-if="validationErrors.contactInstagram" class="text-sm text-red-500">{{ validationErrors.contactInstagram }}</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-[hsl(var(--foreground))]">Twitter</label>
              <input
                v-model="form.contactTwitter"
                type="url"
                class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://twitter.com/username"
              />
              <p v-if="validationErrors.contactTwitter" class="text-sm text-red-500">{{ validationErrors.contactTwitter }}</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-[hsl(var(--foreground))]">Behance</label>
              <input
                v-model="form.contactBehance"
                type="url"
                class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://behance.net/username"
              />
              <p v-if="validationErrors.contactBehance" class="text-sm text-red-500">{{ validationErrors.contactBehance }}</p>
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-[hsl(var(--foreground))]">ArtStation</label>
              <input
                v-model="form.contactArtStation"
                type="url"
                class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://artstation.com/username"
              />
              <p v-if="validationErrors.contactArtStation" class="text-sm text-red-500">{{ validationErrors.contactArtStation }}</p>
            </div>
          </div>
        </section>

        <!-- Gallery Images -->
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-[hsl(var(--foreground))] border-b pb-2">Gallery Images</h2>
          <p class="text-sm text-[hsl(var(--muted-foreground))]">First 5 images appear in Hero. All images shown in portfolio grid.</p>
          
          <div v-for="(url, idx) in form.galleryImages" :key="idx" class="flex items-start gap-2">
            <input
              v-model="form.galleryImages[idx]"
              type="url"
              class="flex-1 px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              :placeholder="`https://images.example.com/work${idx+1}.jpg`"
            />
            <img 
              v-if="url && isValidUrl(url)" 
              :src="url" 
              alt="Gallery preview"
              class="w-16 h-16 rounded-lg object-cover border-2 border-[hsl(var(--border))]"
              @error="($event.target as HTMLImageElement).style.display='none'"
            />
            <button type="button" @click="form.galleryImages.splice(idx, 1)" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Remove</button>
          </div>
          <button type="button" @click="form.galleryImages.push('')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">+ Add Image</button>
        </section>

        <!-- Actions -->
        <div class="flex gap-4 pt-6 border-t border-[hsl(var(--border))]">
          <Button type="submit" size="lg" :disabled="saving" class="flex-1">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </Button>
          <Button type="button" size="lg" variant="outline" @click="handleCancel" :disabled="saving">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>