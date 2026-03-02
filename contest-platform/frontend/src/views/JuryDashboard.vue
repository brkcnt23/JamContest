<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from '@/composables/useToast';
import { Star, MessageCircle, Check } from 'lucide-vue-next';

interface Work {
  id: string;
  score: number;
  status: string;
  submission: {
    id: string;
    title: string;
    description: string;
    user: {
      id: string;
      displayName: string;
      username: string;
    };
    contest: {
      id: string;
      title: string;
    };
  };
}

const { showToast } = useToast();

const works = ref<Work[]>([]);
const selectedWork = ref<Work | null>(null);
const loading = ref(false);
const reviewLoading = ref(false);

const reviewForm = ref({
  score: 50,
  comment: '',
});

const submittedCount = computed(() =>
  works.value.filter((w) => w.status === 'SUBMITTED').length
);

const draftCount = computed(() =>
  works.value.filter((w) => w.status === 'DRAFT').length
);

onMounted(loadWorks);

async function loadWorks() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/jury/works');
    works.value = data;
  } catch (error) {
    showToast('Failed to load works', 'error');
  } finally {
    loading.value = false;
  }
}

function selectWork(work: Work) {
  selectedWork.value = work;
  reviewForm.value = {
    score: work.score || 50,
    comment: '',
  };
}

