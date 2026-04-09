<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { X, CheckCircle, XCircle, Clock, Trophy, Calendar, Users, FileText, ChevronDown, ChevronUp } from 'lucide-vue-next';

const authStore = useAuthStore();

interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  coverImage?: string;
  topic?: string;
  rules?: string;
  prizes?: string;
  approvalMode: string;
  maxParticipants?: number;
  maxFileSize: number;
  allowedFormats: string[];
  applicationStart?: string;
  applicationEnd?: string;
  topicRevealAt?: string;
  submissionStart?: string;
  submissionEnd?: string;
  judgingStart?: string;
  judgingEnd?: string;
  createdAt: string;
  createdBy: { id: string; username: string; displayName?: string; avatar?: string; globalRole: string };
  members: { role: string; user: { id: string; username: string; displayName?: string } }[];
  _count?: { applications: number; submissions: number };
}

const contests = ref<Contest[]>([]);
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const success = ref('');

// Modal
const modalOpen = ref(false);
const selected = ref<Contest | null>(null);
const noteInput = ref('');
const expandedSection = ref<string | null>(null);

// Onay bekleyenleri yükle
async function fetchPending() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await axios.get('/api/contests/pending');
    contests.value = data;
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Yüklenemedi';
  } finally {
    loading.value = false;
  }
}

function openModal(c: Contest) {
  selected.value = c;
  noteInput.value = '';
  expandedSection.value = null;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  selected.value = null;
  noteInput.value = '';
}

function toggleSection(key: string) {
  expandedSection.value = expandedSection.value === key ? null : key;
}

async function approve() {
  if (!selected.value) return;
  submitting.value = true;
  success.value = '';
  error.value = '';
  try {
    await axios.put(`/api/contests/${selected.value.id}/approve`, { note: noteInput.value });
    success.value = `"${selected.value.title}" onaylandı.`;
    contests.value = contests.value.filter(c => c.id !== selected.value!.id);
    closeModal();
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Onay başarısız';
  } finally {
    submitting.value = false;
  }
}

