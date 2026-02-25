<template>
  <div class="jury-assigned-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Atanmış Yarışmalar</h1>
        <p class="page-subtitle">Jüri olarak katıldığın yarışmalar ve puanlama durumun</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="contests.length === 0" class="empty-state">
      <div class="empty-icon">🎪</div>
      <h2>Henüz atanmış yarışman yok</h2>
      <p>Jüri olarak atandığında burada görünecek</p>
    </div>
    <div v-else class="contests-grid">
      <div v-for="c in contests" :key="c.id" class="contest-card">
        <div class="card-header">
          <h3 class="contest-title">{{ c.contest.title }}</h3>
          <span class="status-badge" :class="`status-${c.contest.status.toLowerCase()}`">
            {{ statusLabel(c.contest.status) }}
          </span>
        </div>

        <p class="contest-category">{{ c.contest.category }}</p>

        <div class="stats-row">
          <div class="stat">
            <div class="stat-label">Toplam İş</div>
            <div class="stat-value">{{ c.totalSubmissions }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Puanlandı</div>
            <div class="stat-value">{{ c.scoredCount }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Kalan</div>
            <div class="stat-value">{{ c.totalSubmissions - c.scoredCount }}</div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Puanlama İlerleme</span>
            <span class="progress-percent">{{ progressPercent(c) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent(c) + '%' }"></div>
          </div>
        </div>

        <div class="actions">
          <router-link :to="{ name: 'JuryPanel', query: { contestId: c.contestId } }" class="btn btn-primary">
            Puanla
          </router-link>
          <router-link :to="{ name: 'ContestResults', params: { slug: c.contest.slug } }" class="btn btn-secondary">
            Sonuçları Gör
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';

const authStore = useAuthStore();
const loading = ref(true);
const contests = ref<any[]>([]);

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    APPLICATIONS: '📝 Başvuru',
    ACTIVE: '🔴 Aktif',
    SUBMISSION_CLOSED: '🔒 Başvuru Kapalı',
    JUDGING: '⚖️ Jüriye Sunuluyor',
    FINALIZED: '✅ Sonuçlandı',
    COMPLETED: '🏁 Tamamlandı',
  };
  return labels[status] || status;
};

const progressPercent = (c: any) => {
  if (c.totalSubmissions === 0) return 0;
  return Math.round((c.scoredCount / c.totalSubmissions) * 100);
};

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/contests/my-jury-contests');
    contests.value = data;
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.response?.data?.message || 'Yarışmalar yüklenemedi',
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="postcss">
.jury-assigned-page {
  @apply max-w-6xl mx-auto px-4 py-8;
}

.page-header {
  @apply mb-8;
}

.page-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.page-subtitle {
  @apply text-lg text-gray-600 dark:text-gray-400;
}

.loading {
  @apply flex items-center justify-center py-12;
  @apply text-gray-500 dark:text-gray-400;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16;
  @apply text-center;
}

.empty-icon {
  @apply text-6xl mb-4;
}

.empty-state h2 {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.empty-state p {
  @apply text-gray-600 dark:text-gray-400;
}

.contests-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.contest-card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
  @apply p-6 hover:shadow-lg transition-shadow;
}

.card-header {
  @apply flex items-start justify-between mb-4;
}

.contest-title {
  @apply text-xl font-bold text-gray-900 dark:text-white;
  @apply flex-1;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-3;
}

.status-active {
  @apply bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400;
}

.status-judging {
  @apply bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400;
}

.status-completed,
.status-finalized {
  @apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400;
}

.status-applications,
.status-submission_closed {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400;
}

.contest-category {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-4;
}

.stats-row {
  @apply flex gap-4 mb-6;
}

.stat {
  @apply flex flex-col;
}

.stat-label {
  @apply text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.progress-section {
  @apply mb-6;
}

.progress-header {
  @apply flex justify-between items-center mb-2;
}

.progress-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.progress-percent {
  @apply text-sm font-bold text-gray-900 dark:text-white;
}

.progress-bar {
  @apply w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full;
  @apply transition-all duration-300;
}

.actions {
  @apply flex gap-3;
}

.btn {
  @apply flex-1 px-4 py-2 rounded-lg font-medium text-center;
  @apply transition-colors duration-200;
  @apply no-underline;
  @apply text-sm;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
  @apply dark:bg-blue-600 dark:hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  @apply dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600;
}
</style>