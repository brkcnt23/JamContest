<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { Trophy, ExternalLink, User, RefreshCw, Loader } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

interface Submission {
  id: string;
  title: string;
  description?: string;
  link?: string;
  createdAt: string;
  user: { id: string; username: string; displayName?: string; avatar?: string };
  contest: { id: string; title: string; slug: string; category: string; status: string };
  files?: { id: string; filename: string; originalName: string; mimeType: string }[];
  _count: { scores: number };
}

const feed = ref<Submission[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const skip = ref(0);
const TAKE = 20;
const activeCategory = ref('');

const categories = [
  { key: '', label: 'Tümü' },
  { key: 'game_jam',     label: '🎮 Game Jam' },
  { key: 'art_contest',  label: '🎨 Art' },
  { key: 'hackathon',    label: '💻 Hackathon' },
  { key: 'design',       label: '✏️ Tasarım' },
  { key: 'music_contest',label: '🎵 Müzik' },
  { key: 'other',        label: '📦 Diğer' },
];

const statusLabel: Record<string, { text: string; color: string }> = {
  ACTIVE:            { text: 'Aktif',          color: '#8b5cf6' },
  SUBMISSION_CLOSED: { text: 'Kapandı',         color: '#f59e0b' },
  JUDGING:           { text: 'Değerlendirme',   color: '#ec4899' },
  FINALIZED:         { text: 'Sonuçlandı',      color: '#10b981' },
  COMPLETED:         { text: 'Tamamlandı',      color: '#6b7280' },
};

async function load(reset = false) {
  if (reset) { feed.value = []; skip.value = 0; hasMore.value = true; loading.value = true; }
  else if (!hasMore.value) return;

  try {
    const params: Record<string, any> = { take: TAKE, skip: skip.value };
    if (activeCategory.value) params.category = activeCategory.value;
    const { data } = await axios.get('/api/social/feed', { params });
    if (reset) feed.value = data;
    else feed.value.push(...data);
    skip.value += data.length;
    hasMore.value = data.length === TAKE;
  } catch { /* silent */ }
  finally { loading.value = false; loadingMore.value = false; }
}

function setCategory(cat: string) {
  activeCategory.value = cat;
  load(true);
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa önce`;
  return `${Math.floor(h / 24)}g önce`;
}

function avatar(u: Submission['user']): string {
  return (u.displayName || u.username)[0].toUpperCase();
}

function firstImage(s: Submission) {
  return s.files?.find(f => f.mimeType.startsWith('image/')) ?? null;
}

// Infinite scroll
let observer: IntersectionObserver | null = null;
const sentinel = ref<HTMLElement | null>(null);

function setupObserver() {
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore.value && !loadingMore.value && !loading.value) {
      loadingMore.value = true;
      load();
    }
  }, { threshold: 0.1 });
  if (sentinel.value) observer.observe(sentinel.value);
}

onMounted(async () => {
  await load(true);
  setupObserver();
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
  <div class="social-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Social Feed</h1>
        <p class="page-subtitle">Sanatçıların son eserleri</p>
      </div>
      <button class="icon-btn" @click="load(true)" :disabled="loading" title="Yenile">
        <RefreshCw class="w-4 h-4" :class="loading && 'spin'" />
      </button>
    </div>

    <!-- Category filter -->
    <div class="cat-filter">
      <button
        v-for="c in categories"
        :key="c.key"
        :class="['cat-btn', activeCategory === c.key && 'cat-btn--active']"
        @click="setCategory(c.key)"
      >{{ c.label }}</button>
    </div>

    <!-- Loading initial -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
    </div>

    <!-- Empty -->
    <div v-else-if="feed.length === 0" class="empty-state">
      <Trophy class="empty-icon" />
      <p class="empty-title">Henüz eser yok</p>
      <p class="empty-sub">Yarışmalara katılın ve eserlerinizi gönderin</p>
      <button @click="router.push('/contests')" class="btn btn--primary">Yarışmalara Göz At</button>
    </div>

    <!-- Feed grid -->
    <div v-else class="feed-grid">
      <div
        v-for="s in feed"
        :key="s.id"
        class="feed-card"
      >
        <!-- Card header: user info -->
        <div class="card-header">
          <div class="user-row" @click="router.push(`/user/${s.user.id}`)">
            <div class="user-avatar">{{ avatar(s.user) }}</div>
            <div class="user-info">
              <p class="user-name">{{ s.user.displayName || s.user.username }}</p>
              <p class="user-handle">@{{ s.user.username }}</p>
            </div>
          </div>
          <span class="time-ago">{{ timeAgo(s.createdAt) }}</span>
        </div>

        <!-- Contest badge -->
        <div class="contest-badge" @click="router.push(`/contests/${s.contest.slug}`)">
          <Trophy class="w-3.5 h-3.5" />
          <span>{{ s.contest.title }}</span>
          <span
            class="status-pill"
            :style="{ background: (statusLabel[s.contest.status]?.color ?? '#6b7280') + '22', color: statusLabel[s.contest.status]?.color ?? '#6b7280' }"
          >{{ statusLabel[s.contest.status]?.text ?? s.contest.status }}</span>
        </div>

        <!-- Thumbnail -->
        <div
          v-if="firstImage(s)"
          class="card-thumbnail"
          @click="s.link && window.open(s.link, '_blank')"
        >
          <img
            :src="`/api/uploads/file/${firstImage(s)!.id}`"
            :alt="s.title"
            class="thumb-img"
            loading="lazy"
            @error="($event.target as HTMLImageElement).closest('.card-thumbnail')!.style.display='none'"
          />
        </div>

        <!-- Submission content -->
        <div class="card-body">
          <h3 class="sub-title">{{ s.title }}</h3>
          <p v-if="s.description" class="sub-desc">{{ s.description }}</p>
        </div>

        <!-- Footer -->
        <div class="card-footer">
          <span class="score-info">
            <span class="score-dot" />
            {{ s._count.scores }} jüri puanı
          </span>
          <div class="card-actions">
            <a
              v-if="s.link"
              :href="s.link"
              target="_blank"
              rel="noopener"
              class="btn btn--ghost btn--sm"
              @click.stop
            >
              <ExternalLink class="w-3.5 h-3.5" /> Eseri Gör
            </a>
            <button
              v-if="authStore.isAuthenticated && s.user.id !== authStore.user?.id"
              class="btn btn--ghost btn--sm"
              @click="router.push(`/messages?with=${s.user.id}`)"
            >
              <User class="w-3.5 h-3.5" /> Mesaj
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinel" class="sentinel">
      <div v-if="loadingMore" class="load-more">
        <Loader class="w-5 h-5 spin" />
      </div>
      <p v-else-if="!hasMore && feed.length > 0" class="end-text">Tüm eserler yüklendi</p>
    </div>
  </div>
</template>

<style scoped>
.social-page { max-width: 900px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.2rem; }

.icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid hsl(var(--border)); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: hsl(var(--muted-foreground)); transition: all 0.15s; }
.icon-btn:hover:not(:disabled) { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Category filter */
.cat-filter { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.cat-btn { padding: 0.35rem 0.85rem; border: 1px solid hsl(var(--border)); border-radius: 9999px; background: hsl(var(--background)); color: hsl(var(--muted-foreground)); font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.cat-btn:hover { border-color: hsl(var(--brand)); color: hsl(var(--foreground)); }
.cat-btn--active { background: hsl(var(--brand)); color: white; border-color: hsl(var(--brand)); }

/* States */
.loading-state { display: flex; justify-content: center; padding: 4rem; }
.spinner { width: 28px; height: 28px; border: 2px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 5rem 2rem; }
.empty-icon { width: 48px; height: 48px; color: hsl(var(--border)); margin: 0 auto 1rem; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.4rem; }
.empty-sub { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-bottom: 1.5rem; }

/* Feed grid */
.feed-grid { display: flex; flex-direction: column; gap: 1rem; }

.feed-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 12px; overflow: hidden; transition: border-color 0.15s; }
.feed-card:hover { border-color: hsl(var(--brand) / 0.4); }

/* Card header */
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem 0.75rem; }
.user-row { display: flex; align-items: center; gap: 0.7rem; cursor: pointer; }
.user-row:hover .user-name { color: hsl(var(--brand)); }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.875rem; font-weight: 600; color: hsl(var(--foreground)); transition: color 0.15s; }
.user-handle { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
.time-ago { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }

/* Contest badge */
.contest-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 1.25rem; background: hsl(var(--muted) / 0.5); font-size: 0.775rem; color: hsl(var(--muted-foreground)); cursor: pointer; transition: background 0.15s; }
.contest-badge:hover { background: hsl(var(--muted)); color: hsl(var(--brand)); }
.contest-badge span:first-of-type { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.status-pill { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 9999px; flex-shrink: 0; }

/* Body */
.card-body { padding: 0.875rem 1.25rem; }
.sub-title { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.35rem; }
.sub-desc { font-size: 0.825rem; color: hsl(var(--muted-foreground)); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

/* Footer */
.card-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; border-top: 1px solid hsl(var(--border)); }
.score-info { display: flex; align-items: center; gap: 0.4rem; font-size: 0.775rem; color: hsl(var(--muted-foreground)); }
.score-dot { width: 6px; height: 6px; border-radius: 50%; background: hsl(var(--brand)); }
.card-actions { display: flex; gap: 0.5rem; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: all 0.15s; }
.btn--primary { background: hsl(var(--brand)); color: white; }
.btn--primary:hover { opacity: 0.9; }
.btn--ghost { background: transparent; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); }
.btn--ghost:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.btn--sm { padding: 0.35rem 0.7rem; font-size: 0.775rem; }

/* Infinite scroll */
.sentinel { padding: 1.5rem; display: flex; justify-content: center; }
.load-more { display: flex; align-items: center; gap: 0.5rem; color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
.end-text { font-size: 0.8rem; color: hsl(var(--muted-foreground)); }

/* Thumbnails */
.card-thumbnail { max-height: 320px; overflow: hidden; cursor: pointer; background: hsl(var(--muted)); }
.thumb-img { width: 100%; max-height: 320px; object-fit: cover; display: block; transition: transform 0.2s; }
.feed-card:hover .thumb-img { transform: scale(1.02); }
</style>