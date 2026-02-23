<template>
  <div class="contests-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Yarışmalar</h1>
        <p class="page-subtitle">Aktif yarışmalara göz at ve katıl</p>
      </div>
      <router-link to="/contests/create" class="btn-create" v-if="authStore.isAuthenticated">
        <PlusCircle :size="18" />
        Yarışma Oluştur
      </router-link>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-row">
        <!-- Status filter -->
        <div class="filter-group">
          <button v-for="f in statusFilters" :key="f.value"
            :class="['filter-btn', statusFilter === f.value && 'filter-btn--active']"
            @click="statusFilter = f.value">
            {{ f.label }}
          </button>
        </div>

        <!-- Category filter -->
        <div class="filter-group">
          <button v-for="cat in categoryFilters" :key="cat.value"
            :class="['filter-btn filter-btn--cat', categoryFilter === cat.value && 'filter-btn--active']"
            @click="categoryFilter = cat.value">
            <span v-if="cat.icon">{{ cat.icon }}</span> {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="search-box">
        <Search :size="16" />
        <input v-model="searchQuery" type="text" placeholder="Yarışma ara..." class="search-input" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Yarışmalar yükleniyor...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredContests.length === 0" class="empty-state">
      <Trophy :size="56" />
      <h3>Yarışma bulunamadı</h3>
      <p>Filtreleri değiştirmeyi deneyin veya yeni bir yarışma oluşturun</p>
    </div>

    <!-- Contest Grid -->
    <div v-else class="contests-grid">
      <div v-for="contest in filteredContests" :key="contest.id" class="contest-card" @click="goToContest(contest.slug)">
        <!-- Cover -->
        <div class="card-cover">
          <img v-if="contest.coverImage" :src="contest.coverImage" :alt="contest.title" />
          <div v-else class="card-cover-placeholder">
            <Trophy :size="32" />
          </div>
          <div class="card-status">
            <span :class="['status-tag', `status-tag--${getPhase(contest)}`]">{{ getPhaseLabel(contest) }}</span>
          </div>
          <div v-if="contest.category" class="card-category">
            {{ getCategoryIcon(contest.category) }} {{ getCategoryLabel(contest.category) }}
          </div>
        </div>

        <!-- Body -->
        <div class="card-body">
          <h3 class="card-title">{{ contest.title }}</h3>
          <p class="card-desc">{{ contest.description?.substring(0, 120) }}...</p>

          <!-- Meta -->
          <div class="card-meta">
            <div class="meta-item">
              <Calendar :size="14" />
              <span>{{ getTimeInfo(contest) }}</span>
            </div>
            <div class="meta-item" v-if="contest._count?.applications">
              <Users :size="14" />
              <span>{{ contest._count.applications }} başvuru</span>
            </div>
          </div>

          <!-- Organizer -->
          <div class="card-footer">
            <div class="organizer">
              <div class="organizer-avatar">{{ contest.createdBy?.displayName?.[0] || contest.createdBy?.username?.[0] || '?' }}</div>
              <span class="organizer-name">{{ contest.createdBy?.displayName || contest.createdBy?.username }}</span>
            </div>
            <span class="card-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { Trophy, Search, PlusCircle, Calendar, Users } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const contests = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('ALL');
const categoryFilter = ref('ALL');

const statusFilters = [
  { label: 'Tümü', value: 'ALL' },
  { label: 'Başvuru Açık', value: 'APPLICATIONS' },
  { label: 'Aktif', value: 'ACTIVE' },
  { label: 'Oylama', value: 'JUDGING' },
  { label: 'Tamamlanan', value: 'COMPLETED' },
];

const categoryFilters = [
  { label: 'Tümü', value: 'ALL', icon: '' },
  { label: 'Game Jam', value: 'game_jam', icon: '🎮' },
  { label: 'Art', value: 'art_contest', icon: '🎨' },
  { label: 'Müzik', value: 'music_contest', icon: '🎵' },
  { label: 'Hackathon', value: 'hackathon', icon: '💻' },
  { label: 'Tasarım', value: 'design', icon: '✏️' },
];

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/contests');
    contests.value = data;
  } finally {
    loading.value = false;
  }
});

