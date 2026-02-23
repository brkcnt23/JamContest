<template>
  <div class="jury-panel">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Jüri Paneli</h1>
        <p class="page-subtitle">Atandığınız yarışmalardaki eserleri değerlendirin</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Yükleniyor...</p></div>

    <!-- No assignments -->
    <div v-else-if="contests.length === 0" class="empty-state">
      <Gavel :size="48" />
      <h3>Atanmış yarışma yok</h3>
      <p>Henüz jüri olarak atandığınız bir yarışma bulunmuyor</p>
    </div>

    <template v-else>
      <!-- Contest Selector -->
      <div class="contest-selector">
        <label class="selector-label">Yarışma:</label>
        <select v-model="selectedContestId" class="selector-select">
          <option v-for="c in contests" :key="c.id" :value="c.id">{{ c.title }}</option>
        </select>
        <span v-if="selectedContest" :class="['status-tag', `status-tag--${selectedContest.status?.toLowerCase()}`]">{{ selectedContest.status }}</span>
      </div>

      <!-- Progress -->
      <div v-if="selectedContestId" class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-info">
          <span>{{ scoredCount }} / {{ totalCount }} eser değerlendirildi</span>
          <span class="progress-pct">{{ progressPercent }}%</span>
        </div>
      </div>

      <!-- Queue -->
      <div v-if="selectedContestId && queue.length > 0" class="queue-section">
        <!-- Current submission -->
        <div class="submission-card">
          <div class="sub-header">
            <div class="sub-number">Eser {{ currentIndex + 1 }} / {{ totalCount }}</div>
            <h2 class="sub-title">{{ currentSubmission.title }}</h2>
          </div>

          <div class="sub-body">
            <p v-if="currentSubmission.description" class="sub-desc">{{ currentSubmission.description }}</p>

            <!-- Link -->
            <a v-if="currentSubmission.link" :href="currentSubmission.link" target="_blank" class="sub-link">
              <ExternalLink :size="16" />
              Eseri Görüntüle
            </a>

            <!-- Files -->
            <div v-if="currentSubmission.files?.length" class="sub-files">
              <h4 class="sub-files-title">Dosyalar</h4>
              <div v-for="file in currentSubmission.files" :key="file.id" class="file-item">
                <FileText :size="14" />
                <span>{{ file.originalName }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </div>
            </div>

            <!-- Participant info (anonymous option) -->
            <div class="sub-participant">
              <div class="user-avatar">{{ currentSubmission.user?.displayName?.[0] || '?' }}</div>
              <span>{{ currentSubmission.user?.displayName || currentSubmission.user?.username }}</span>
            </div>
          </div>

          <!-- Scoring -->
          <div class="scoring-section">
            <h3 class="scoring-title">Puanlama</h3>
            <p class="scoring-hint">0-10 arası puan verin. Bu oy geri alınamaz.</p>

            <!-- Score slider -->
            <div class="score-input-group">
              <input v-model.number="scoreValue" type="range" min="0" max="10" step="0.5" class="score-slider" />
              <div class="score-display">
                <span class="score-number" :style="{ color: getScoreColor(scoreValue) }">{{ scoreValue.toFixed(1) }}</span>
                <span class="score-max">/ 10</span>
              </div>
            </div>

            <!-- Score labels -->
            <div class="score-labels">
              <span>0 - Yetersiz</span>
              <span>5 - Orta</span>
              <span>10 - Mükemmel</span>
            </div>

            <!-- Comment -->
            <div class="form-group">
              <label class="form-label">Yorum (isteğe bağlı)</label>
              <textarea v-model="comment" class="form-textarea" rows="3" placeholder="Eser hakkında düşünceleriniz..."></textarea>
            </div>

            <!-- Confirm -->
            <div class="score-confirm">
              <div class="confirm-warning" v-if="!confirmed">
                <AlertTriangle :size="16" />
                <span>Oy verdikten sonra değiştiremezsiniz!</span>
              </div>
              <label class="confirm-check">
                <input type="checkbox" v-model="confirmed" />
                <span>Puanımı onaylıyorum</span>
              </label>
              <button class="btn btn--score" @click="submitScore" :disabled="!confirmed || submittingScore">
                {{ submittingScore ? 'Gönderiliyor...' : `✅ ${scoreValue.toFixed(1)} Puan Ver` }}
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="queue-nav" v-if="queue.length > 1">
          <button class="btn btn--secondary btn--sm" @click="prevSubmission" :disabled="currentIndex === 0">← Önceki</button>
          <span class="nav-info">{{ currentIndex + 1 }} / {{ queue.length }}</span>
          <button class="btn btn--secondary btn--sm" @click="nextSubmission" :disabled="currentIndex >= queue.length - 1">Sonraki →</button>
        </div>
      </div>

      <!-- All scored -->
      <div v-if="selectedContestId && queue.length === 0 && !loading" class="all-done">
        <CheckCircle :size="56" />
        <h3>Tebrikler! 🎉</h3>
        <p>Bu yarışmadaki tüm eserleri değerlendirdiniz.</p>
        <div class="done-stats">
          <span>{{ scoredCount }} eser puanlandı</span>
        </div>
      </div>

      <!-- Scored history -->
      <div v-if="scoredSubmissions.length > 0" class="scored-section">
        <h3 class="section-title">Verdiğiniz Puanlar</h3>
        <div class="scored-list">
          <div v-for="s in scoredSubmissions" :key="s.id" class="scored-item">
            <span class="scored-title">{{ s.submission?.title || 'Eser' }}</span>
            <span class="scored-score" :style="{ color: getScoreColor(s.score) }">{{ s.score.toFixed(1) }}</span>
            <span class="scored-lock">🔒</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import { Gavel, ExternalLink, FileText, AlertTriangle, CheckCircle } from 'lucide-vue-next';

const authStore = useAuthStore();

const loading = ref(true);
const contests = ref<any[]>([]);
const selectedContestId = ref('');
const queue = ref<any[]>([]);
const scoredSubmissions = ref<any[]>([]);
const currentIndex = ref(0);
const scoreValue = ref(5);
const comment = ref('');
const confirmed = ref(false);
const submittingScore = ref(false);

const selectedContest = computed(() => contests.value.find(c => c.id === selectedContestId.value));
const currentSubmission = computed(() => queue.value[currentIndex.value] || {});
const totalCount = computed(() => queue.value.length + scoredSubmissions.value.length);
const scoredCount = computed(() => scoredSubmissions.value.length);
const progressPercent = computed(() => totalCount.value ? Math.round((scoredCount.value / totalCount.value) * 100) : 0);

onMounted(async () => {
  try {
    // Get contests where user is jury
    const { data } = await axios.get('/api/contests');
    // Filter by jury membership
    const userId = authStore.user?.id;
    const allContests = data;
    // For each contest, check if user is jury (we check members)
    const juryContests: any[] = [];
    for (const c of allContests) {
      try {
        const memRes = await axios.get(`/api/contests/${c.id}/members`);
        const isJury = memRes.data.some((m: any) => m.userId === userId && m.role === 'JURY');
        if (isJury) juryContests.push(c);
      } catch { /* skip */ }
    }
    contests.value = juryContests;
    if (contests.value.length) {
      selectedContestId.value = contests.value[0].id;
    }
  } finally {
    loading.value = false;
  }
});

watch(selectedContestId, async (id) => {
  if (!id) return;
  await loadQueue(id);
});

async function loadQueue(contestId: string) {
  currentIndex.value = 0;
  scoreValue.value = 5;
  comment.value = '';
  confirmed.value = false;
  try {
    const [qRes, sRes] = await Promise.allSettled([
      axios.get(`/api/contests/${contestId}/jury/queue`),
      axios.get(`/api/contests/${contestId}/jury/my-scores`),
    ]);
    queue.value = qRes.status === 'fulfilled' ? qRes.value.data : [];
    scoredSubmissions.value = sRes.status === 'fulfilled' ? sRes.value.data : [];
  } catch { /* silent */ }
}

async function submitScore() {
  if (!confirmed.value || !currentSubmission.value?.id) return;
  submittingScore.value = true;
  try {
    await axios.post(`/api/contests/${selectedContestId.value}/jury/score`, {
      submissionId: currentSubmission.value.id,
      score: scoreValue.value,
      comment: comment.value || undefined,
    });
    showToast(`${scoreValue.value.toFixed(1)} puan verildi!`, 'success');

    // Move to scored
    scoredSubmissions.value.push({
      id: Date.now(),
      submission: currentSubmission.value,
      score: scoreValue.value,
    });
    queue.value.splice(currentIndex.value, 1);
    if (currentIndex.value >= queue.value.length) currentIndex.value = Math.max(0, queue.value.length - 1);

    // Reset
    scoreValue.value = 5;
    comment.value = '';
    confirmed.value = false;
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Puan verilemedi', 'error');
  } finally {
    submittingScore.value = false;
  }
}

function prevSubmission() { if (currentIndex.value > 0) { currentIndex.value--; resetScoreForm(); } }
function nextSubmission() { if (currentIndex.value < queue.value.length - 1) { currentIndex.value++; resetScoreForm(); } }

function resetScoreForm() {
  scoreValue.value = 5;
  comment.value = '';
  confirmed.value = false;
}

function getScoreColor(score: number): string {
  if (score >= 8) return '#059669';
  if (score >= 5) return '#d97706';
  return '#dc2626';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
</script>

<style scoped>
.jury-panel { max-width: 800px; margin: 0 auto; }
.loading-state { text-align: center; padding: 4rem; color: hsl(var(--muted-foreground)); }
.spinner { width: 32px; height: 32px; border: 3px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 4rem; color: hsl(var(--muted-foreground)); }
.empty-state h3 { margin-top: 1rem; color: hsl(var(--foreground)); }

.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { color: hsl(var(--muted-foreground)); }

/* Selector */
.contest-selector { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.selector-label { font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); }
.selector-select { padding: 0.5rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.85rem; flex: 1; max-width: 350px; }
.status-tag { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
.status-tag--judging { background: #e0e7ff; color: #3730a3; }
.status-tag--active { background: #dbeafe; color: #1e40af; }
.status-tag--finalized { background: #d1fae5; color: #065f46; }

/* Progress */
.progress-section { margin-bottom: 2rem; }
.progress-bar { height: 8px; background: hsl(var(--muted)); border-radius: 9999px; overflow: hidden; }
.progress-fill { height: 100%; background: hsl(var(--brand)); border-radius: 9999px; transition: width 0.5s ease; }
.progress-info { display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.8rem; color: hsl(var(--muted-foreground)); }
.progress-pct { font-weight: 600; color: hsl(var(--brand)); }

/* Submission card */
.submission-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 16px; overflow: hidden; margin-bottom: 1rem; }

.sub-header { padding: 1.5rem; border-bottom: 1px solid hsl(var(--border)); }
.sub-number { font-size: 0.75rem; font-weight: 600; color: hsl(var(--brand)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
.sub-title { font-size: 1.3rem; font-weight: 700; color: hsl(var(--foreground)); }

.sub-body { padding: 1.5rem; }
.sub-desc { font-size: 0.9rem; color: hsl(var(--muted-foreground)); line-height: 1.6; margin-bottom: 1rem; }

.sub-link { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand)); border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.85rem; margin-bottom: 1rem; transition: all 0.2s; }
.sub-link:hover { background: hsl(var(--brand) / 0.2); }

.sub-files { margin-bottom: 1rem; }
.sub-files-title { font-size: 0.8rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.5rem; }
.file-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem; font-size: 0.8rem; color: hsl(var(--muted-foreground)); }
.file-size { margin-left: auto; font-size: 0.7rem; }

.sub-participant { display: flex; align-items: center; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid hsl(var(--border)); font-size: 0.85rem; color: hsl(var(--muted-foreground)); }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.7rem; }

/* Scoring */
.scoring-section { padding: 1.5rem; border-top: 2px solid hsl(var(--brand) / 0.2); background: hsl(var(--brand) / 0.02); }
.scoring-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.25rem; }
.scoring-hint { font-size: 0.8rem; color: hsl(var(--muted-foreground)); margin-bottom: 1rem; }

.score-input-group { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 0.5rem; }
.score-slider { flex: 1; height: 8px; -webkit-appearance: none; background: hsl(var(--muted)); border-radius: 9999px; outline: none; }
.score-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: hsl(var(--brand)); cursor: pointer; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }

.score-display { display: flex; align-items: baseline; gap: 0.25rem; }
.score-number { font-size: 2rem; font-weight: 700; }
.score-max { font-size: 0.9rem; color: hsl(var(--muted-foreground)); }

.score-labels { display: flex; justify-content: space-between; font-size: 0.7rem; color: hsl(var(--muted-foreground)); margin-bottom: 1.25rem; }

.form-group { margin-bottom: 1rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.3rem; }
.form-textarea { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.85rem; resize: vertical; font-family: inherit; }
.form-textarea:focus { outline: none; border-color: hsl(var(--brand)); }

.score-confirm { display: flex; flex-direction: column; gap: 0.75rem; }
.confirm-warning { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.75rem; background: #fef3c7; color: #92400e; border-radius: 8px; font-size: 0.8rem; font-weight: 500; }
.confirm-check { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: hsl(var(--foreground)); cursor: pointer; }
.confirm-check input { accent-color: hsl(var(--brand)); }

/* Queue nav */
.queue-nav { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
.nav-info { font-size: 0.8rem; color: hsl(var(--muted-foreground)); }

/* All done */
.all-done { text-align: center; padding: 4rem 2rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 16px; margin-bottom: 2rem; }
.all-done h3 { margin-top: 1rem; font-size: 1.3rem; color: hsl(var(--foreground)); }
.all-done p { color: hsl(var(--muted-foreground)); margin-top: 0.5rem; }
.done-stats { margin-top: 1rem; font-size: 0.85rem; color: hsl(var(--brand)); font-weight: 600; }

/* Scored history */
.scored-section { margin-top: 1rem; }
.section-title { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.75rem; }
.scored-list { display: flex; flex-direction: column; gap: 0.5rem; }
.scored-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 8px; }
.scored-title { flex: 1; font-size: 0.85rem; font-weight: 500; color: hsl(var(--foreground)); }
.scored-score { font-size: 1rem; font-weight: 700; }
.scored-lock { font-size: 0.75rem; }

/* Buttons */
.btn { padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn--sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn--secondary { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.btn--secondary:hover { background: hsl(var(--border)); }
.btn--secondary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--score { width: 100%; background: #059669; color: white; font-size: 0.95rem; padding: 0.7rem; }
.btn--score:hover { background: #047857; }
.btn--score:disabled { opacity: 0.5; cursor: not-allowed; }
</style>