async function submitReview() {
  if (!selectedWork.value) return;

  reviewLoading.value = true;
  try {
    await axios.post(
      `/api/jury/works/${selectedWork.value.submission.id}/submit-review`,
      {
        score: reviewForm.value.score,
        comment: reviewForm.value.comment,
      }
    );

    showToast('Review submitted successfully', 'success');
    selectedWork.value = null;
    await loadWorks();
  } catch (error: any) {
    showToast(error.response?.data?.message || 'Failed to submit review', 'error');
  } finally {
    reviewLoading.value = false;
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <div class="jury-dashboard">
    <div class="page-header">
      <h1 class="page-title">Jury Dashboard</h1>
      <p class="page-subtitle">Review submissions and provide feedback</p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Works to Review</div>
        <div class="stat-value">{{ works.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Draft Reviews</div>
        <div class="stat-value">{{ draftCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Submitted Reviews</div>
        <div class="stat-value">{{ submittedCount }}</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading works...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="works.length === 0" class="empty-state">
      <p>No works assigned yet.</p>
      <p class="text-muted">Check back later for submissions to review.</p>
    </div>

    <!-- Works Grid -->
    <div v-else class="works-grid">
      <div
        v-for="work in works"
        :key="work.id"
        class="work-card"
        @click="selectWork(work)"
      >
        <div class="work-header">
          <h3>{{ work.submission.user.displayName }}</h3>
          <span :class="['status-badge', `status-${work.status.toLowerCase()}`]">
            {{ work.status }}
          </span>
        </div>

        <p class="work-title">{{ work.submission.title }}</p>
        <p class="contest-name">{{ work.submission.contest.title }}</p>

        <div class="work-footer">
          <div :class="['score-display', work.score > 0 && 'has-score']">
            <Star :size="16" :fill="getScoreColor(work.score)" :color="getScoreColor(work.score)" />
            <span v-if="work.score > 0">{{ work.score }}/100</span>
            <span v-else>No score</span>
          </div>
          <div class="review-hint">Click to review</div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="selectedWork" class="modal-overlay" @click.self="selectedWork = null">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Review Submission</h2>
          <button @click="selectedWork = null" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <!-- Submission Details -->
          <section class="section">
            <h3>Submission Details</h3>
            <div class="details-box">
              <p>
                <strong>Creator:</strong>
                <span>{{ selectedWork.submission.user.displayName }}</span>
              </p>
              <p>
                <strong>Email:</strong>
                <span>{{ selectedWork.submission.user.username }}</span>
              </p>
              <p>
                <strong>Title:</strong>
                <span>{{ selectedWork.submission.title }}</span>
              </p>
              <p>
                <strong>Contest:</strong>
                <span>{{ selectedWork.submission.contest.title }}</span>
              </p>
              <div v-if="selectedWork.submission.description" class="description">
                <strong>Description:</strong>
                <p class="description-text">{{ selectedWork.submission.description }}</p>
              </div>
            </div>
          </section>

          <!-- Scoring -->
          <section class="section">
            <h3>Score Submission (0-100)</h3>
            <div class="score-container">
              <input
                v-model.number="reviewForm.score"
                type="range"
                min="0"
                max="100"
                class="score-slider"
              />
              <div class="score-display-large">
                <div class="score-value">{{ reviewForm.score }}</div>
                <div class="score-max">/100</div>
              </div>
            </div>
            <div class="score-guide">
              <span>0-40: Below Average</span>
              <span>40-60: Average</span>
              <span>60-80: Good</span>
              <span>80-100: Excellent</span>
            </div>
          </section>

          <!-- Comments -->
          <section class="section">
            <h3>Feedback & Comments</h3>
            <textarea
              v-model="reviewForm.comment"
              placeholder="Provide constructive feedback to the creator..."
              class="comments-textarea"
              rows="6"
              maxlength="2000"
            ></textarea>
            <div class="char-count">
              {{ reviewForm.comment.length }} / 2000 characters
            </div>
          </section>
        </div>

        <div class="modal-footer">
          <button @click="selectedWork = null" class="btn btn-secondary">
            Cancel
          </button>
          <button
            @click="submitReview"
            :disabled="reviewLoading"
            class="btn btn-primary"
          >
            <Check :size="16" />
            {{ reviewLoading ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jury-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin: 0;
}

.page-subtitle {
  color: hsl(var(--muted-foreground));
  margin-top: 0.5rem;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-label {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: hsl(var(--brand));
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: hsl(var(--muted-foreground));
}

.empty-state p {
  margin: 0.5rem 0;
}

.text-muted {
  font-size: 14px;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.25rem;
}

.work-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.work-card:hover {
  border-color: hsl(var(--brand));
  box-shadow: 0 4px 12px hsl(var(--brand) / 0.1);
  transform: translateY(-2px);
}

.work-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.work-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  text-transform: uppercase;
}

.status-draft {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.status-submitted {
  background: hsl(120 84% 60% / 0.2);
  color: #10b981;
}

.work-title {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  color: hsl(var(--foreground));
  font-weight: 500;
}

.contest-name {
  margin: 0 0 1rem 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.work-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
}

.score-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.score-display.has-score {
  color: hsl(var(--brand));
}

.review-hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: hsl(var(--foreground));
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section h3 {
  margin: 0 0 1rem 0;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: uppercase;
}

.details-box {
  background: hsl(var(--muted) / 0.3);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.details-box p {
  margin: 0;
  font-size: 14px;
  display: flex;
  gap: 0.75rem;
}

.details-box strong {
  min-width: 100px;
  color: hsl(var(--muted-foreground));
}

.description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid hsl(var(--border));
}

.description-text {
  margin: 0.5rem 0 0 0;
  color: hsl(var(--foreground));
  font-weight: normal;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
}

.score-container {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  padding: 1.5rem;
}

.score-slider {
  flex: 1;
  height: 6px;
  cursor: pointer;
  accent-color: hsl(var(--brand));
}

.score-display-large {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  min-width: 80px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  color: hsl(var(--brand));
}

.score-max {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.score-guide {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.comments-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--muted) / 0.3);
  color: hsl(var(--foreground));
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.comments-textarea:focus {
  outline: none;
  border-color: hsl(var(--brand));
}

.char-count {
  margin-top: 0.5rem;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.2);
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: hsl(var(--brand));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover {
  background: hsl(var(--muted) / 0.8);
}

@media (max-width: 768px) {
  .jury-dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .works-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-body {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .score-container {
    flex-direction: column;
  }

  .score-display-large {
    width: 100%;
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
