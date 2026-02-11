<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Button from '@/components/ui/Button.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const userId = computed(() => String(route.params.id));
const isOwnProfile = computed(() => authStore.user?.id === userId.value);

// Form state
const form = ref({
  displayName: '',
  tagline: '',
  bio: '',
  portfolioLink: '',
  avatar: '',
  gallery1: '',
  gallery2: '',
  gallery3: '',
  gallery4: '',
  gallery5: '',
});

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const validationErrors = ref<Record<string, string>>({});

// Load current profile data
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  if (!isOwnProfile.value) {
    router.push(`/user/${userId.value}`);
    return;
  }

  loading.value = true;
  try {
    const { data } = await axios.get(`/api/users/${userId.value}/profile`);
    form.value = {
      displayName: data.displayName || '',
      tagline: data.tagline || '',
      bio: data.bio || '',
      portfolioLink: data.portfolioLink || '',
      avatar: data.profileImageUrl || '',
      gallery1: data.galleryImageUrls[0] || '',
      gallery2: data.galleryImageUrls[1] || '',
      gallery3: data.galleryImageUrls[2] || '',
      gallery4: data.galleryImageUrls[3] || '',
      gallery5: data.galleryImageUrls[4] || '',
    };
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
});

// Validation
const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid
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

  if (form.value.portfolioLink && !isValidUrl(form.value.portfolioLink)) {
    validationErrors.value.portfolioLink = 'Invalid URL';
  }

  if (form.value.avatar && !isValidUrl(form.value.avatar)) {
    validationErrors.value.avatar = 'Invalid URL';
  }

  ['gallery1', 'gallery2', 'gallery3', 'gallery4', 'gallery5'].forEach((key) => {
    if (form.value[key as keyof typeof form.value] && !isValidUrl(form.value[key as keyof typeof form.value])) {
      validationErrors.value[key] = 'Invalid URL';
    }
  });

  return Object.keys(validationErrors.value).length === 0;
};

// Submit
const handleSubmit = async () => {
  if (!validate()) return;

  saving.value = true;
  error.value = '';

  try {
    await axios.put(`/api/users/${userId.value}/profile`, {
      displayName: form.value.displayName.trim(),
      tagline: form.value.tagline.trim() || null,
      bio: form.value.bio.trim() || null,
      portfolioLink: form.value.portfolioLink.trim() || null,
      avatar: form.value.avatar.trim() || null,
      gallery1: form.value.gallery1.trim() || null,
      gallery2: form.value.gallery2.trim() || null,
      gallery3: form.value.gallery3.trim() || null,
      gallery4: form.value.gallery4.trim() || null,
      gallery5: form.value.gallery5.trim() || null,
    });

    router.push(`/user/${userId.value}`);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to update profile';
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
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">Edit Profile</h1>
        <p class="text-[hsl(var(--muted-foreground))]">Update your artist portfolio information</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <p class="text-[hsl(var(--muted-foreground))]">Loading profile...</p>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Global Error -->
        <div
          v-if="error"
          class="p-4 rounded-lg bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))]"
        >
          {{ error }}
        </div>

        <!-- Display Name -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
            Display Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.displayName"
            type="text"
            required
            class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
            placeholder="Your Name"
          />
          <p v-if="validationErrors.displayName" class="text-sm text-red-500">
            {{ validationErrors.displayName }}
          </p>
        </div>

        <!-- Tagline -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
            Tagline
          </label>
          <input
            v-model="form.tagline"
            type="text"
            class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
            placeholder="Visual Artist & Creative Director"
          />
        </div>

        <!-- Bio -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
            Bio / Description
          </label>
          <textarea
            v-model="form.bio"
            rows="4"
            class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
            placeholder="Exploring creativity through digital art..."
          />
        </div>

        <!-- Portfolio Link -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
            Portfolio Link
          </label>
          <input
            v-model="form.portfolioLink"
            type="url"
            class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
            placeholder="https://portfolio.example.com"
          />
          <p v-if="validationErrors.portfolioLink" class="text-sm text-red-500">
            {{ validationErrors.portfolioLink }}
          </p>
          <p class="text-xs text-[hsl(var(--muted-foreground))]">
            External link for "View Portfolio" and "View All Works" buttons
          </p>
        </div>

        <!-- Profile Image -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
            Profile Image URL
          </label>
          <input
            v-model="form.avatar"
            type="url"
            class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
            placeholder="https://images.example.com/profile.jpg"
          />
          <p v-if="validationErrors.avatar" class="text-sm text-red-500">
            {{ validationErrors.avatar }}
          </p>
        </div>

        <!-- Gallery Images -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-[hsl(var(--foreground))]">
            Gallery Images (Floating around profile)
          </h3>
          <p class="text-sm text-[hsl(var(--muted-foreground))]">
            Add up to 5 image URLs for the floating gallery effect
          </p>

          <div v-for="i in 5" :key="i" class="space-y-2">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))]">
              Gallery Image {{ i }}
            </label>
            <input
              v-model="form[`gallery${i}` as keyof typeof form]"
              type="url"
              class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              :placeholder="`https://images.example.com/work${i}.jpg`"
            />
            <p v-if="validationErrors[`gallery${i}`]" class="text-sm text-red-500">
              {{ validationErrors[`gallery${i}`] }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-6 border-t border-[hsl(var(--border))]">
          <Button
            type="submit"
            size="lg"
            :disabled="saving"
            class="flex-1"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            @click="handleCancel"
            :disabled="saving"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>