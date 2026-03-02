<template>
  <div class="social-bar">
    <!-- Like Button -->
    <button
      @click="toggleLike"
      :disabled="liking"
      :class="['social-button', isLiked && 'active']"
      :title="isLiked ? 'Unlike' : 'Like'"
    >
      <Heart :size="20" :fill="isLiked ? 'currentColor' : 'none'" />
      <span class="social-count">{{ likeCount }}</span>
    </button>

    <!-- Comment Button -->
    <button
      @click="$emit('show-comments')"
      class="social-button"
      :title="'Comments'"
    >
      <MessageCircle :size="20" />
      <span class="social-count">{{ commentCount }}</span>
    </button>

    <!-- Follow Button (show if not own submission) -->
    <button
      v-if="submissionUserId && submissionUserId !== currentUserId"
      @click="toggleFollow"
      :disabled="following"
      :class="['social-button', isFollowingUser && 'active']"
      :title="isFollowingUser ? 'Unfollow' : 'Follow'"
    >
      <UserPlus :size="20" />
      <span>{{ isFollowingUser ? 'Following' : 'Follow' }}</span>
    </button>

    <!-- Share Button -->
    <button
      @click="shareSubmission"
      class="social-button"
      :title="'Share'"
    >
      <Share2 :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Heart, MessageCircle, UserPlus, Share2 } from 'lucide-vue-next';
import { useSocialStore } from '@/stores/social';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  submissionId: string;
  submissionUserId?: string;
  likeCount: number;
  commentCount: number;
}>();

const emit = defineEmits<{
  'show-comments': [];
}>();

const socialStore = useSocialStore();
const authStore = useAuthStore();

const liking = ref(false);
const following = ref(false);

const currentUserId = computed(() => authStore.user?.id || '');
const isLiked = computed(() => socialStore.isLiked(props.submissionId));
const isFollowingUser = computed(() => 
  props.submissionUserId ? socialStore.isFollowing(props.submissionUserId) : false
);

async function toggleLike() {
  liking.value = true;
  try {
    if (isLiked.value) {
      await socialStore.unlike(props.submissionId);
    } else {
      await socialStore.like(props.submissionId);
    }
  } catch (error) {
    console.error('Like toggle failed:', error);
  } finally {
    liking.value = false;
  }
}

async function toggleFollow() {
  if (!props.submissionUserId) return;
  following.value = true;
  try {
    if (isFollowingUser.value) {
      await socialStore.unfollow(props.submissionUserId);
    } else {
      await socialStore.follow(props.submissionUserId);
    }
  } catch (error) {
    console.error('Follow toggle failed:', error);
  } finally {
    following.value = false;
  }
}

function shareSubmission() {
  if (navigator.share) {
    navigator.share({
      title: 'JamContest Submission',
      text: 'Check out this submission on JamContest',
      url: window.location.href,
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}
</script>

<style scoped>
.social-bar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid hsl(var(--border));
  border-bottom: 1px solid hsl(var(--border));
  margin: 1rem 0;
}

.social-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: hsl(var(--muted));
  border: none;
  border-radius: 0.5rem;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: hsl(var(--muted)) / 0.8;
    color: hsl(var(--foreground));
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: hsl(var(--brand)) / 0.15;
    color: hsl(var(--brand));
  }
}

.social-count {
  font-size: 0.75rem;
  min-width: 1.5rem;
  text-align: right;
}
</style>
