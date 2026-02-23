<template>
  <div class="results-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Yükleniyor...</p></div>

    <!-- Error -->
    <div v-else-if="error" class="empty-state">
      <h3>{{ error }}</h3>
      <router-link to="/contests" class="back-link">← Yarışmalara dön</router-link>
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="results-hero">
        <div class="hero-badge">🏆 Sonuçlar</div>
        <h1 class="hero-title">{{ contest.title }}</h1>
        <p class="hero-meta">{{ contest.category ? getCategoryLabel(contest.category) + ' • ' : '' }}{{ totalParticipants }} katılımcı • {{ results.length }} değerlendirilen eser</p>
      </div>

      <!-- Podium (Top 3) -->
      <div v-if="results.length >= 3" class="podium">
        <!-- 2nd place -->
        <div class="podium-item podium-item--2" @click="openDetail(results[1])">
          <div class="podium-avatar podium-avatar--silver">{{ results[1].user?.displayName?.[0] || '?' }}</div>
          <div class="podium-rank">🥈</div>
          <div class="podium-name">{{ results[1].user?.displayName || results[1].user?.username }}</div>
          <div class="podium-score">{{ results[1].finalScore?.toFixed(1) }}</div>
          <div class="podium-bar bar--2"></div>
        </div>

        <!-- 1st place -->
        <div class="podium-item podium-item--1" @click="openDetail(results[0])">
          <div class="podium-crown">👑</div>
          <div class="podium-avatar podium-avatar--gold">{{ results[0].user?.displayName?.[0] || '?' }}</div>
          <div class="podium-rank">🥇</div>
          <div class="podium-name">{{ results[0].user?.displayName || results[0].user?.username }}</div>
          <div class="podium-score">{{ results[0].finalScore?.toFixed(1) }}</div>
          <div class="podium-bar bar--1"></div>
        </div>

        <!-- 3rd place -->
        <div class="podium-item podium-item--3" @click="openDetail(results[2])">
          <div class="podium-avatar podium-avatar--bronze">{{ results[2].user?.displayName?.[0] || '?' }}</div>
          <div class="podium-rank">🥉</div>
          <div class="podium-name">{{ results[2].user?.displayName || results[2].user?.username }}</div>
          <div class="podium-score">{{ results[2].finalScore?.toFixed(1) }}</div>
          <div class="podium-bar bar--3"></div>
        </div>
      </div>

      <!-- Full Rankings -->
      <div class="rankings-section">
        <h2 class="section-title">Tam Sıralama</h2>
        <div class="rankings-list">
          <div v-for="(r, i) in results" :key="r.id" :class="['rank-item', i < 3 && 'rank-item--top']" @click="openDetail(r)">
            <div class="rank-pos">
              <span v-if="i === 0" class="rank-emoji">🥇</span>
              <span v-else-if="i === 1" class="rank-emoji">🥈</span>
              <span v-else-if="i === 2" class="rank-emoji">🥉</span>
              <span v-else class="rank-num">{{ i + 1 }}</span>
            </div>
            <div class="rank-user">
              <div class="user-avatar">{{ r.user?.displayName?.[0] || r.user?.username?.[0] || '?' }}</div>
              <div class="rank-user-info">
                <span class="rank-name">{{ r.user?.displayName || r.user?.username }}</span>
                <span class="rank-work">{{ r.title }}</span>
              </div>
            </div>
            <div class="rank-score">
              <span class="score-val" :style="{ color: getScoreColor(r.finalScore) }">{{ r.finalScore?.toFixed(1) }}</span>
              <span class="score-label">puan</span>
            </div>
            <div class="rank-votes">
              <span>{{ r._count?.scores || r.scores?.length || 0 }} oy</span>
            </div>
            <div class="rank-link" v-if="r.link">
              <a :href="r.link" target="_blank" @click.stop class="view-link">
                <ExternalLink :size="14" /> Eseri Gör
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div v-if="detailModal.show" class="modal-overlay" @click.self="detailModal.show = false">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">{{ detailModal.submission?.title }}</h3>
            <button class="modal-close" @click="detailModal.show = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-key">Katılımcı</span>
              <span class="detail-val">{{ detailModal.submission?.user?.displayName || detailModal.submission?.user?.username }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">Puan</span>
              <span class="detail-val score-highlight">{{ detailModal.submission?.finalScore?.toFixed(1) }} / 10</span>
            </div>
            <div class="detail-row" v-if="detailModal.submission?.description">
              <span class="detail-key">Açıklama</span>
              <span class="detail-val">{{ detailModal.submission.description }}</span>
            </div>
            <div class="detail-row" v-if="detailModal.submission?.link">
              <span class="detail-key">Link</span>
              <a :href="detailModal.submission.link" target="_blank" class="detail-link">{{ detailModal.submission.link }}</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Share -->
      <div class="share-section">
        <p>Sonuçları paylaş:</p>
        <div class="share-buttons">
          <button class="share-btn" @click="copyLink">📋 Link Kopyala</button>
          <a :href="twitterShareUrl" target="_blank" class="share-btn">🐦 Twitter</a>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { showToast } from '@/composables/useToast';
import { ExternalLink } from 'lucide-vue-next';

const route = useRoute();

const loading = ref(true);
const error = ref('');
const contest = ref<any>({});
const results = ref<any[]>([]);
const detailModal = ref({ show: false, submission: null as any });

const totalParticipants = computed(() => results.value.length);

const twitterShareUrl = computed(() => {
  const text = `🏆 ${contest.value.title} yarışması sonuçları yayınlandı! 1. ${results.value[0]?.user?.displayName || ''} 🥇`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
});

onMounted(async () => {
  try {
    const slug = route.params.slug as string;
    const { data } = await axios.get(`/api/contests/${slug}`);
    contest.value = data;

    if (!['FINALIZED', 'COMPLETED'].includes(data.status)) {
      error.value = 'Sonuçlar henüz yayınlanmadı';
      return;
    }

    const resData = await axios.get(`/api/contests/${data.id}/results`);
    results.value = resData.data;
  } catch {
    error.value = 'Yarışma bulunamadı';
  } finally {
    loading.value = false;
  }
});

function openDetail(submission: any) {
  detailModal.value = { show: true, submission };
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  showToast('Link kopyalandı!', 'success');
}

function getScoreColor(score: number): string {
  if (score >= 8) return '#059669';
  if (score >= 5) return '#d97706';
  return '#dc2626';
}

function getCategoryLabel(cat: string) {
  const m: Record<string, string> = { game_jam: 'Game Jam', art_contest: 'Art Contest', music_contest: 'Müzik', hackathon: 'Hackathon', design: 'Tasarım' };
  return m[cat] || cat;
}
</script>

<style scoped>
.results-page { max-width: 900px; margin: 0 auto; }
.loading-state { text-align: center; padding: 4rem; color: hsl(var(--muted-foreground)); }
.spinner { width: 32px; height: 32px; border: 3px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 4rem; }
.back-link { color: hsl(var(--brand)); text-decoration: none; margin-top: 1rem; display: inline-block; }

/* Hero */
.results-hero { text-align: center; margin-bottom: 3rem; }
.hero-badge { display: inline-block; padding: 0.4rem 1rem; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand)); border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
.hero-title { font-size: 2rem; font-weight: 700; color: hsl(var(--foreground)); margin-bottom: 0.5rem; }
.hero-meta { color: hsl(var(--muted-foreground)); font-size: 0.9rem; }

