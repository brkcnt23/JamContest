<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-content">
          <!-- Close button -->
          <button @click="close" class="close-button">
            <X :size="24" />
          </button>

          <div class="modal-body">
            <!-- Submission Info -->
            <div class="submission-header">
              <div>
                <h2 class="submission-title">{{ submission?.title }}</h2>
                <p v-if="submission" class="submission-meta">
                  <span class="meta-item">
                    <User :size="14" />
                    {{ submission.user?.displayName || submission.user?.username }}
                  </span>
                  <span class="meta-item">
                    <Clock :size="14" />
                    {{ formatDate(submission.createdAt) }}
                  </span>
                </p>
              </div>

              <!-- Score Badge -->
              <div v-if="submission && avgScore" class="score-badge">
                <Star :size="20" :fill="'currentColor'" />
                <span>{{ avgScore }}</span>
              </div>
            </div>

            <!-- Description -->
            <div v-if="submission?.description" class="submission-section">
              <h3 class="section-title">Description</h3>
              <p class="description-text">{{ submission.description }}</p>
            </div>

            <!-- Link -->
            <div v-if="submission?.link" class="submission-section">
              <a
                :href="submission.link"
                target="_blank"
                rel="noopener"
                class="submission-link"
              >
                <ExternalLink :size="16" />
                View Submission
              </a>
            </div>

            <!-- Social Bar -->
            <SocialBar
              v-if="submission"
              :submission-id="submission.id"
              :submission-user-id="submission.userId"
              :like-count="likeCount"
              :comment-count="commentCount"
              @show-comments="showComments = true"
            />

            <!-- Comments Section -->
            <CommentsSection
              v-if="submission && showComments"
              :submission-id="submission.id"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, User, Clock, Star, ExternalLink } from 'lucide-vue-next';
import SocialBar from '@/components/common/SocialBar.vue';
import CommentsSection from '@/components/common/CommentsSection.vue';
import { useSocialStore } from '@/stores/social';

interface Score {
  score: number;
  comment?: string;
}

interface Submission {
  id: string;
  title: string;
  description?: string;
  link?: string;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    displayName?: string;
  };
  scores?: Score[];
}

const props = defineProps<{
  isOpen: boolean;
  submission?: Submission | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const socialStore = useSocialStore();
const showComments = ref(false);

const avgScore = computed(() => {
  if (!props.submission?.scores?.length) return null;
  const avg = props.submission.scores.reduce((a, b) => a + b.score, 0) / props.submission.scores.length;
  return avg.toFixed(1);
});

const likeCount = computed(() => socialStore.getLikeCount(props.submission?.id || '') || 0);
const commentCount = computed(() => props.submission?.id ? socialStore.getComments(props.submission.id)?.length || 0 : 0);

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      showComments.value = false;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

function close() {
  emit('close');
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background: hsl(var(--background));
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: sticky;
  top: 0;
  right: 0;
  background: hsl(var(--muted));
  border: none;
  color: hsl(var(--foreground));
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  float: right;
  margin: 1rem;
  z-index: 10;

  &:hover {
    background: hsl(var(--muted) / 0.8);
  }
}

.modal-body {
  padding: 2rem 1.5rem 1.5rem;
  clear: both;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.submission-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.submission-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.score-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: hsl(var(--brand) / 0.1);
  color: hsl(var(--brand));
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.submission-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.description-text {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.submission-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: hsl(var(--brand));
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    max-height: 100vh;
    border-radius: 0;
  }

  .submission-header {
    flex-direction: column;
  }

  .submission-title {
    font-size: 1.25rem;
  }
}
</style>
