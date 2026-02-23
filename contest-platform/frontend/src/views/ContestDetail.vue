<template>
  <div class="contest-detail">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Yükleniyor...</p>
    </div>

    <!-- Not found -->
    <div v-else-if="!contest" class="empty-state">
      <h2>Yarışma bulunamadı</h2>
      <router-link to="/contests" class="back-link">← Yarışmalara dön</router-link>
    </div>

    <template v-else>
      <!-- Hero / Cover -->
      <div class="hero">
        <div v-if="contest.coverImage" class="hero-cover">
          <img :src="contest.coverImage" :alt="contest.title" />
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badges">
            <span :class="['phase-badge', `phase-badge--${currentPhase}`]">{{ phaseLabel }}</span>
            <span v-if="contest.category" class="category-badge">{{ getCategoryIcon(contest.category) }} {{ getCategoryLabel(contest.category) }}</span>
          </div>
          <h1 class="hero-title">{{ contest.title }}</h1>
          <div class="hero-meta">
            <span class="meta-item">
              <User :size="14" />
              {{ contest.createdBy?.displayName || contest.createdBy?.username }}
            </span>
            <span class="meta-item" v-if="contest._count?.applications">
              <Users :size="14" />
              {{ contest._count.applications }} katılımcı
            </span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content-grid">
        <!-- Main -->
        <div class="main-col">
          <!-- Description -->
          <section class="section-card">
            <h2 class="section-title">Hakkında</h2>
            <p class="section-text">{{ contest.description }}</p>
          </section>

          <!-- Topic -->
          <section v-if="contest.topic && isTopicRevealed" class="section-card topic-card">
            <h2 class="section-title">🎯 Konu / Tema</h2>
            <p class="topic-text">{{ contest.topic }}</p>
          </section>
          <section v-else-if="contest.topicRevealAt && !isTopicRevealed" class="section-card topic-card topic-card--hidden">
            <h2 class="section-title">🔒 Konu Gizli</h2>
            <p class="section-text">Konu {{ formatDate(contest.topicRevealAt) }} tarihinde açıklanacak</p>
          </section>

          <!-- Rules -->
          <section v-if="contest.rules" class="section-card">
            <h2 class="section-title">📋 Kurallar</h2>
            <pre class="rules-text">{{ contest.rules }}</pre>
          </section>

          <!-- Prizes -->
          <section v-if="contest.prizes" class="section-card">
            <h2 class="section-title">🏆 Ödüller</h2>
            <pre class="prizes-text">{{ contest.prizes }}</pre>
          </section>

          <!-- Results (FINALIZED) -->
          <section v-if="contest.status === 'FINALIZED' || contest.status === 'COMPLETED'" class="section-card">
            <h2 class="section-title">🏆 Sonuçlar</h2>
            <div v-if="results.length === 0" class="text-muted">Sonuç henüz yayınlanmadı</div>
            <div v-else class="results-list">
              <div v-for="(r, i) in results" :key="r.id" :class="['result-item', i < 3 && 'result-item--top']">
                <span class="result-rank">{{ getRankEmoji(i) }} {{ r.rank || i + 1 }}.</span>
                <span class="result-name">{{ r.user?.displayName || r.user?.username }}</span>
                <span class="result-score">{{ r.finalScore?.toFixed(1) }} puan</span>
              </div>
            </div>
          </section>

          <!-- Submission Form (if active phase) -->
          <section v-if="canSubmit" class="section-card">
            <h2 class="section-title">📤 Eser Gönder</h2>
            <div class="submit-form">
              <div class="form-group">
                <label class="form-label">Eser Başlığı *</label>
                <input v-model="submission.title" type="text" class="form-input" placeholder="Eserinizin adı" />
              </div>
              <div class="form-group">
                <label class="form-label">Açıklama</label>
                <textarea v-model="submission.description" class="form-textarea" rows="3" placeholder="Eseriniz hakkında kısa bilgi"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Link (Drive, WeTransfer, Web)</label>
                <input v-model="submission.link" type="url" class="form-input" placeholder="https://drive.google.com/..." />
              </div>
              <button class="btn btn--submit" @click="submitWork" :disabled="submitting || !submission.title">
                {{ submitting ? 'Gönderiliyor...' : 'Gönder' }}
              </button>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="side-col">
          <!-- Timeline -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">⏱️ Zaman Çizelgesi</h3>
            <div class="timeline">
              <div v-for="phase in timelineItems" :key="phase.label" :class="['timeline-item', phase.active && 'timeline-item--active', phase.done && 'timeline-item--done']">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <span class="timeline-label">{{ phase.label }}</span>
                  <span class="timeline-date">{{ phase.date }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Apply Button -->
          <div class="sidebar-card" v-if="canApply">
            <button class="btn btn--apply" @click="applyToContest" :disabled="applying">
              {{ applying ? 'Başvuruluyor...' : '🎯 Başvur' }}
            </button>
            <p class="apply-hint">{{ contest.approvalMode === 'AUTO' ? 'Otomatik onay' : 'Organizatör onayı gerekir' }}</p>
          </div>

          <!-- Already Applied -->
          <div class="sidebar-card" v-if="applicationStatus">
            <div :class="['apply-status', `apply-status--${applicationStatus.toLowerCase()}`]">
              <span v-if="applicationStatus === 'APPROVED'">✅ Başvurunuz onaylandı</span>
              <span v-else-if="applicationStatus === 'PENDING'">⏳ Başvurunuz beklemede</span>
              <span v-else-if="applicationStatus === 'REJECTED'">❌ Başvurunuz reddedildi</span>
            </div>
          </div>

          <!-- Settings -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">ℹ️ Bilgiler</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-key">Katılımcı Limiti</span>
                <span class="info-val">{{ contest.maxParticipants || 'Sınırsız' }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Onay Modu</span>
                <span class="info-val">{{ contest.approvalMode === 'AUTO' ? 'Otomatik' : 'Manuel' }}</span>
              </div>
              <div class="info-row" v-if="contest.allowedFormats?.length">
                <span class="info-key">Format</span>
                <span class="info-val">{{ contest.allowedFormats.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import { User, Users } from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthStore();

const contest = ref<any>(null);
const loading = ref(true);
const results = ref<any[]>([]);
const applicationStatus = ref<string | null>(null);
const applying = ref(false);
const submitting = ref(false);

const submission = ref({ title: '', description: '', link: '' });

onMounted(async () => {
  try {
    const slug = route.params.slug as string;
    const { data } = await axios.get(`/api/contests/${slug}`);
    contest.value = data;

    // Check application status
    if (authStore.isAuthenticated && data.id) {
      try {
        const appRes = await axios.get(`/api/contests/${data.id}/my-application`);
        applicationStatus.value = appRes.data?.status || null;
      } catch { /* no application */ }
    }

    // Load results if finalized
    if (data.status === 'FINALIZED' || data.status === 'COMPLETED') {
      try {
        const resData = await axios.get(`/api/contests/${data.id}/results`);
        results.value = resData.data;
      } catch { /* no results */ }
    }
  } catch {
    contest.value = null;
  } finally {
    loading.value = false;
  }
});

// Phase logic
const currentPhase = computed(() => {
  if (!contest.value) return 'upcoming';
  const c = contest.value;
  const now = new Date();
  if (c.status === 'FINALIZED' || c.status === 'COMPLETED') return 'completed';
  if (c.status === 'JUDGING') return 'judging';
  if (c.status === 'ACTIVE' || c.status === 'SUBMISSION_CLOSED') return 'active';
  if (c.applicationEnd && new Date(c.applicationEnd) > now) return 'open';
  return 'upcoming';
});

const phaseLabel = computed(() => {
  const map: Record<string, string> = {
    open: '📋 Başvuru Açık', active: '🔥 Aktif', judging: '⚖️ Oylama', completed: '🏆 Tamamlandı', upcoming: '⏳ Yakında',
  };
  return map[currentPhase.value] || contest.value?.status;
});

const isTopicRevealed = computed(() => {
  if (!contest.value?.topicRevealAt) return !!contest.value?.topic;
  return new Date(contest.value.topicRevealAt) <= new Date();
});

const canApply = computed(() => {
  if (!authStore.isAuthenticated || !contest.value) return false;
  if (applicationStatus.value) return false;
  const c = contest.value;
  const now = new Date();
  if (c.applicationStart && new Date(c.applicationStart) > now) return false;
  if (c.applicationEnd && new Date(c.applicationEnd) < now) return false;
  return ['APPROVED', 'APPLICATIONS'].includes(c.status);
});

const canSubmit = computed(() => {
  if (!authStore.isAuthenticated || !contest.value) return false;
  if (applicationStatus.value !== 'APPROVED') return false;
  const c = contest.value;
  const now = new Date();
  if (c.submissionEnd && new Date(c.submissionEnd) < now) return false;
  return ['ACTIVE', 'APPROVED', 'APPLICATIONS'].includes(c.status);
});

// Timeline
const timelineItems = computed(() => {
  if (!contest.value) return [];
  const c = contest.value;
  const now = new Date();
  const items = [
    { label: 'Başvuru', date: formatDateRange(c.applicationStart, c.applicationEnd), active: false, done: false },
    { label: 'Konu Açıklanma', date: c.topicRevealAt ? formatDate(c.topicRevealAt) : '—', active: false, done: false },
    { label: 'Gönderim', date: formatDateRange(c.submissionStart, c.submissionEnd), active: false, done: false },
    { label: 'Oylama', date: formatDateRange(c.judgingStart, c.judgingEnd), active: false, done: false },
    { label: 'Sonuçlar', date: c.status === 'FINALIZED' ? '✅ Yayınlandı' : '—', active: false, done: false },
  ];

  // Mark phases
  if (c.applicationEnd && new Date(c.applicationEnd) < now) items[0].done = true;
  else if (c.applicationStart && new Date(c.applicationStart) <= now) items[0].active = true;

  if (c.topicRevealAt && new Date(c.topicRevealAt) <= now) items[1].done = true;

  if (c.submissionEnd && new Date(c.submissionEnd) < now) items[2].done = true;
  else if (c.submissionStart && new Date(c.submissionStart) <= now) items[2].active = true;

  if (c.judgingEnd && new Date(c.judgingEnd) < now) items[3].done = true;
  else if (c.judgingStart && new Date(c.judgingStart) <= now) items[3].active = true;

  if (c.status === 'FINALIZED' || c.status === 'COMPLETED') items[4].done = true;

  return items;
});

// Actions
async function applyToContest() {
  applying.value = true;
  try {
    const res = await axios.post(`/api/contests/${contest.value.id}/apply`);
    applicationStatus.value = res.data?.status || 'PENDING';
    showToast('Başvuru yapıldı!', 'success');
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Başvuru yapılamadı', 'error');
  } finally {
    applying.value = false;
  }
}

async function submitWork() {
  submitting.value = true;
  try {
    await axios.post(`/api/contests/${contest.value.id}/submit`, {
      title: submission.value.title,
      description: submission.value.description,
      link: submission.value.link,
    });
    showToast('Eser gönderildi!', 'success');
    submission.value = { title: '', description: '', link: '' };
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Gönderilemedi', 'error');
  } finally {
    submitting.value = false;
  }
}

// Helpers
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateRange(start: string, end: string) {
  if (!start && !end) return '—';
  return `${formatDate(start)} → ${formatDate(end)}`;
}

function getCategoryIcon(cat: string) {
  const m: Record<string, string> = { game_jam: '🎮', art_contest: '🎨', music_contest: '🎵', hackathon: '💻', design: '✏️' };
  return m[cat] || '📦';
}

function getCategoryLabel(cat: string) {
  const m: Record<string, string> = { game_jam: 'Game Jam', art_contest: 'Art Contest', music_contest: 'Müzik', hackathon: 'Hackathon', design: 'Tasarım' };
  return m[cat] || cat;
}

function getRankEmoji(i: number) {
  return ['🥇', '🥈', '🥉'][i] || '';
}
</script>

<style scoped>
.contest-detail { max-width: 1100px; margin: 0 auto; }

/* Loading / Empty */
.loading-state { text-align: center; padding: 4rem; color: hsl(var(--muted-foreground)); }
.spinner { width: 32px; height: 32px; border: 3px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 4rem; }
.back-link { color: hsl(var(--brand)); text-decoration: none; margin-top: 1rem; display: inline-block; }

/* Hero */
.hero { position: relative; border-radius: 16px; overflow: hidden; margin-bottom: 2rem; min-height: 220px; display: flex; align-items: flex-end; background: linear-gradient(135deg, hsl(var(--brand) / 0.1), hsl(var(--brand) / 0.05)); }
.hero-cover { position: absolute; inset: 0; }
.hero-cover img { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75), transparent); }
.hero-content { position: relative; z-index: 1; padding: 2rem; width: 100%; }
.hero-badges { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }

.phase-badge { padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.phase-badge--open { background: rgba(16,185,129,0.9); color: white; }
.phase-badge--active { background: rgba(59,130,246,0.9); color: white; }
.phase-badge--judging { background: rgba(139,92,246,0.9); color: white; }
.phase-badge--completed { background: rgba(34,197,94,0.9); color: white; }
.phase-badge--upcoming { background: rgba(245,158,11,0.9); color: white; }

.category-badge { padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(8px); }

.hero-title { font-size: 2rem; font-weight: 700; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.hero-meta { display: flex; gap: 1.5rem; margin-top: 0.75rem; }
.meta-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: rgba(255,255,255,0.8); }

/* Content Grid */
.content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }

/* Section cards */
.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
.section-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.75rem; }
.section-text { font-size: 0.9rem; color: hsl(var(--muted-foreground)); line-height: 1.7; white-space: pre-line; }

.topic-card { border-color: hsl(var(--brand) / 0.3); background: hsl(var(--brand) / 0.03); }
.topic-card--hidden { border-style: dashed; }
.topic-text { font-size: 1.2rem; font-weight: 600; color: hsl(var(--brand)); }

.rules-text, .prizes-text { font-size: 0.875rem; color: hsl(var(--foreground)); line-height: 1.8; white-space: pre-line; font-family: inherit; background: none; border: none; margin: 0; padding: 0; }

/* Results */
.results-list { display: flex; flex-direction: column; gap: 0.5rem; }
.result-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 8px; background: hsl(var(--muted) / 0.5); }
.result-item--top { background: hsl(var(--brand) / 0.05); border: 1px solid hsl(var(--brand) / 0.15); }
.result-rank { font-weight: 700; font-size: 0.9rem; min-width: 60px; }
.result-name { flex: 1; font-weight: 500; }
.result-score { font-weight: 600; color: hsl(var(--brand)); }

