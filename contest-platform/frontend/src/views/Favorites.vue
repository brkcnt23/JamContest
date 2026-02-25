<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Heart, Trophy, Users, Calendar, ArrowRight, Search, X } from 'lucide-vue-next';

const router = useRouter();

interface Contest {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  status: string;
  coverImage?: string;
  applicationStart?: string;
  applicationEnd?: string;
  submissionEnd?: string;
  createdBy: { id: string; username: string; displayName?: string };
  _count: { applications: number; submissions: number };
}

interface Favorite {
  id: string;
  contestId: string;
  createdAt: string;
  contest: Contest;
}

const loading = ref(true);
const favorites = ref<Favorite[]>([]);
const removingId = ref<string | null>(null);
const search = ref('');

const filtered = computed(() => {
  if (!search.value.trim()) return favorites.value;
  const q = search.value.toLowerCase();
  return favorites.value.filter(f =>
    f.contest.title.toLowerCase().includes(q) ||
    f.contest.description?.toLowerCase().includes(q)
  );
});

async function load() {
  try {
    const { data } = await axios.get('/api/users/me/favorites');
    favorites.value = data;
  } catch { /* silent */ }
  finally { loading.value = false; }
}

async function remove(contestId: string, e: Event) {
  e.stopPropagation();
  removingId.value = contestId;
  try {
    await axios.delete(`/api/users/me/favorites/${contestId}`);
    favorites.value = favorites.value.filter(f => f.contestId !== contestId);
  } catch { /* silent */ }
  finally { removingId.value = null; }
}

function statusConfig(status: string) {
  const m: Record<string, { label: string; color: string }> = {
    APPLICATIONS:      { label: 'Başvuru Açık',    color: '#3b82f6' },
    ACTIVE:            { label: 'Aktif',            color: '#8b5cf6' },
    SUBMISSION_CLOSED: { label: 'Gönderim Kapandı', color: '#f59e0b' },
    JUDGING:           { label: 'Değerlendirme',    color: '#ec4899' },
    FINALIZED:         { label: 'Sonuçlandı',       color: '#10b981' },
    COMPLETED:         { label: 'Tamamlandı',       color: '#6b7280' },
    DRAFT:             { label: 'Taslak',           color: '#6b7280' },
    PENDING_APPROVAL:  { label: 'Onay Bekliyor',    color: '#f59e0b' },
    APPROVED:          { label: 'Onaylandı',        color: '#10b981' },
    CANCELLED:         { label: 'İptal',            color: '#ef4444' },
  };
  return m[status] ?? { label: status, color: '#6b7280' };
}

