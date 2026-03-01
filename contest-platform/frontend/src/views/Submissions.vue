<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { FileText, Trophy, Clock, CheckCircle, XCircle, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-vue-next';

const router = useRouter();
const { t } = useI18n();

interface Score {
  score: number;
  comment?: string;
  jury: { id: string; username: string; displayName?: string };
}

interface Submission {
  id: string;
  title: string;
  description?: string;
  link?: string;
  createdAt: string;
  contest: {
    id: string;
    title: string;
    slug: string;
    status: string;
    category: string;
    coverImage?: string;
  };
  scores: Score[];
  _count: { scores: number };
}

const loading = ref(true);
const submissions = ref<Submission[]>([]);
const expandedId = ref<string | null>(null);
const filter = ref<'all' | 'active' | 'finalized'>('all');

const filtered = computed(() => {
  if (filter.value === 'active') return submissions.value.filter(s => !['FINALIZED','COMPLETED'].includes(s.contest.status));
  if (filter.value === 'finalized') return submissions.value.filter(s => ['FINALIZED','COMPLETED'].includes(s.contest.status));
  return submissions.value;
});

function avgScore(scores: Score[]): string {
  if (!scores.length) return '—';
  return (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(1);
}

function isFinalized(s: Submission) {
  return ['FINALIZED', 'COMPLETED'].includes(s.contest.status);
}

const statusConfig = computed(() => {
  return (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      DRAFT:              { label: t('submissions.status_draft'), color: '#6b7280' },
      PENDING_APPROVAL:   { label: t('submissions.status_pending'), color: '#f59e0b' },
      APPROVED:           { label: t('submissions.status_approved'), color: '#10b981' },
      APPLICATIONS:       { label: t('submissions.status_applications'), color: '#3b82f6' },
      ACTIVE:             { label: t('submissions.status_active'), color: '#8b5cf6' },
      SUBMISSION_CLOSED:  { label: t('submissions.status_closed'), color: '#f59e0b' },
      JUDGING:            { label: t('submissions.status_judging'), color: '#ec4899' },
      FINALIZED:          { label: t('submissions.status_finalized'), color: '#10b981' },
      COMPLETED:          { label: t('submissions.status_completed'), color: '#6b7280' },
      CANCELLED:          { label: t('submissions.status_cancelled'), color: '#ef4444' },
    };
    return map[status] ?? { label: status, color: '#6b7280' };
  };
});

function categoryLabel(cat: string) {
  const m: Record<string, string> = { game_jam: '🎮 Game Jam', art_contest: '🎨 Art', music_contest: '🎵 Müzik', hackathon: '💻 Hackathon', design: '✏️ Tasarım', other: '📦 Diğer' };
  return m[cat] ?? cat;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/users/me/submissions');
    submissions.value = data;
  } catch {
    // silently fail — placeholder shown
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="subs-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('submissions.title') }}</h1>
        <p class="page-subtitle">{{ t('submissions.subtitle') }}</p>
      </div>
      <div class="header-stat">
        <span class="stat-num">{{ submissions.length }}</span>
        <span class="stat-lbl">{{ t('submissions.total_works') }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-tabs">
      <button v-for="f in [
        { key: 'all',       label: t('submissions.filter_all') },
        { key: 'active',    label: t('submissions.filter_active') },
        { key: 'finalized', label: t('submissions.filter_finalized') },
      ]" :key="f.key"
        :class="['tab', filter === f.key && 'tab--active']"
        @click="filter = f.key as any"
      >{{ f.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="empty-state">
      <FileText class="empty-icon" />
      <p class="empty-title">
        {{ filter === 'all' ? t('submissions.no_submissions') : t('submissions.no_submissions_category') }}
      </p>
      <button @click="router.push('/contests')" class="btn btn--primary">{{ t('submissions.browse_contests') }}</button>
    </div>

    <!-- List -->
    <div v-else class="sub-list">
      <div v-for="s in filtered" :key="s.id" class="sub-card">
        <!-- Contest cover strip -->
        <div
          class="card-cover"
          :style="s.contest.coverImage ? `background-image: url(${s.contest.coverImage})` : ''"
        >
          <div class="cover-overlay" />
          <div class="cover-content">
            <span class="contest-category">{{ categoryLabel(s.contest.category) }}</span>
            <span
              class="contest-status"
              :style="{ background: statusConfig(s.contest.status).color + '22', color: statusConfig(s.contest.status).color, borderColor: statusConfig(s.contest.status).color + '44' }"
            >{{ statusConfig(s.contest.status).label }}</span>
          </div>
        </div>

        <!-- Main body -->
        <div class="card-body">
          <div class="card-top">
            <div class="card-info">
              <p class="contest-title" @click="router.push(`/contests/${s.contest.slug}`)" style="cursor:pointer">
                {{ s.contest.title }}
              </p>
              <h3 class="sub-title">{{ s.title }}</h3>
              <p class="sub-date">
                <Clock class="w-3.5 h-3.5" />
                {{ formatDate(s.createdAt) }}
              </p>
            </div>

            <!-- Score badge -->
            <div v-if="isFinalized(s)" class="score-badge" :class="s.scores.length ? 'score-badge--rated' : 'score-badge--empty'">
              <Star class="w-4 h-4" />
              <span>{{ avgScore(s.scores) }}</span>
              <small v-if="s.scores.length">/ 10</small>
              <small v-else>puan yok</small>
            </div>
            <div v-else class="score-badge score-badge--pending">
              <Clock class="w-4 h-4" />
              <span>Değerlendiriliyor</span>
            </div>
          </div>

          <!-- Actions row -->
          <div class="card-actions">
            <a v-if="s.link" :href="s.link" target="_blank" rel="noopener" class="btn btn--ghost btn--sm">
              <ExternalLink class="w-3.5 h-3.5" /> Eseri Gör
            </a>
            <button
              @click="router.push(`/contests/${s.contest.slug}`)"
              class="btn btn--ghost btn--sm"
            >
              <Trophy class="w-3.5 h-3.5" /> Yarışmaya Git
            </button>
            <button
              v-if="isFinalized(s) && s.scores.length"
              @click="toggleExpand(s.id)"
              class="btn btn--ghost btn--sm ml-auto"
            >
              Jüri Yorumları
              <ChevronUp v-if="expandedId === s.id" class="w-3.5 h-3.5" />
              <ChevronDown v-else class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Jury scores expanded -->
          <div v-if="expandedId === s.id && s.scores.length" class="scores-panel">
            <div v-for="sc in s.scores" :key="sc.jury.id" class="score-row">
              <div class="jury-avatar">{{ (sc.jury.displayName || sc.jury.username)[0].toUpperCase() }}</div>
              <div class="score-info">
                <span class="jury-name">{{ sc.jury.displayName || sc.jury.username }}</span>
                <p v-if="sc.comment" class="score-comment">{{ sc.comment }}</p>
                <p v-else class="score-comment score-comment--empty">Yorum yok</p>
              </div>
              <div class="score-val" :style="{ color: sc.score >= 7 ? '#10b981' : sc.score >= 5 ? '#f59e0b' : '#ef4444' }">
                {{ sc.score }}<small>/10</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subs-page { max-width: 800px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.2rem; }
.header-stat { text-align: right; }
.stat-num { display: block; font-size: 2rem; font-weight: 700; color: hsl(var(--brand)); line-height: 1; }
.stat-lbl { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }

/* Tabs */
.filter-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.25rem; border-bottom: 1px solid hsl(var(--border)); }
.tab { padding: 0.55rem 1rem; background: none; border: none; border-bottom: 2px solid transparent; font-size: 0.875rem; font-weight: 500; color: hsl(var(--muted-foreground)); cursor: pointer; margin-bottom: -1px; transition: all 0.15s; }
.tab:hover { color: hsl(var(--foreground)); }
.tab--active { color: hsl(var(--foreground)); border-bottom-color: hsl(var(--brand)); }

/* States */
.loading-state { display: flex; justify-content: center; padding: 4rem; }
.spinner { width: 28px; height: 28px; border: 2px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 5rem 2rem; }
.empty-icon { width: 48px; height: 48px; color: hsl(var(--border)); margin: 0 auto 1rem; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 1.25rem; }

/* Cards */
.sub-list { display: flex; flex-direction: column; gap: 1rem; }
.sub-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 12px; overflow: hidden; transition: border-color 0.15s; }
.sub-card:hover { border-color: hsl(var(--brand) / 0.4); }

/* Cover strip */
.card-cover {
  height: 60px; background: hsl(var(--muted)); background-size: cover; background-position: center;
  position: relative;
}
.cover-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); }
.cover-content { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; height: 100%; }
.contest-category { font-size: 0.75rem; font-weight: 500; color: rgba(255,255,255,0.85); }
.contest-status { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid; }