/* Submission form */
.submit-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-label { font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); }
.form-input, .form-textarea { padding: 0.6rem 0.8rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.85rem; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: hsl(var(--brand)); }
.form-textarea { resize: vertical; font-family: inherit; }

/* Sidebar */
.sidebar-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
.sidebar-title { font-size: 0.95rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 1rem; }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; gap: 0.75rem; padding: 0.5rem 0; position: relative; }
.timeline-item::before { content: ''; position: absolute; left: 5px; top: 1.5rem; bottom: -0.5rem; width: 2px; background: hsl(var(--border)); }
.timeline-item:last-child::before { display: none; }
.timeline-dot { width: 12px; height: 12px; border-radius: 50%; background: hsl(var(--border)); flex-shrink: 0; margin-top: 0.2rem; position: relative; z-index: 1; }
.timeline-item--active .timeline-dot { background: hsl(var(--brand)); box-shadow: 0 0 0 4px hsl(var(--brand) / 0.2); }
.timeline-item--done .timeline-dot { background: #10b981; }
.timeline-item--done::before { background: #10b981; }
.timeline-content { min-width: 0; }
.timeline-label { display: block; font-size: 0.8rem; font-weight: 600; color: hsl(var(--foreground)); }
.timeline-date { display: block; font-size: 0.7rem; color: hsl(var(--muted-foreground)); margin-top: 0.15rem; }

/* Buttons */
.btn { padding: 0.65rem 1.25rem; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn--apply { width: 100%; background: hsl(var(--brand)); color: white; font-size: 1rem; }
.btn--apply:hover { opacity: 0.9; }
.btn--apply:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--submit { background: #059669; color: white; align-self: flex-start; }
.btn--submit:hover { background: #047857; }
.btn--submit:disabled { opacity: 0.5; cursor: not-allowed; }

.apply-hint { text-align: center; font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-top: 0.5rem; }

.apply-status { padding: 0.75rem; border-radius: 8px; text-align: center; font-size: 0.85rem; font-weight: 600; }
.apply-status--approved { background: #d1fae5; color: #065f46; }
.apply-status--pending { background: #fef3c7; color: #92400e; }
.apply-status--rejected { background: #fee2e2; color: #991b1b; }

/* Info list */
.info-list { display: flex; flex-direction: column; gap: 0.5rem; }
.info-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
.info-key { color: hsl(var(--muted-foreground)); }
.info-val { font-weight: 600; color: hsl(var(--foreground)); }

.text-muted { color: hsl(var(--muted-foreground)); font-size: 0.85rem; }

@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 1.5rem; }
}
</style>