const filteredContests = computed(() => {
  let result = contests.value;

  // Only show approved+ contests to non-admins
  if (!authStore.isAdmin) {
    result = result.filter((c: any) => !['DRAFT', 'PENDING_APPROVAL', 'REJECTED'].includes(c.status));
  }

  if (statusFilter.value !== 'ALL') {
    result = result.filter((c: any) => c.status === statusFilter.value);
  }

  if (categoryFilter.value !== 'ALL') {
    result = result.filter((c: any) => c.category === categoryFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((c: any) =>
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  }

  return result;
});

function goToContest(slug: string) {
  router.push(`/contests/${slug}`);
}

function getPhase(contest: any): string {
  const now = new Date();
  if (contest.status === 'FINALIZED' || contest.status === 'COMPLETED') return 'completed';
  if (contest.status === 'JUDGING') return 'judging';
  if (contest.status === 'ACTIVE') return 'active';
  if (contest.status === 'APPLICATIONS' || contest.status === 'APPROVED') {
    if (contest.applicationEnd && new Date(contest.applicationEnd) > now) return 'open';
  }
  return 'upcoming';
}

function getPhaseLabel(contest: any): string {
  const phase = getPhase(contest);
  const map: Record<string, string> = {
    open: '📋 Başvuru Açık',
    active: '🔥 Aktif',
    judging: '⚖️ Oylama',
    completed: '🏆 Tamamlandı',
    upcoming: '⏳ Yakında',
  };
  return map[phase] || contest.status;
}

function getTimeInfo(contest: any): string {
  const now = new Date();
  if (contest.applicationEnd) {
    const end = new Date(contest.applicationEnd);
    if (end > now) {
      const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} gün kaldı`;
    }
  }
  if (contest.submissionEnd) {
    const end = new Date(contest.submissionEnd);
    if (end > now) {
      const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `Gönderim: ${days} gün`;
    }
  }
  return 'Tarih belirtilmemiş';
}

function getCategoryIcon(cat: string): string {
  const map: Record<string, string> = { game_jam: '🎮', art_contest: '🎨', music_contest: '🎵', hackathon: '💻', design: '✏️', other: '📦' };
  return map[cat] || '📦';
}

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = { game_jam: 'Game Jam', art_contest: 'Art Contest', music_contest: 'Müzik', hackathon: 'Hackathon', design: 'Tasarım', other: 'Diğer' };
  return map[cat] || cat;
}
</script>

<style scoped>
.contests-page { max-width: 1200px; margin: 0 auto; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { color: hsl(var(--muted-foreground)); margin-top: 0.25rem; }

.btn-create {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1.25rem; background: hsl(var(--brand)); color: white;
  border-radius: 10px; font-weight: 600; font-size: 0.85rem;
  text-decoration: none; transition: all 0.2s;
}
.btn-create:hover { opacity: 0.9; transform: translateY(-1px); }

/* Filters */
.filters { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
.filter-group { display: flex; gap: 0.25rem; flex-wrap: wrap; }

.filter-btn {
  padding: 0.35rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 9999px;
  background: hsl(var(--background)); color: hsl(var(--muted-foreground));
  font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.filter-btn:hover { border-color: hsl(var(--brand)); color: hsl(var(--foreground)); }
.filter-btn--active { background: hsl(var(--brand)); color: white; border-color: hsl(var(--brand)); }

.search-box {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 8px;
  background: hsl(var(--background)); color: hsl(var(--muted-foreground)); max-width: 300px;
}
.search-input { border: none; outline: none; background: none; color: hsl(var(--foreground)); font-size: 0.85rem; width: 100%; }

/* Loading */
.loading-state { text-align: center; padding: 4rem; color: hsl(var(--muted-foreground)); }
.spinner { width: 32px; height: 32px; border: 3px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty-state { text-align: center; padding: 4rem 2rem; color: hsl(var(--muted-foreground)); }
.empty-state h3 { margin-top: 1rem; color: hsl(var(--foreground)); font-size: 1.1rem; }
.empty-state p { margin-top: 0.5rem; }

/* Grid */
.contests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }

/* Card */
.contest-card {
  background: hsl(var(--background)); border: 1px solid hsl(var(--border));
  border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.3s ease;
}
.contest-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px -12px rgba(0,0,0,0.15); border-color: hsl(var(--brand)); }

/* Cover */
.card-cover { position: relative; aspect-ratio: 16/9; overflow: hidden; background: hsl(var(--muted)); }
.card-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.contest-card:hover .card-cover img { transform: scale(1.05); }

.card-cover-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, hsl(var(--brand) / 0.1), hsl(var(--brand) / 0.05));
  color: hsl(var(--brand));
}

.card-status { position: absolute; top: 0.75rem; left: 0.75rem; }
.status-tag {
  padding: 0.3rem 0.7rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 600;
  backdrop-filter: blur(8px); background: rgba(255,255,255,0.85); color: #333;
}
.status-tag--open { background: rgba(16,185,129,0.9); color: white; }
.status-tag--active { background: rgba(59,130,246,0.9); color: white; }
.status-tag--judging { background: rgba(139,92,246,0.9); color: white; }
.status-tag--completed { background: rgba(34,197,94,0.9); color: white; }
.status-tag--upcoming { background: rgba(245,158,11,0.9); color: white; }

.card-category {
  position: absolute; bottom: 0.75rem; right: 0.75rem;
  padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 500;
  backdrop-filter: blur(8px); background: rgba(0,0,0,0.6); color: white;
}

/* Body */
.card-body { padding: 1.25rem; }
.card-title { font-size: 1.05rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.5rem; line-height: 1.3; }
.card-desc { font-size: 0.8rem; color: hsl(var(--muted-foreground)); line-height: 1.5; margin-bottom: 1rem; }

/* Meta */
.card-meta { display: flex; gap: 1rem; margin-bottom: 1rem; }
.meta-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: hsl(var(--muted-foreground)); }

/* Footer */
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid hsl(var(--border)); }
.organizer { display: flex; align-items: center; gap: 0.5rem; }
.organizer-avatar {
  width: 24px; height: 24px; border-radius: 50%; background: hsl(var(--brand));
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700;
}
.organizer-name { font-size: 0.8rem; color: hsl(var(--muted-foreground)); }
.card-arrow { color: hsl(var(--brand)); font-weight: 600; font-size: 1.1rem; transition: transform 0.2s; }
.contest-card:hover .card-arrow { transform: translateX(4px); }

@media (max-width: 640px) {
  .contests-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 1rem; }
}
</style>