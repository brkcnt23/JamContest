<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { showToast } from '@/composables/useToast';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Button from '@/components/ui/Button.vue';
import { Save, X, Plus, Trash2, Eye } from 'lucide-vue-next';

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
    
    form.value = {
      displayName: data.displayName || '',
      tagline: data.tagline || '',
      bio: data.bio || '',
      about: data.about || '',
      portfolioLink: data.portfolioLink || '',
      avatar: data.profileImageUrl || '',
      galleryImages: Array.isArray(data.galleryImageUrls) ? data.galleryImageUrls : [],
      contactEmail: data.contactEmail || '',
      contactInstagram: data.contactInstagram || '',
      contactTwitter: data.contactTwitter || '',
      contactBehance: data.contactBehance || '',
      contactArtStation: data.contactArtStation || '',
    };
    console.log('[EditProfile] Gallery images loaded:', form.value.galleryImages);
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

  try {
    await axios.put(`/api/users/${userId.value}/profile`, {
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
    });
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
  <div class="min-h-screen bg-[hsl(var(--muted))] py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 bg-[hsl(var(--background))] rounded-xl p-6 shadow-sm border border-[hsl(var(--border))]">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-[hsl(var(--foreground))]">Edit Profile</h1>
            <p class="text-[hsl(var(--muted-foreground))] mt-1">Update your artist portfolio</p>
          </div>
          <button 
            @click="handleCancel"
            class="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <p class="text-[hsl(var(--muted-foreground))]">Loading profile...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="grid lg:grid-cols-2 gap-6">
        <!-- LEFT COLUMN - Form Fields -->
        <div class="space-y-6">
          <!-- Basic Info Card -->
          <div class="card">
            <h2 class="card-title">Basic Information</h2>
            
            <div class="form-group">
              <label class="form-label">
                Display Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.displayName"
                type="text"
                required
                class="form-input"
                placeholder="Your Name"
              />
              <p v-if="validationErrors.displayName" class="form-error">{{ validationErrors.displayName }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">Tagline</label>
              <input
                v-model="form.tagline"
                type="text"
                class="form-input"
                placeholder="Visual Artist & Creative Director"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                Bio <span class="text-xs text-[hsl(var(--muted-foreground))]">(max {{ BIO_LIMIT }})</span>
              </label>
              <textarea
                v-model="form.bio"
                rows="3"
                :maxlength="BIO_LIMIT"
                class="form-input"
                placeholder="Brief introduction..."
              />
              <div class="flex justify-between mt-1">
                <p v-if="validationErrors.bio" class="form-error">{{ validationErrors.bio }}</p>
                <p class="text-xs text-[hsl(var(--muted-foreground))] ml-auto">{{ bioCharCount }}/{{ BIO_LIMIT }}</p>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                About <span class="text-xs text-[hsl(var(--muted-foreground))]">(max {{ ABOUT_LIMIT }})</span>
              </label>
              <textarea
                v-model="form.about"
                rows="6"
                :maxlength="ABOUT_LIMIT"
                class="form-input text-sm"
                placeholder="Your story, journey, and what drives your work..."
              />
              <div class="flex justify-between mt-1">
                <p v-if="validationErrors.about" class="form-error">{{ validationErrors.about }}</p>
                <p class="text-xs text-[hsl(var(--muted-foreground))] ml-auto">{{ aboutCharCount }}/{{ ABOUT_LIMIT }}</p>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Portfolio Link</label>
              <input
                v-model="form.portfolioLink"
                type="url"
                class="form-input"
                placeholder="https://portfolio.example.com"
              />
              <p v-if="validationErrors.portfolioLink" class="form-error">{{ validationErrors.portfolioLink }}</p>
            </div>
          </div>

          <!-- Contact Info Card -->
          <div class="card">
            <h2 class="card-title">Contact Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  v-model="form.contactEmail"
                  type="email"
                  class="form-input"
                  placeholder="artist@example.com"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Instagram</label>
                <input
                  v-model="form.contactInstagram"
                  type="url"
                  class="form-input"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div class="form-group">
                <label class="form-label">Twitter</label>
                <input
                  v-model="form.contactTwitter"
                  type="url"
                  class="form-input"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div class="form-group">
                <label class="form-label">Behance</label>
                <input
                  v-model="form.contactBehance"
                  type="url"
                  class="form-input"
                  placeholder="https://behance.net/..."
                />
              </div>

              <div class="form-group md:col-span-2">
                <label class="form-label">ArtStation</label>
                <input
                  v-model="form.contactArtStation"
                  type="url"
                  class="form-input"
                  placeholder="https://artstation.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN - Preview & Gallery -->
        <div class="space-y-6">
          <!-- Avatar Preview Card -->
          <div class="card">
            <h2 class="card-title">Profile Image</h2>
            
            <div class="form-group">
              <label class="form-label">Avatar URL</label>
              <input
                v-model="form.avatar"
                type="url"
                class="form-input"
                placeholder="https://images.example.com/avatar.jpg"
              />
              <p v-if="validationErrors.avatar" class="form-error">{{ validationErrors.avatar }}</p>
            </div>

            <div v-if="form.avatar && isValidUrl(form.avatar)" class="mt-4">
              <p class="text-sm text-[hsl(var(--muted-foreground))] mb-2 flex items-center gap-2">
                <Eye class="w-4 h-4" /> Preview
              </p>
              <div class="flex justify-center">
                <img 
                  :src="form.avatar" 
                  alt="Avatar preview"
                  class="w-32 h-32 rounded-full object-cover border-4 border-[hsl(var(--border))]"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
              </div>
            </div>
          </div>

          <!-- Gallery Images Card -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="card-title mb-0">Gallery Images</h2>
              <button 
                type="button" 
                @click="form.galleryImages.push('')" 
                class="btn-icon"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>
            
            <p class="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              First 5 appear in Hero. All shown in portfolio grid.
            </p>

            <div class="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              <div v-for="(url, idx) in form.galleryImages" :key="idx" class="gallery-item">
                <input
                  v-model="form.galleryImages[idx]"
                  type="url"
                  class="form-input flex-1"
                  :placeholder="`Image ${idx + 1} URL`"
                />
                
                <button 
                  type="button" 
                  @click="form.galleryImages.splice(idx, 1)" 
                  class="btn-icon-danger"
                >
                  <Trash2 class="w-4 h-4" />
                </button>

                <img 
                  v-if="url && isValidUrl(url)" 
                  :src="url" 
                  alt="Gallery preview"
                  class="w-full h-32 rounded-lg object-cover border-2 border-[hsl(var(--border))] mt-2"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card">
            <div class="flex gap-4">
              <Button type="submit" size="lg" class="flex-1" :disabled="saving">
                <Save class="w-4 h-4 mr-2" />
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </Button>
              <Button type="button" size="lg" variant="outline" @click="handleCancel" :disabled="saving">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-[hsl(var(--background))] rounded-xl p-6 shadow-sm border border-[hsl(var(--border))];
}

.card-title {
  @apply text-xl font-semibold text-[hsl(var(--foreground))] mb-4 pb-2 border-b border-[hsl(var(--border))];
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-[hsl(var(--foreground))];
}

.form-input {
  @apply w-full px-4 py-2.5 rounded-lg border bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-transparent transition-all;
}

.form-error {
  @apply text-sm text-[hsl(var(--accent-coral))];
}

.gallery-item {
  @apply flex flex-col gap-2 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:border-[hsl(var(--brand))] transition-colors;
}

.btn-icon {
  @apply p-2 rounded-lg bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand))]/90 transition-colors;
}

.btn-icon-danger {
  @apply p-2 rounded-lg bg-[hsl(var(--accent-coral))] text-white hover:bg-[hsl(var(--accent-coral-dark))] transition-colors;
}
</style>