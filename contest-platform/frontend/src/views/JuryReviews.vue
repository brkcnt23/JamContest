<template>
  <div class="jury-reviews-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Jüri Puanlarım</h1>
        <p class="page-subtitle">Verdiğin tüm puanlar ve yorumlar</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="scores.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <h2>Henüz puan vermemişsin</h2>
      <p>Atanmış yarışmalardaki işleri puanlamaya başla</p>
      <router-link to="/jury/assigned" class="btn btn-primary mt-4">Atanmış Yarışmalar</router-link>
    </div>
    <div v-else>
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-label">Toplam Puanlandı</div>
            <div class="stat-value">{{ scores.length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <div class="stat-label">Ortalama Puan</div>
            <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <div class="stat-label">En Yüksek Puan</div>
            <div class="stat-value">{{ maxScore }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📉</div>
          <div class="stat-info">
            <div class="stat-label">En Düşük Puan</div>
            <div class="stat-value">{{ minScore }}</div>
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-section">
        <label class="filter-label">Yarışma Filtresi:</label>
        <select v-model="selectedContest" class="filter-select">
          <option value="">Tüm Yarışmalar</option>
          <option v-for="contest in uniqueContests" :key="contest.id" :value="contest.id">
            {{ contest.title }}
          </option>
        </select>
      </div>

      <!-- Score Distribution Chart -->
      <div class="chart-section">
        <h3 class="chart-title">Puan Dağılımı</h3>
        <div class="distribution">
          <div v-for="(count, score) in scoreDistribution" :key="score" class="distribution-bar">
            <div class="bar-label">{{ score }}</div>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: (count / maxDistribution) * 100 + '%' }"></div>
            </div>
            <div class="bar-count">{{ count }}</div>
          </div>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list">
        <div v-for="review in filteredScores" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="review-info">
              <h3 class="review-submission">{{ review.submission.title }}</h3>
              <p class="review-artist">👤 {{ review.submission.user.displayName || review.submission.user.username }}</p>
              <p class="review-contest">🏢 {{ review.submission.contest.title }}</p>
            </div>
            <div class="review-score">{{ review.score }}</div>
          </div>

          <div v-if="review.comment" class="review-comment-section">
            <button
              :class="['comment-toggle', expandedReviews.includes(review.id) && 'expanded']"
              @click="toggleComment(review.id)"
            >
              <span>💬 Yorum</span>
              <span class="toggle-icon">▼</span>
            </button>
            <div v-if="expandedReviews.includes(review.id)" class="comment-text">
              {{ review.comment }}
            </div>
          </div>

          <div class="review-footer">
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            <a :href="review.submission.link" target="_blank" class="review-link">
              İşi Görüntüle →
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';

const authStore = useAuthStore();
const loading = ref(true);
const scores = ref<any[]>([]);
const selectedContest = ref('');
const expandedReviews = ref<string[]>([]);

const filteredScores = computed(() => {
  if (!selectedContest.value) return scores.value;
  return scores.value.filter((s) => s.submission.contest.id === selectedContest.value);
});

const uniqueContests = computed(() => {
  const seen = new Set<string>();
  return scores.value
    .filter((s) => {
      if (seen.has(s.submission.contest.id)) return false;
      seen.add(s.submission.contest.id);
      return true;
    })
    .map((s) => s.submission.contest)
    .sort((a: any, b: any) => a.title.localeCompare(b.title));
});

const averageScore = computed(() => {
  if (filteredScores.value.length === 0) return 0;
  const sum = filteredScores.value.reduce((acc, s) => acc + s.score, 0);
  return sum / filteredScores.value.length;
});

const maxScore = computed(() => {
  if (filteredScores.value.length === 0) return 0;
  return Math.max(...filteredScores.value.map((s) => s.score));
});

const minScore = computed(() => {
  if (filteredScores.value.length === 0) return 0;
  return Math.min(...filteredScores.value.map((s) => s.score));
});

const scoreDistribution = computed(() => {
  const dist: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) {
    dist[i] = filteredScores.value.filter((s) => s.score === i).length;
  }
  return dist;
});

const maxDistribution = computed(() => {
  const counts = Object.values(scoreDistribution.value);
  return Math.max(...counts, 1);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toggleComment = (id: string) => {
  if (expandedReviews.value.includes(id)) {
    expandedReviews.value = expandedReviews.value.filter((r) => r !== id);
  } else {
    expandedReviews.value.push(id);
  }
};

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/users/me/jury-scores');
    scores.value = data;
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.response?.data?.message || 'Puanlar yüklenemedi',
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="postcss">
.jury-reviews-page {
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
  @apply text-gray-600 dark:text-gray-400 mb-4;
}

.btn {
  @apply inline-block px-6 py-2 rounded-lg font-medium;
  @apply transition-colors duration-200;
  @apply no-underline;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
  @apply dark:bg-blue-600 dark:hover:bg-blue-700;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
  @apply p-6 flex items-center gap-4;
}

.stat-icon {
  @apply text-3xl;
}

.stat-info {
  @apply flex-1;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

/* Filter */
.filter-section {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
  @apply p-4 mb-8 flex items-center gap-4;
}

.filter-label {
  @apply font-medium text-gray-900 dark:text-white;
}

.filter-select {
  @apply flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600;
  @apply bg-white dark:bg-gray-700;
  @apply text-gray-900 dark:text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

/* Chart */
.chart-section {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
  @apply p-6 mb-8;
}

.chart-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-6;
}

.distribution {
  @apply space-y-3;
}

.distribution-bar {
  @apply flex items-center gap-3;
}

.bar-label {
  @apply w-8 text-center font-bold text-gray-900 dark:text-white;
}

.bar-container {
  @apply flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden;
}

.bar-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-md;
  @apply transition-all duration-300;
}

.bar-count {
  @apply w-8 text-right text-sm font-medium text-gray-600 dark:text-gray-400;
}

/* Reviews */
.reviews-list {
  @apply space-y-4;
}

.review-card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
  @apply p-6;
}

.review-header {
  @apply flex items-start justify-between mb-4;
}

.review-info {
  @apply flex-1;
}

.review-submission {
  @apply text-lg font-bold text-gray-900 dark:text-white mb-1;
}

.review-artist {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.review-contest {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.review-score {
  @apply text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600;
  @apply ml-4;
}

.review-comment-section {
  @apply mb-4;
}

.comment-toggle {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-900 dark:text-white;
  @apply font-medium cursor-pointer;
  @apply transition-colors hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply border-none;
}

.toggle-icon {
  @apply transition-transform duration-200;
}

.comment-toggle.expanded .toggle-icon {
  @apply transform rotate-180;
}

.comment-text {
  @apply mt-3 p-3 bg-gray-50 dark:bg-gray-700;
  @apply rounded-lg text-gray-800 dark:text-gray-200;
  @apply whitespace-pre-wrap break-words;
  @apply transition-opacity duration-200;
}

.review-footer {
  @apply flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700;
}

.review-date {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.review-link {
  @apply text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300;
  @apply font-medium transition-colors;
  @apply no-underline;
}

.review-link:hover {
  @apply underline;
}
</style>