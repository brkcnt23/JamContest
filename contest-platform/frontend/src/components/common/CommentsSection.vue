<template>
  <div class="comments-section">
    <div class="comments-header">
      <h3>Comments ({{ currentComments.length }})</h3>
    </div>

    <!-- Add Comment Form -->
    <div v-if="currentUserId" class="add-comment-form">
      <div class="input-group">
        <textarea
          v-model="newComment"
          placeholder="Add a comment..."
          rows="3"
          @keyup.ctrl.enter="submitComment"
          class="comment-input"
        ></textarea>
        <button
          @click="submitComment"
          :disabled="!newComment.trim() || submitting"
          class="submit-button"
        >
          {{ submitting ? 'Posting...' : 'Post Comment' }}
        </button>
      </div>
    </div>

    <!-- Comments List -->
    <div class="comments-list">
      <div v-if="currentComments.length === 0" class="empty-state">
        <MessageCircle :size="32" />
        <p>No comments yet. Be the first to comment!</p>
      </div>

      <div v-for="comment in currentComments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <div class="user-info">
            <img
              v-if="comment.user?.avatar"
              :src="comment.user.avatar"
              :alt="comment.user.username"
              class="user-avatar"
            />
            <div class="user-badge" v-else>{{ comment.user?.username?.[0] || 'U' }}</div>
            <div>
              <div class="username">{{ comment.user?.username || 'Anonymous' }}</div>
              <div class="timestamp">{{ formatDate(comment.createdAt) }}</div>
            </div>
          </div>

          <!-- Delete Button (only for own comments) -->
          <button
            v-if="comment.userId === currentUserId"
            @click="deleteComment(comment.id)"
            :disabled="deleting"
            class="delete-button"
            title="Delete comment"
          >
            <Trash2 :size="16" />
          </button>
        </div>

        <div class="comment-content">
          {{ comment.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { MessageCircle, Trash2 } from 'lucide-vue-next';
import { useSocialStore } from '@/stores/social';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import type { Comment } from '@/types';

const props = defineProps<{
  submissionId: string;
}>();

const socialStore = useSocialStore();
const authStore = useAuthStore();
const toast = useToast();

const newComment = ref('');
const submitting = ref(false);
const deleting = ref(false);
const refreshInterval = ref<NodeJS.Timer>();

const currentUserId = computed(() => authStore.user?.id || '');
const currentComments = computed(() => socialStore.getComments(props.submissionId) || []);

onMounted(async () => {
  await loadComments();
  // Auto-refresh comments every 5 seconds
  refreshInterval.value = setInterval(loadComments, 5000);
});

onBeforeUnmount(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

async function loadComments() {
  try {
    await socialStore.fetchComments(props.submissionId);
  } catch (error) {
    console.error('Failed to load comments:', error);
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return;

  submitting.value = true;
  try {
    await socialStore.addComment(props.submissionId, newComment.value);
    newComment.value = '';
    toast.success('Comment posted!');
    await loadComments();
  } catch (error) {
    console.error('Failed to post comment:', error);
    toast.error('Failed to post comment');
  } finally {
    submitting.value = false;
  }
}

async function deleteComment(commentId: string) {
  if (!confirm('Delete this comment?')) return;

  deleting.value = true;
  try {
    await socialStore.deleteComment(props.submissionId, commentId);
    toast.success('Comment deleted!');
    await loadComments();
  } catch (error) {
    console.error('Failed to delete comment:', error);
    toast.error('Failed to delete comment');
  } finally {
    deleting.value = false;
  }
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
}
</script>

<style scoped>
.comments-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid hsl(var(--border));
}

.comments-header {
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
}

.add-comment-form {
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-input {
  padding: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--input));
  color: hsl(var(--foreground));
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: hsl(var(--brand));
    box-shadow: 0 0 0 2px hsl(var(--brand) / 0.1);
  }
}

.submit-button {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background: hsl(var(--brand));
  color: hsl(var(--brand-foreground));
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: hsl(var(--muted-foreground));

  svg {
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
}

.comment-item {
  padding: 1rem;
  background: hsl(var(--muted) / 0.3);
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.user-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.user-badge {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: hsl(var(--brand));
  color: hsl(var(--brand-foreground));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.username {
  font-weight: 600;
  color: hsl(var(--foreground));
  font-size: 0.875rem;
}

.timestamp {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.125rem;
}

.delete-button {
  padding: 0.25rem 0.5rem;
  background: hsl(var(--destructive) / 0.1);
  border: none;
  border-radius: 0.375rem;
  color: hsl(var(--destructive));
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: hsl(var(--destructive) / 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.comment-content {
  line-height: 1.5;
  color: hsl(var(--foreground));
  word-wrap: break-word;
}
</style>
