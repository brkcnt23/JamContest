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
const isOwnProfile = computed(() => authStore.user?.id === userId.value);

// Form state
const form = ref({
  displayName: '',
  tagline: '',
  bio: '',
  portfolioLink: '',
  avatar: '',
  galleryImages: [] as string[],
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

  // Kullanıcı kendi profili değilse, router ile yönlendirme zaten var. Ekstra mesaj veya uyarı gösterilmiyor.

  loading.value = true;
  try {
    const { data } = await axios.get(`/api/users/${userId.value}/profile`);
    form.value = {
      displayName: data.displayName || '',
      tagline: data.tagline || '',
      bio: data.bio || '',
      portfolioLink: data.portfolioLink || '',
      avatar: data.profileImageUrl || '',
      galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : (data.galleryImageUrls || []),
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

  form.value.galleryImages.forEach((url, idx) => {
    if (url && !isValidUrl(url)) {
      validationErrors.value[`galleryImages_${idx}`] = 'Invalid URL';
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
      galleryImages: form.value.galleryImages.map(url => url.trim()).filter(Boolean),
    });
    showToast('Profil başarıyla güncellendi!', 'success');
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
            İlk 5 görsel Hero'da görünecek. Tüm görseller portfolio gridde gösterilecek.
          </p>
          <div v-for="(url, idx) in form.galleryImages" :key="idx" class="space-y-2 flex items-center gap-2">
            <input
              v-model="form.galleryImages[idx]"
              type="url"
              class="w-full px-4 py-2 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              :placeholder="`https://images.example.com/work${idx+1}.jpg`"
            />
            <button type="button" @click="form.galleryImages.splice(idx, 1)" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Sil</button>
            <p v-if="validationErrors[`galleryImages_${idx}`]" class="text-sm text-red-500">
              {{ validationErrors[`galleryImages_${idx}`] }}
            </p>
            <div v-if="url" class="mt-2">
              <img :src="url" alt="Gallery Image" class="max-h-32 rounded border" />
            </div>
          </div>
          <button type="button" @click="form.galleryImages.push('')" class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">+ Görsel Ekle</button>
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