/* Body */
.card-body { padding: 1rem 1.25rem; }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; }
.card-info { flex: 1; min-width: 0; }
.contest-title { font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-bottom: 0.2rem; }
.contest-title:hover { color: hsl(var(--brand)); }
.sub-title { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.25rem; }
.sub-date { font-size: 0.75rem; color: hsl(var(--muted-foreground)); display: flex; align-items: center; gap: 0.3rem; }

/* Score badge */
.score-badge { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.score-badge small { font-size: 0.7rem; font-weight: 400; }
.score-badge--rated { background: rgba(16,185,129,0.1); color: #10b981; }
.score-badge--pending { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); font-size: 0.75rem; font-weight: 500; }
.score-badge--empty { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }

/* Actions */
.card-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.ml-auto { margin-left: auto; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: all 0.15s; }
.btn--primary { background: hsl(var(--brand)); color: white; }
.btn--primary:hover { opacity: 0.9; }
.btn--ghost { background: transparent; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); }
.btn--ghost:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.btn--sm { padding: 0.35rem 0.7rem; font-size: 0.775rem; }

/* Scores panel */
.scores-panel { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid hsl(var(--border)); display: flex; flex-direction: column; gap: 0.5rem; }
.score-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.6rem; background: hsl(var(--muted) / 0.4); border-radius: 8px; }
.jury-avatar { width: 32px; height: 32px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
.score-info { flex: 1; min-width: 0; }
.jury-name { font-size: 0.8rem; font-weight: 600; color: hsl(var(--foreground)); }
.score-comment { font-size: 0.775rem; color: hsl(var(--muted-foreground)); margin-top: 0.15rem; }
.score-comment--empty { font-style: italic; }
.score-val { font-size: 1.1rem; font-weight: 700; flex-shrink: 0; }
.score-val small { font-size: 0.65rem; font-weight: 400; color: hsl(var(--muted-foreground)); }
</style>