function categoryIcon(cat: string) {
  const m: Record<string, string> = { game_jam: '🎮', art_contest: '🎨', music_contest: '🎵', hackathon: '💻', design: '✏️', other: '📦' };
  return m[cat] ?? '📦';
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

onMounted(load);
</script>

<template>
  <div class="fav-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Favorilerim</h1>
        <p class="page-subtitle">Kaydettiğiniz yarışmalar</p>
      </div>
      <span v-if="favorites.length" class="count-badge">{{ favorites.length }}</span>
    </div>

    <!-- Search -->
    <div v-if="favorites.length" class="search-box">
      <Search class="search-icon" />
      <input v-model="search" type="text" placeholder="Yarışma ara..." class="search-input" />
      <button v-if="search" @click="search = ''" class="clear-btn"><X class="w-4 h-4" /></button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
    </div>

    <!-- Empty — no favorites at all -->
    <div v-else-if="favorites.length === 0" class="empty-state">
      <Heart class="empty-icon" />
      <p class="empty-title">Henüz favori eklemediniz</p>
      <p class="empty-sub">Yarışmaları favorilere ekleyerek buradan takip edebilirsiniz.</p>
      <button @click="router.push('/contests')" class="btn btn--primary">
        Yarışmalara Göz At <ArrowRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Empty — search no match -->
    <div v-else-if="filtered.length === 0" class="empty-state">
      <Search class="empty-icon" />
      <p class="empty-title">Sonuç bulunamadı</p>
      <button @click="search = ''" class="btn btn--ghost">Aramayı Temizle</button>
    </div>

    <!-- Grid -->
    <div v-else class="fav-grid">
      <div
        v-for="fav in filtered"
        :key="fav.id"
        class="fav-card"
        @click="router.push(`/contests/${fav.contest.slug}`)"
      >
        <!-- Cover -->
        <div
          class="card-cover"
          :style="fav.contest.coverImage ? `background-image:url(${fav.contest.coverImage})` : ''"
        >
          <div class="cover-overlay" />
          <div class="cover-top">
            <span class="category-tag">{{ categoryIcon(fav.contest.category) }}</span>
            <button
              class="remove-btn"
              :disabled="removingId === fav.contestId"
              @click="remove(fav.contestId, $event)"
              title="Favorilerden çıkar"
            >
              <Heart class="w-4 h-4 fill-current" />
            </button>
          </div>
          <div class="cover-bottom">
            <span
              class="status-tag"
              :style="{ background: statusConfig(fav.contest.status).color + '33', color: statusConfig(fav.contest.status).color }"
            >{{ statusConfig(fav.contest.status).label }}</span>
          </div>
        </div>

        <!-- Body -->
        <div class="card-body">
          <h3 class="card-title">{{ fav.contest.title }}</h3>
          <p v-if="fav.contest.description" class="card-desc">{{ fav.contest.description }}</p>

          <div class="card-meta">
            <span class="meta-item">
              <Users class="w-3.5 h-3.5" />
              {{ fav.contest._count.applications }} başvuru
            </span>
            <span class="meta-item">
              <Trophy class="w-3.5 h-3.5" />
              {{ fav.contest._count.submissions }} eser
            </span>
          </div>

          <div class="card-footer">
            <span class="organizer">
              {{ fav.contest.createdBy.displayName || fav.contest.createdBy.username }}
            </span>
            <span v-if="fav.contest.submissionEnd" class="deadline">
              <Calendar class="w-3 h-3" />
              {{ formatDate(fav.contest.submissionEnd) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fav-page { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.2rem; }
.count-badge { padding: 0.2rem 0.65rem; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand)); border-radius: 9999px; font-size: 0.85rem; font-weight: 600; }

/* Search */
.search-box { position: relative; margin-bottom: 1.25rem; }
.search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: hsl(var(--muted-foreground)); }
.search-input { width: 100%; padding: 0.6rem 2.5rem; border: 1px solid hsl(var(--border)); border-radius: 10px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.875rem; outline: none; transition: border-color 0.15s; }
.search-input:focus { border-color: hsl(var(--brand)); }
.clear-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: hsl(var(--muted-foreground)); display: flex; align-items: center; }
.clear-btn:hover { color: hsl(var(--foreground)); }

/* States */
.loading-state { display: flex; justify-content: center; padding: 4rem; }
.spinner { width: 28px; height: 28px; border: 2px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 5rem 2rem; }
.empty-icon { width: 48px; height: 48px; color: hsl(var(--border)); margin: 0 auto 1rem; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.4rem; }
.empty-sub { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-bottom: 1.5rem; }

/* Grid */
.fav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

.fav-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
.fav-card:hover { border-color: hsl(var(--brand) / 0.5); transform: translateY(-2px); box-shadow: 0 8px 24px -8px hsl(var(--brand) / 0.15); }

/* Cover */
.card-cover { height: 140px; background: hsl(var(--muted)); background-size: cover; background-position: center; position: relative; }
.cover-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5)); }
.cover-top { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; padding: 0.75rem; }
.cover-bottom { position: absolute; bottom: 0.75rem; left: 0.75rem; z-index: 1; }
.category-tag { font-size: 1.25rem; }
.status-tag { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 9999px; }

.remove-btn {
  width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(4px);
  color: #ef4444; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.remove-btn:hover { background: rgba(239,68,68,0.2); transform: scale(1.1); }
.remove-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Body */
.card-body { padding: 1rem; }
.card-title { font-size: 0.95rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-desc { font-size: 0.8rem; color: hsl(var(--muted-foreground)); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.75rem; }

.card-meta { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
.meta-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: hsl(var(--muted-foreground)); }

.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid hsl(var(--border)); }
.organizer { font-size: 0.75rem; font-weight: 500; color: hsl(var(--muted-foreground)); }
.deadline { display: flex; align-items: center; gap: 0.25rem; font-size: 0.7rem; color: hsl(var(--muted-foreground)); }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary { background: hsl(var(--brand)); color: white; }
.btn--primary:hover { opacity: 0.9; }
.btn--ghost { background: transparent; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); }
.btn--ghost:hover { background: hsl(var(--muted)); }
</style>