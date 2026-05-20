<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[hsl(var(--foreground))]">{{ $t('projects.title') }}</h1>
        <p class="text-[hsl(var(--muted-foreground))] mt-1">{{ $t('projects.subtitle') }}</p>
      </div>
      <router-link to="/projects/create" class="px-5 py-2.5 rounded-lg bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/80 text-white font-semibold text-sm transition-colors">
        + {{ $t('projects.create') }}
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-12 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>
    <div v-else-if="!projects.length" class="text-center py-20">
      <p class="text-lg text-[hsl(var(--muted-foreground))]">{{ $t('projects.empty') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="project in projects" :key="project.id"
        class="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-[hsl(var(--brand))]/30 transition-colors overflow-hidden">
        <div v-if="project.images.length" class="w-full h-40 overflow-hidden bg-[hsl(var(--muted))]">
          <img :src="project.images[0]" class="w-full h-40 object-cover" />
        </div>
        <div class="p-5">
          <h3 class="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">{{ project.title }}</h3>
          <p class="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">{{ project.description }}</p>
          <div class="flex flex-wrap gap-1.5 mb-3">
            <span v-for="tag in project.tags" :key="tag"
              class="px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] border border-[hsl(var(--brand))]/20">{{ tag }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span v-if="project.price" class="text-lg font-bold text-[hsl(var(--brand))]">₺{{ project.price }}</span>
            <span v-else class="text-sm text-[hsl(var(--muted-foreground))]">Ücretsiz</span>
            <div class="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <img v-if="project.user?.avatar" :src="project.user.avatar" class="w-5 h-5 rounded-full" />
              <span class="text-[hsl(var(--foreground))]">{{ project.user?.displayName || project.user?.username }}</span>
            </div>
          </div>
          <button v-if="authStore.isAuthenticated && authStore.user?.id !== project.userId"
            class="mt-3 w-full py-2 rounded-lg bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] text-sm font-semibold hover:bg-[hsl(var(--brand))]/20 transition-colors"
            @click="openContactModal(project)">Mesaj Gönder</button>
          <button v-if="authStore.user?.id === project.userId"
            class="mt-3 w-full py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors"
            @click="openMessages(project)">Gelen Mesajlar</button>
        </div>
      </div>
    </div>

    <div v-if="hasMore" class="text-center pt-6">
      <button class="px-6 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm transition-colors"
        @click="loadMore">{{ $t('common.load_more') }}</button>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="fixed inset-0 z-[200] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showContactModal = false"></div>
      <div class="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg mx-4 p-6">
        <h2 class="text-xl font-bold text-[hsl(var(--foreground))] mb-4">Proje Sahibine Mesaj Gönder</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Mesajınız *</label>
            <textarea v-model="contactForm.message" rows="4" maxlength="2000" required
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm resize-y focus:outline-none focus:border-[hsl(var(--brand))]"
              placeholder="Proje hakkında ne düşünüyorsunuz? Kendinizi tanıtın..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Portföy Linki</label>
            <input v-model="contactForm.portfolioLink" type="url"
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--brand))]"
              placeholder="https://..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">İletişim E-postası</label>
            <input v-model="contactForm.contactEmail" type="email"
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--brand))]"
              placeholder="ornek@email.com" />
          </div>
        </div>
        <div class="flex items-center gap-3 mt-6">
          <button :disabled="submittingContact" class="px-5 py-2.5 rounded-lg bg-[hsl(var(--brand))] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
            @click="submitContact">{{ submittingContact ? 'Gönderiliyor...' : 'Gönder' }}</button>
          <button class="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm hover:bg-[hsl(var(--muted))]"
            @click="showContactModal = false">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- Messages Modal (owner) -->
    <div v-if="showMessagesModal" class="fixed inset-0 z-[200] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showMessagesModal = false"></div>
      <div class="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[hsl(var(--foreground))]">Gelen Mesajlar</h2>
          <button class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-2xl leading-none" @click="showMessagesModal = false">&times;</button>
        </div>
        <div v-if="loadingMessages" class="text-center py-8 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>
        <div v-else-if="!messages.length" class="text-center py-8 text-[hsl(var(--muted-foreground))]">Henüz mesaj yok</div>
        <div v-else class="space-y-3">
          <div v-for="msg in messages" :key="msg.id" class="p-4 rounded-xl border border-[hsl(var(--border))]">
            <div class="flex items-center gap-2 mb-2">
              <img v-if="msg.user?.avatar" :src="msg.user.avatar" class="w-8 h-8 rounded-full" />
              <div v-else class="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-bold">?</div>
              <div>
                <p class="font-semibold text-[hsl(var(--foreground))] text-sm">{{ msg.user?.displayName || msg.user?.username }}</p>
                <p class="text-xs text-[hsl(var(--muted-foreground))]">{{ new Date(msg.createdAt).toLocaleDateString('tr-TR') }}</p>
              </div>
            </div>
            <p class="text-sm text-[hsl(var(--foreground))]">{{ msg.message }}</p>
            <div class="flex flex-wrap gap-2 mt-2 text-xs">
              <a v-if="msg.portfolioLink" :href="msg.portfolioLink" target="_blank" class="text-[hsl(var(--brand))] hover:underline">Portföy →</a>
              <a v-if="msg.contactEmail" :href="'mailto:' + msg.contactEmail" class="text-[hsl(var(--brand))] hover:underline">{{ msg.contactEmail }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import axios from 'axios';

const authStore = useAuthStore();
const projects = ref<any[]>([]);
const loading = ref(true);
const skip = ref(0);
const hasMore = ref(false);
const take = 20;

// Contact modal
const showContactModal = ref(false);
const selectedProject = ref<any>(null);
const submittingContact = ref(false);
const contactForm = reactive({ message: '', portfolioLink: '', contactEmail: '' });

// Messages modal
const showMessagesModal = ref(false);
const messages = ref<any[]>([]);
const loadingMessages = ref(false);

onMounted(async () => { await loadProjects(); });

async function loadProjects() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/projects', { params: { take, skip: skip.value } });
    if (skip.value === 0) projects.value = data;
    else projects.value.push(...data);
    hasMore.value = data.length === take;
    skip.value += data.length;
  } catch { /* ignore */ }
  finally { loading.value = false; }
}

async function loadMore() { await loadProjects(); }

function openContactModal(project: any) {
  selectedProject.value = project;
  contactForm.message = ''; contactForm.portfolioLink = ''; contactForm.contactEmail = '';
  showContactModal.value = true;
}

async function submitContact() {
  if (!contactForm.message.trim() || !selectedProject.value) return;
  submittingContact.value = true;
  try {
    await axios.post(`/api/projects/${selectedProject.value.id}/contact`, contactForm);
    showToast('Mesajınız gönderildi', 'success');
    showContactModal.value = false;
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
  finally { submittingContact.value = false; }
}

async function openMessages(project: any) {
  selectedProject.value = project;
  showMessagesModal.value = true;
  loadingMessages.value = true;
  try {
    const { data } = await axios.get(`/api/projects/${project.id}/messages`);
    messages.value = data;
  } catch { messages.value = []; }
  finally { loadingMessages.value = false; }
}
</script>