/* Podium */
.podium { display: flex; align-items: flex-end; justify-content: center; gap: 1rem; margin-bottom: 3rem; padding: 0 1rem; }

.podium-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s; position: relative; }
.podium-item:hover { transform: translateY(-4px); }

.podium-crown { font-size: 1.5rem; margin-bottom: -0.25rem; animation: float 2s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

.podium-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; color: white; margin-bottom: 0.5rem; }
.podium-avatar--gold { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }
.podium-avatar--silver { background: linear-gradient(135deg, #9ca3af, #6b7280); box-shadow: 0 4px 12px rgba(156, 163, 175, 0.4); }
.podium-avatar--bronze { background: linear-gradient(135deg, #d97706, #92400e); box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4); }

.podium-rank { font-size: 1.5rem; }
.podium-name { font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); margin-top: 0.25rem; text-align: center; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.podium-score { font-size: 1.1rem; font-weight: 700; color: hsl(var(--brand)); margin-top: 0.25rem; }

.podium-bar { width: 100px; border-radius: 8px 8px 0 0; margin-top: 0.5rem; }
.bar--1 { height: 120px; background: linear-gradient(to top, #f59e0b, #fbbf24); }
.bar--2 { height: 90px; background: linear-gradient(to top, #9ca3af, #d1d5db); }
.bar--3 { height: 70px; background: linear-gradient(to top, #d97706, #fbbf24); }

/* Rankings */
.rankings-section { margin-bottom: 2rem; }
.section-title { font-size: 1.2rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 1rem; }

.rankings-list { display: flex; flex-direction: column; gap: 0.5rem; }

.rank-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.rank-item:hover { border-color: hsl(var(--brand)); transform: translateX(4px); }
.rank-item--top { border-color: hsl(var(--brand) / 0.3); background: hsl(var(--brand) / 0.02); }

.rank-pos { width: 36px; text-align: center; flex-shrink: 0; }
.rank-emoji { font-size: 1.3rem; }
.rank-num { font-size: 1rem; font-weight: 700; color: hsl(var(--muted-foreground)); }

.rank-user { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
.rank-user-info { min-width: 0; }
.rank-name { display: block; font-weight: 600; font-size: 0.85rem; color: hsl(var(--foreground)); }
.rank-work { display: block; font-size: 0.75rem; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rank-score { text-align: right; min-width: 60px; }
.score-val { font-size: 1.1rem; font-weight: 700; }
.score-label { display: block; font-size: 0.65rem; color: hsl(var(--muted-foreground)); }

.rank-votes { font-size: 0.75rem; color: hsl(var(--muted-foreground)); min-width: 50px; }

.view-link { display: flex; align-items: center; gap: 0.3rem; color: hsl(var(--brand)); text-decoration: none; font-size: 0.8rem; font-weight: 500; }
.view-link:hover { text-decoration: underline; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: hsl(var(--background)); border-radius: 16px; padding: 1.5rem; width: 90%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.modal-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: hsl(var(--muted-foreground)); }
.modal-body { display: flex; flex-direction: column; gap: 0.75rem; }
.detail-row { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.85rem; }
.detail-key { color: hsl(var(--muted-foreground)); flex-shrink: 0; }
.detail-val { color: hsl(var(--foreground)); font-weight: 500; text-align: right; }
.score-highlight { font-size: 1.1rem; font-weight: 700; color: hsl(var(--brand)); }
.detail-link { color: hsl(var(--brand)); text-decoration: none; word-break: break-all; }

/* Share */
.share-section { text-align: center; padding: 2rem; border-top: 1px solid hsl(var(--border)); margin-top: 2rem; }
.share-section p { font-size: 0.85rem; color: hsl(var(--muted-foreground)); margin-bottom: 0.75rem; }
.share-buttons { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
.share-btn { padding: 0.5rem 1rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.85rem; cursor: pointer; text-decoration: none; transition: all 0.2s; }
.share-btn:hover { border-color: hsl(var(--brand)); background: hsl(var(--brand) / 0.05); }

@media (max-width: 640px) {
  .podium { gap: 0.5rem; }
  .podium-bar { width: 70px; }
  .bar--1 { height: 80px; }
  .bar--2 { height: 60px; }
  .bar--3 { height: 45px; }
  .rank-item { flex-wrap: wrap; }
}
</style>