async function reject() {
  if (!selected.value) return;
  if (!noteInput.value.trim()) {
    error.value = 'Red için not zorunludur.';
    return;
  }
  submitting.value = true;
  success.value = '';
  error.value = '';
  try {
    await axios.put(`/api/contests/${selected.value.id}/reject`, { note: noteInput.value });
    success.value = `"${selected.value.title}" reddedildi.`;
    contests.value = contests.value.filter(c => c.id !== selected.value!.id);
    closeModal();
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Red başarısız';
  } finally {
    submitting.value = false;
  }
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function categoryLabel(c: string) {
  const map: Record<string, string> = {
    'game-dev': 'Game Jam', illustration: 'İllüstrasyon', photography: 'Fotoğrafçılık',
    music: 'Müzik', writing: 'Yazarlık', animation: 'Animasyon',
    design: 'Tasarım', hackathon: 'Hackathon', other: 'Diğer',
  };
  return map[c] ?? c;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'az önce';
  if (h < 24) return `${h} saat önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

onMounted(fetchPending);
</script>

<template>
  <div class="px-6 py-8 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-[hsl(var(--foreground))]">Yarışma Onayları</h1>
        <p class="text-sm text-[hsl(var(--muted-foreground))] mt-1">Organizatörlerin onay bekleyen yarışmaları</p>
      </div>
      <button @click="fetchPending" class="flex items-center gap-2 px-3 py-1.5 text-sm border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] transition-colors">
        Yenile
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="success" class="mb-4 px-4 py-3 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 text-sm">{{ success }}</div>
    <div v-if="error && !modalOpen" class="mb-4 px-4 py-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm">{{ error }}</div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20 text-[hsl(var(--muted-foreground))]">
      <div class="w-6 h-6 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--brand))] rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="contests.length === 0" class="text-center py-20">
      <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
      <p class="font-semibold text-[hsl(var(--foreground))]">Onay bekleyen yarışma yok</p>
      <p class="text-sm text-[hsl(var(--muted-foreground))] mt-1">Tüm yarışmalar incelendi.</p>
    </div>

    <!-- Contest cards -->
    <div v-else class="grid grid-cols-1 gap-4">
      <button
        v-for="c in contests"
        :key="c.id"
        class="contest-card"
        @click="openModal(c)"
      >
        <!-- Cover -->
        <div class="cover-strip" :style="c.coverImage ? `background-image: url(${c.coverImage})` : ''">
          <div class="cover-overlay" />
          <span class="category-pill">{{ categoryLabel(c.category ?? '') }}</span>
        </div>

        <!-- Content -->
        <div class="card-content">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h2 class="text-base font-bold text-[hsl(var(--foreground))] truncate">{{ c.title }}</h2>
              <p class="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                <span class="font-medium">{{ c.createdBy.displayName || c.createdBy.username }}</span>
                tarafından • {{ timeAgo(c.createdAt) }}
              </p>
            </div>
            <span class="pending-badge">
              <Clock class="w-3 h-3" />
              Onay Bekliyor
            </span>
          </div>

          <p class="text-sm text-[hsl(var(--muted-foreground))] mt-2 line-clamp-2">{{ c.description }}</p>

          <!-- Date summary -->
          <div class="flex flex-wrap gap-3 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span v-if="c.applicationStart" class="flex items-center gap-1">
              <Calendar class="w-3 h-3" />
              Başvuru: {{ formatDate(c.applicationStart).split(' ')[0] }}{{ formatDate(c.applicationStart).split(' ')[1] ? ' ' + formatDate(c.applicationStart).split(' ')[1] : '' }}
            </span>
            <span v-if="c.maxParticipants" class="flex items-center gap-1">
              <Users class="w-3 h-3" />
              Maks {{ c.maxParticipants }} katılımcı
            </span>
            <span v-if="c.allowedFormats?.length" class="flex items-center gap-1">
              <FileText class="w-3 h-3" />
              {{ c.allowedFormats.join(', ').toUpperCase() }}
            </span>
          </div>
        </div>
      </button>
    </div>

    <!-- ═══════════════════════ MODAL ═══════════════════════ -->
    <Teleport to="body">
      <div v-if="modalOpen && selected" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-panel">

          <!-- Modal Header -->
          <div class="modal-header">
            <div>
              <span class="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Yarışma İnceleme</span>
              <h2 class="text-xl font-bold text-[hsl(var(--foreground))] mt-0.5">{{ selected.title }}</h2>
            </div>
            <button @click="closeModal" class="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Cover image -->
          <div v-if="selected.coverImage" class="modal-cover">
            <img :src="selected.coverImage" :alt="selected.title" class="w-full h-full object-cover" />
            <div class="modal-cover-overlay">
              <span class="category-pill-lg">{{ categoryLabel(selected.category ?? '') }}</span>
            </div>
          </div>

          <div class="modal-body">

            <!-- Organizer info -->
            <div class="info-row">
              <div class="info-avatar">{{ (selected.createdBy.displayName || selected.createdBy.username)[0].toUpperCase() }}</div>
              <div>
                <p class="text-sm font-semibold text-[hsl(var(--foreground))]">{{ selected.createdBy.displayName || selected.createdBy.username }}</p>
                <p class="text-xs text-[hsl(var(--muted-foreground))]">@{{ selected.createdBy.username }} · {{ selected.createdBy.globalRole }}</p>
              </div>
              <span class="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{{ timeAgo(selected.createdAt) }}</span>
            </div>

            <!-- Description -->
            <section class="detail-section">
              <h3 class="section-title">Açıklama</h3>
              <p class="text-sm text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-line">{{ selected.description }}</p>
            </section>

            <!-- Dates timeline -->
            <section class="detail-section">
              <button class="collapsible-btn" @click="toggleSection('dates')">
                <span class="section-title">📅 Tarihler</span>
                <ChevronDown v-if="expandedSection !== 'dates'" class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <ChevronUp v-else class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </button>
              <div v-if="expandedSection === 'dates'" class="timeline-grid mt-3">
                <div class="timeline-item">
                  <span class="timeline-label">Başvuru Başlangıç</span>
                  <span class="timeline-value">{{ formatDate(selected.applicationStart) }}</span>
                </div>
                <div class="timeline-item">
                  <span class="timeline-label">Başvuru Bitiş</span>
                  <span class="timeline-value">{{ formatDate(selected.applicationEnd) }}</span>
                </div>
                <div class="timeline-item" v-if="selected.topicRevealAt">
                  <span class="timeline-label">Konu Açıklama</span>
                  <span class="timeline-value">{{ formatDate(selected.topicRevealAt) }}</span>
                </div>
                <div class="timeline-item">
                  <span class="timeline-label">Gönderim Başlangıç</span>
                  <span class="timeline-value">{{ formatDate(selected.submissionStart) }}</span>
                </div>
                <div class="timeline-item">
                  <span class="timeline-label">Gönderim Bitiş</span>
                  <span class="timeline-value">{{ formatDate(selected.submissionEnd) }}</span>
                </div>
                <div class="timeline-item">
                  <span class="timeline-label">Değerlendirme Başlangıç</span>
                  <span class="timeline-value">{{ formatDate(selected.judgingStart) }}</span>
                </div>
                <div class="timeline-item">
                  <span class="timeline-label">Değerlendirme Bitiş</span>
                  <span class="timeline-value">{{ formatDate(selected.judgingEnd) }}</span>
                </div>
              </div>
            </section>

            <!-- Topic -->
            <section v-if="selected.topic" class="detail-section">
              <button class="collapsible-btn" @click="toggleSection('topic')">
                <span class="section-title">🎯 Konu</span>
                <ChevronDown v-if="expandedSection !== 'topic'" class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <ChevronUp v-else class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </button>
              <p v-if="expandedSection === 'topic'" class="text-sm text-[hsl(var(--foreground))] mt-3 leading-relaxed whitespace-pre-line">{{ selected.topic }}</p>
            </section>

            <!-- Rules -->
            <section v-if="selected.rules" class="detail-section">
              <button class="collapsible-btn" @click="toggleSection('rules')">
                <span class="section-title">📋 Kurallar</span>
                <ChevronDown v-if="expandedSection !== 'rules'" class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <ChevronUp v-else class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </button>
              <p v-if="expandedSection === 'rules'" class="text-sm text-[hsl(var(--foreground))] mt-3 leading-relaxed whitespace-pre-line">{{ selected.rules }}</p>
            </section>

            <!-- Prizes -->
            <section v-if="selected.prizes" class="detail-section">
              <button class="collapsible-btn" @click="toggleSection('prizes')">
                <span class="section-title">🏆 Ödüller</span>
                <ChevronDown v-if="expandedSection !== 'prizes'" class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <ChevronUp v-else class="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </button>
              <p v-if="expandedSection === 'prizes'" class="text-sm text-[hsl(var(--foreground))] mt-3 leading-relaxed whitespace-pre-line">{{ selected.prizes }}</p>
            </section>

            <!-- Settings summary -->
            <section class="detail-section">
              <h3 class="section-title">⚙️ Ayarlar</h3>
              <div class="settings-grid mt-2">
                <div class="setting-item">
                  <span class="setting-label">Onay Modu</span>
                  <span class="setting-value">{{ selected.approvalMode === 'AUTO' ? 'Otomatik Kabul' : 'Manuel Onay' }}</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">Maks. Katılımcı</span>
                  <span class="setting-value">{{ selected.maxParticipants ?? 'Sınırsız' }}</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">Maks. Dosya Boyutu</span>
                  <span class="setting-value">{{ formatBytes(selected.maxFileSize) }}</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">İzin Verilen Formatlar</span>
                  <span class="setting-value">{{ selected.allowedFormats?.join(', ').toUpperCase() || '—' }}</span>
                </div>
              </div>
            </section>

            <!-- Jury members -->
            <section v-if="selected.members?.filter(m => m.role === 'JURY').length" class="detail-section">
              <h3 class="section-title">⚖️ Jüri Üyeleri</h3>
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="m in selected.members.filter(m => m.role === 'JURY')"
                  :key="m.user.id"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--foreground))]"
                >
                  <span class="w-5 h-5 rounded-full bg-[hsl(var(--brand))] text-white flex items-center justify-center text-[10px] font-bold">
                    {{ (m.user.displayName || m.user.username)[0].toUpperCase() }}
                  </span>
                  {{ m.user.displayName || m.user.username }}
                </span>
              </div>
            </section>

            <!-- Admin note -->
            <section class="detail-section">
              <h3 class="section-title mb-2">
                Not
                <span class="text-xs font-normal text-[hsl(var(--muted-foreground))] ml-1">(Red için zorunlu)</span>
              </h3>
              <textarea
                v-model="noteInput"
                placeholder="Admin notu ekleyin... Red sebebi veya onay notu."
                class="note-textarea"
                rows="3"
              />
            </section>

            <!-- Error in modal -->
            <div v-if="error" class="px-4 py-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm">{{ error }}</div>

          </div>

          <!-- Modal footer: actions -->
          <div class="modal-footer">
            <button @click="closeModal" class="btn-cancel">İptal</button>
            <div class="flex gap-3">
              <button
                @click="reject"
                :disabled="submitting"
                class="btn-reject"
              >
                <XCircle class="w-4 h-4" />
                {{ submitting ? 'Reddetiliyor...' : 'Reddet' }}
              </button>
              <button
                @click="approve"
                :disabled="submitting"
                class="btn-approve"
              >
                <CheckCircle class="w-4 h-4" />
                {{ submitting ? 'Onaylanıyor...' : 'Onayla' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Cards */
.contest-card {
  display: flex;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.contest-card:hover {
  border-color: hsl(var(--brand) / 0.5);
  box-shadow: 0 4px 16px hsl(var(--brand) / 0.08);
}

.cover-strip {
  width: 120px;
  flex-shrink: 0;
  background: hsl(var(--muted));
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, transparent, hsl(var(--background) / 0.2));
}
.category-pill {
  position: relative;
  z-index: 1;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: hsl(var(--brand));
  color: white;
}

.card-content { flex: 1; padding: 1rem 1.25rem; min-width: 0; }

.pending-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  background: hsl(var(--brand) / 0.1);
  color: hsl(var(--brand));
  border: 1px solid hsl(var(--brand) / 0.2);
  flex-shrink: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-panel {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
  flex-shrink: 0;
}

.modal-cover {
  height: 180px;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  background: hsl(var(--muted));
}
.modal-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  display: flex;
  align-items: flex-end;
  padding: 1rem 1.5rem;
}
.category-pill-lg {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  background: hsl(var(--brand));
  color: white;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid hsl(var(--border));
  margin-bottom: 0.5rem;
}
.info-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: hsl(var(--brand));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.detail-section {
  padding: 1rem 0;
  border-bottom: 1px solid hsl(var(--border));
}
.detail-section:last-child { border-bottom: none; }

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--muted-foreground));
  display: block;
  margin-bottom: 0.5rem;
}

.collapsible-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.collapsible-btn:hover .section-title { color: hsl(var(--foreground)); }

.timeline-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.6rem 0.75rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: 8px;
}
.timeline-label { font-size: 0.7rem; color: hsl(var(--muted-foreground)); font-weight: 500; }
.timeline-value { font-size: 0.8rem; color: hsl(var(--foreground)); font-weight: 600; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.setting-label { font-size: 0.7rem; color: hsl(var(--muted-foreground)); }
.setting-value { font-size: 0.8rem; color: hsl(var(--foreground)); font-weight: 600; }

.note-textarea {
  width: 100%;
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: hsl(var(--foreground));
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.15s;
  outline: none;
}
.note-textarea:focus { border-color: hsl(var(--brand)); }

/* Modal footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid hsl(var(--border));
  flex-shrink: 0;
  background: hsl(var(--background));
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  background: transparent;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }

.btn-reject {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-reject:hover:not(:disabled) { background: rgba(239, 68, 68, 0.2); }
.btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-approve {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  border: none;
  background: hsl(var(--brand));
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-approve:hover:not(:disabled) { opacity: 0.9; }
.btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
