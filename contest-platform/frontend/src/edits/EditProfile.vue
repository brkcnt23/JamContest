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

interface GalleryArtwork {
  title: string;
  url: string;
}

const form = ref({
  displayName: '',
  tagline: '',
  bio: '',
  about: '',
  portfolioLink: '',
  avatar: '',
  galleryArtworks: [] as GalleryArtwork[], // YENİ
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
      galleryArtworks: Array.isArray(data.galleryArtworks) 
        ? data.galleryArtworks 
        : [],
      contactEmail: data.contactEmail || '',
      contactInstagram: data.contactInstagram || '',
      contactTwitter: data.contactTwitter || '',
      contactBehance: data.contactBehance || '',
      contactArtStation: data.contactArtStation || '',
    };
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load profile';
    showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
});

const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

const addArtwork = () => {
  form.value.galleryArtworks.push({ title: '', url: '' });
};

const removeArtwork = (idx: number) => {
  form.value.galleryArtworks.splice(idx, 1);
};

const handleSubmit = async () => {
  validationErrors.value = {};
  
  // Validation
  if (form.value.bio.length > BIO_LIMIT) {
    validationErrors.value.bio = `Bio must be ${BIO_LIMIT} characters or less`;
    return;
  }
  
  if (form.value.about.length > ABOUT_LIMIT) {
    validationErrors.value.about = `About must be ${ABOUT_LIMIT} characters or less`;
    return;
  }

  // Filter out empty artworks
  const validArtworks = form.value.galleryArtworks.filter(
    art => art.url.trim() !== ''
  );

  saving.value = true;
  try {
    await axios.put(`/api/users/${userId.value}/profile`, {
      displayName: form.value.displayName,
      tagline: form.value.tagline,
      bio: form.value.bio,
      about: form.value.about,
      portfolioLink: form.value.portfolioLink,
      avatar: form.value.avatar,
      galleryArtworks: validArtworks,
      contactEmail: form.value.contactEmail,
      contactInstagram: form.value.contactInstagram,
      contactTwitter: form.value.contactTwitter,
      contactBehance: form.value.contactBehance,
      contactArtStation: form.value.contactArtStation,
    });

    showToast('Profile updated successfully!', 'success');
    router.push(`/user/${userId.value}`);
  } catch (err: any) {
    const message = err.response?.data?.message || 'Failed to update profile';
    showToast(message, 'error');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push(`/user/${userId.value}`);
};
</script>

<template>
  <div class="min-h-screen bg-[hsl(var(--muted))] pt-8 pb-16">
    <div class="max-w-6xl mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[hsl(var(--foreground))]">Edit Profile</h1>
        <p class="text-[hsl(var(--muted-foreground))] mt-2">Update your public artist profile</p>
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- LEFT COLUMN -->
        <div class="space-y-6">
          <!-- Basic Info Card -->
          <div class="card">
            <h2 class="card-title">Basic Information</h2>
            
            <div class="form-group">
              <label class="form-label">Display Name</label>
              <input
                v-model="form.displayName"
                type="text"
                class="form-input"
                placeholder="Your artist name"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Tagline</label>
              <input
                v-model="form.tagline"
                type="text"
                class="form-input"
                placeholder="One-line description"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Bio ({{ bioCharCount }}/{{ BIO_LIMIT }})</label>
              <textarea
                v-model="form.bio"
                class="form-input"
                rows="3"
                :maxlength="BIO_LIMIT"
                placeholder="Short bio for your profile card"
              ></textarea>
              <p v-if="validationErrors.bio" class="form-error">{{ validationErrors.bio }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">About ({{ aboutCharCount }}/{{ ABOUT_LIMIT }})</label>
              <textarea
                v-model="form.about"
                class="form-input"
                rows="6"
                :maxlength="ABOUT_LIMIT"
                placeholder="Tell your story, your journey, your inspirations..."
              ></textarea>
              <p v-if="validationErrors.about" class="form-error">{{ validationErrors.about }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">Portfolio Link</label>
              <input
                v-model="form.portfolioLink"
                type="url"
                class="form-input"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <!-- Contact Info Card -->
          <div class="card">
            <h2 class="card-title">Contact Information</h2>
            
            <div class="space-y-4">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  v-model="form.contactEmail"
                  type="email"
                  class="form-input"
                  placeholder="your@email.com"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Instagram</label>
                <input
                  v-model="form.contactInstagram"
                  type="text"
                  class="form-input"
                  placeholder="@username"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Twitter/X</label>
                <input
                  v-model="form.contactTwitter"
                  type="text"
                  class="form-input"
                  placeholder="@username"
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

              <div class="form-group">
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

        <!-- RIGHT COLUMN -->
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

          <!-- Gallery Artworks Card -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="card-title mb-0">Gallery Artworks</h2>
              <button 
                type="button" 
                @click="addArtwork" 
                class="btn-icon"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>
            
            <p class="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              First 5 appear in Hero. All shown in portfolio grid.
            </p>

            <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <div 
                v-for="(artwork, idx) in form.galleryArtworks" 
                :key="idx" 
                class="artwork-item"
              >
                <!-- Title Input -->
                <input
                  v-model="artwork.title"
                  type="text"
                  class="form-input"
                  :placeholder="`Artwork ${idx + 1} Title`"
                />

                <!-- URL Input + Delete Button -->
                <div class="flex gap-2">
                  <input
                    v-model="artwork.url"
                    type="url"
                    class="form-input flex-1"
                    :placeholder="`Image ${idx + 1} URL`"
                  />
                  
                  <button 
                    type="button" 
                    @click="removeArtwork(idx)" 
                    class="btn-icon-danger-compact"
                    title="Remove"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

                <!-- Preview -->
                <img 
                  v-if="artwork.url && isValidUrl(artwork.url)" 
                  :src="artwork.url" 
                  :alt="artwork.title || 'Artwork preview'"
                  class="artwork-preview"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card">
            <div class="flex justify-center">
              <div class="flex gap-4 max-w-md w-full">
                <Button type="submit" size="lg" class="flex-1" :disabled="saving">
                  <Save class="w-4 h-4 mr-2" />
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

.artwork-item {
  @apply flex flex-col gap-3 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:border-[hsl(var(--brand))] transition-colors;
}

.btn-icon {
  @apply p-2 rounded-lg bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand))]/90 transition-colors;
}

.btn-icon-danger-compact {
  @apply p-2 rounded-lg bg-[hsl(var(--accent-coral))] text-white hover:bg-[hsl(var(--accent-coral-dark))] transition-colors flex-shrink-0;
}

.artwork-preview {
  @apply w-full h-40 rounded-lg object-cover border-2 border-[hsl(var(--border))];
}
</style>