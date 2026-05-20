<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/composables/useToast';
import axios from 'axios';
import { MessageCircle, ThumbsUp, ThumbsDown, Trash2, Send } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string; displayName?: string; avatar?: string };
}

interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: { id: string; username: string; displayName?: string; avatar?: string; badges?: any[] };
  votes: { type: string; userId: string }[];
  upvotes: number;
  downvotes: number;
  netScore: number;
  commentCount: number;
}

const feed = ref<Post[]>([]);
const loading = ref(true);
const tab = ref<'today' | 'past'>('today');

// Post creation
const showCreateModal = ref(false);
const newPostContent = ref('');
const newPostImage = ref('');
const creatingPost = ref(false);
const canPostState = ref<{ allowed: boolean; remaining: number; bannedUntil?: string } | null>(null);

async function checkCanPost() {
  if (!authStore.isAuthenticated) return;
  try {
    const { data } = await axios.get('/api/social/posts/can-post');
    canPostState.value = data;
  } catch { canPostState.value = null; }
}

async function createPost() {
  if (!newPostContent.value.trim()) return;
  creatingPost.value = true;
  try {
    await axios.post('/api/social/posts', { content: newPostContent.value, imageUrl: newPostImage.value || undefined });
    newPostContent.value = ''; newPostImage.value = '';
    showCreateModal.value = false;
    await checkCanPost();
    await loadFeed();
    showToast($t('social.post_created'), 'success');
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
  finally { creatingPost.value = false; }
}

// Comments state
const expandedComments = ref<Set<string>>(new Set());
const postComments = ref<Record<string, PostComment[]>>({});
const commentInputs = ref<Record<string, string>>({});
const submittingComment = ref<Record<string, boolean>>({});

// Image lightbox
const lightboxImage = ref('');
const showLightbox = ref(false);

function openLightbox(url: string) {
  lightboxImage.value = url;
  showLightbox.value = true;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  showLightbox.value = false;
  lightboxImage.value = '';
  document.body.style.overflow = '';
}

async function load() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/social/feed', { params: { tab: tab.value, take: 30 } });
    feed.value = data;
  } catch { /* silent */ }
  finally { loading.value = false; }
}

async function loadComments(postId: string) {
  if (postComments.value[postId]) return;
  try {
    const { data } = await axios.get(`/api/social/posts/${postId}/comments`);
    postComments.value[postId] = data;
  } catch { /* silent */ }
}

function toggleComments(postId: string) {
  if (expandedComments.value.has(postId)) {
    expandedComments.value.delete(postId);
  } else {
    expandedComments.value.add(postId);
    loadComments(postId);
  }
  // Trigger reactivity
  expandedComments.value = new Set(expandedComments.value);
}

async function votePost(postId: string, type: 'UP' | 'DOWN') {
  if (!authStore.isAuthenticated) return router.push('/login');
  try {
    await axios.post(`/api/social/posts/${postId}/vote`, { type });
    // Refresh feed to get updated scores
    const post = feed.value.find(p => p.id === postId);
    if (post) {
      const { data } = await axios.get('/api/social/feed', { params: { tab: tab.value, take: 1, postId } });
      if (data.length) Object.assign(post, data[0]);
    }
  } catch { /* silent */ }
}

async function addComment(postId: string) {
  if (!authStore.isAuthenticated) return router.push('/login');
  const content = commentInputs.value[postId]?.trim();
  if (!content) return;

  submittingComment.value[postId] = true;
  try {
    const { data } = await axios.post(`/api/social/posts/${postId}/comments`, { content });
    if (!postComments.value[postId]) postComments.value[postId] = [];
    postComments.value[postId].push(data);
    commentInputs.value[postId] = '';
  } catch { /* silent */ }
  finally { submittingComment.value[postId] = false; }
}

async function deletePost(postId: string) {
  try {
    await axios.delete(`/api/social/posts/${postId}`);
    feed.value = feed.value.filter(p => p.id !== postId);
  } catch { /* silent */ }
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('time.now');
  if (m < 60) return `${m}${t('time.min')}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${t('time.hour')}`;
  return `${Math.floor(h / 24)}${t('time.day')}`;
}

function switchTab(t: 'today' | 'past') {
  tab.value = t;
  load();
}

onMounted(() => { load(); checkCanPost(); });
</script>

<template>
  <div class="social-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('social.feed') }}</h1>
        <p class="page-subtitle">{{ $t('social.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="authStore.isAuthenticated" class="px-4 py-2 rounded-lg bg-[hsl(var(--brand))] text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
          :disabled="canPostState && !canPostState.allowed" @click="showCreateModal = true">
          <span>+</span> {{ $t('social.create_post') }}
        </button>
        <span v-if="canPostState && canPostState.remaining !== -1" class="text-xs text-[hsl(var(--muted-foreground))]">
          {{ canPostState.remaining }} {{ $t('social.remaining_posts') }}
        </span>
        <span v-else-if="canPostState && canPostState.remaining === -1" class="text-xs text-green-400">{{ $t('social.unlimited') }}</span>
      </div>
      <div class="tab-switcher">
        <button :class="['tab-btn', tab === 'today' && 'tab-btn--active']" @click="switchTab('today')">{{ $t('social.today') }}</button>
        <button :class="['tab-btn', tab === 'past' && 'tab-btn--active']" @click="switchTab('past')">{{ $t('social.past') }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
    </div>

    <!-- Empty -->
    <div v-else-if="feed.length === 0" class="empty-state">
      <p class="empty-title">{{ $t('social.no_posts') }}</p>
      <p class="empty-sub">{{ $t('social.first_post') }}</p>
    </div>

    <!-- Feed -->
    <div v-else class="feed-list">
      <div v-for="post in feed" :key="post.id" class="feed-card">
        <!-- User row -->
        <div class="card-header">
          <div class="user-row" @click="router.push(`/user/${post.user.id}`)">
            <img
              v-if="post.user.avatar"
              :src="post.user.avatar"
              class="user-avatar-img"
              @error="($event.target as HTMLImageElement).style.display='none'"
            />
            <div v-else class="user-avatar-fallback">{{ (post.user.displayName || post.user.username)[0].toUpperCase() }}</div>
            <div class="user-info">
              <p class="user-name">{{ post.user.displayName || post.user.username }}</p>
              <p class="user-handle">@{{ post.user.username }} · {{ timeAgo(post.createdAt) }}</p>
            </div>
          </div>
          <button
            v-if="authStore.user?.id === post.userId"
            class="delete-btn"
            @click="deletePost(post.id)"
            :title="t('common.delete')"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="card-body">
          <p class="post-content">{{ post.content }}</p>
          <div v-if="post.imageUrl" class="post-image-wrap" @click="openLightbox(post.imageUrl)">
            <img :src="post.imageUrl" class="post-image" loading="lazy" />
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button
            :class="['action-btn', post.votes?.some(v => v.userId === authStore.user?.id && v.type === 'UP') && 'action-btn--active']"
            @click="votePost(post.id, 'UP')"
          >
            <ThumbsUp class="w-4 h-4" />
            <span>{{ post.upvotes }}</span>
          </button>
          <button
            :class="['action-btn', post.votes?.some(v => v.userId === authStore.user?.id && v.type === 'DOWN') && 'action-btn--active-down']"
            @click="votePost(post.id, 'DOWN')"
          >
            <ThumbsDown class="w-4 h-4" />
            <span>{{ post.downvotes }}</span>
          </button>
          <button
            :class="['action-btn', expandedComments.has(post.id) && 'action-btn--active']"
            @click="toggleComments(post.id)"
          >
            <MessageCircle class="w-4 h-4" />
            <span>{{ postComments[post.id]?.length || post.commentCount || 0 }}</span>
          </button>
        </div>

        <!-- Comments section -->
        <div v-if="expandedComments.has(post.id)" class="comments-section">
          <div v-if="postComments[post.id]" class="comments-list">
            <div v-for="c in postComments[post.id]" :key="c.id" class="comment-item">
              <img
                v-if="c.user.avatar"
                :src="c.user.avatar"
                class="comment-avatar"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
              <div v-else class="comment-avatar-fallback">{{ (c.user.displayName || c.user.username)[0].toUpperCase() }}</div>
              <div class="comment-body">
                <span class="comment-user">{{ c.user.displayName || c.user.username }}</span>
                <span class="comment-text">{{ c.content }}</span>
                <span class="comment-time">{{ timeAgo(c.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Comment input -->
          <div class="comment-input-row">
            <input
              v-model="commentInputs[post.id]"
              type="text"
              class="comment-input"
              :placeholder="t('social.write_comment')"
              @keydown.enter="addComment(post.id)"
            />
            <button
              class="comment-send-btn"
              :disabled="!commentInputs[post.id]?.trim() || submittingComment[post.id]"
              @click="addComment(post.id)"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox-backdrop" @click="closeLightbox">
        <img :src="lightboxImage" class="lightbox-img" @click.stop />
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
      </div>
    </Teleport>

    <!-- Create Post Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-[300] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showCreateModal = false"></div>
        <div class="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg mx-4 p-6">
          <h2 class="text-xl font-bold text-[hsl(var(--foreground))] mb-4">{{ $t('social.create_post_title') }}</h2>
          <div class="space-y-4">
            <div>
              <textarea v-model="newPostContent" rows="5" maxlength="2000"
                class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm resize-y focus:outline-none focus:border-[hsl(var(--brand))]"
                :placeholder="$t('social.post_content_placeholder')"></textarea>
              <p class="text-xs text-[hsl(var(--muted-foreground))] mt-1 text-right">{{ newPostContent.length }}/2000</p>
            </div>
            <div>
              <input v-model="newPostImage" type="url"
                class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--brand))]"
                :placeholder="$t('social.post_image_placeholder')" />
            </div>
          </div>
          <div class="flex items-center gap-3 mt-6">
            <button :disabled="creatingPost || !newPostContent.trim()"
              class="px-5 py-2.5 rounded-lg bg-[hsl(var(--brand))] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              @click="createPost">{{ creatingPost ? $t('social.publishing') : $t('social.publish') }}</button>
            <button class="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm hover:bg-[hsl(var(--muted))] transition-colors"
              @click="showCreateModal = false">{{ $t('common.cancel') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.social-page { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.2rem; }

.tab-switcher { display: flex; gap: 0.25rem; background: hsl(var(--muted)); border-radius: 10px; padding: 3px; }
.tab-btn { padding: 0.4rem 1rem; border: none; border-radius: 8px; background: transparent; color: hsl(var(--muted-foreground)); font-size: 0.825rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.tab-btn--active { background: hsl(var(--background)); color: hsl(var(--foreground)); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.loading-state { display: flex; justify-content: center; padding: 4rem; }
.spinner { width: 28px; height: 28px; border: 2px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 5rem 2rem; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.4rem; }
.empty-sub { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }

.feed-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
@media (max-width: 1024px) { .feed-list { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .feed-list { grid-template-columns: 1fr; } }

.feed-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 14px; overflow: hidden; transition: border-color 0.15s; }
.feed-card:hover { border-color: hsl(var(--brand) / 0.3); }

/* Header */
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem 0; }
.user-row { display: flex; align-items: center; gap: 0.7rem; cursor: pointer; flex: 1; min-width: 0; }
.user-row:hover .user-name { color: hsl(var(--brand)); }
.user-avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.user-avatar-fallback { width: 40px; height: 40px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
.user-info { overflow: hidden; }
.user-name { font-size: 0.9rem; font-weight: 600; color: hsl(var(--foreground)); transition: color 0.15s; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-handle { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
.delete-btn { padding: 4px; border-radius: 6px; border: none; background: transparent; color: hsl(var(--muted-foreground)); cursor: pointer; }
.delete-btn:hover { background: hsl(var(--muted)); color: #ef4444; }

/* Body */
.card-body { padding: 0.75rem 1.25rem; }
.post-content { font-size: 0.925rem; color: hsl(var(--foreground)); line-height: 1.65; white-space: pre-line; word-break: break-word; }
.post-image-wrap { margin-top: 0.75rem; border-radius: 10px; overflow: hidden; }
.post-image { width: 100%; max-height: 320px; object-fit: cover; display: block; }

/* Actions */
.card-actions { display: flex; gap: 0.25rem; padding: 0.5rem 1rem; border-top: 1px solid hsl(var(--border)); }
.action-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.75rem; border-radius: 8px; border: none; background: transparent; color: hsl(var(--muted-foreground)); font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.action-btn:hover { background: hsl(var(--muted)); }
.action-btn--active { color: hsl(var(--brand)); background: hsl(var(--brand) / 0.08); }
.action-btn--active-down { color: #ef4444; background: hsl(var(--muted)); }

/* Comments */
.comments-section { border-top: 1px solid hsl(var(--border)); background: hsl(var(--muted) / 0.3); }
.comments-list { padding: 0.75rem 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; max-height: 300px; overflow-y: auto; }
.comment-item { display: flex; gap: 0.5rem; align-items: flex-start; }
.comment-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; margin-top: 2px; }
.comment-avatar-fallback { width: 28px; height: 28px; border-radius: 50%; background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.65rem; flex-shrink: 0; margin-top: 2px; }
.comment-body { display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: baseline; }
.comment-user { font-size: 0.8rem; font-weight: 600; color: hsl(var(--foreground)); }
.comment-text { font-size: 0.825rem; color: hsl(var(--foreground)); word-break: break-word; }
.comment-time { font-size: 0.7rem; color: hsl(var(--muted-foreground)); }

.comment-input-row { display: flex; gap: 0.5rem; padding: 0.6rem 1.25rem; border-top: 1px solid hsl(var(--border)); }
.comment-input { flex: 1; padding: 0.55rem 0.85rem; border-radius: 10px; border: 1px solid hsl(var(--border)); background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.825rem; outline: none; }
.comment-input:focus { border-color: hsl(var(--brand)); }
.comment-input::placeholder { color: hsl(var(--muted-foreground)); }
.comment-send-btn { padding: 0.5rem 0.75rem; border-radius: 10px; border: 1px solid hsl(var(--border)); background: hsl(var(--brand)); color: white; cursor: pointer; display: flex; align-items: center; }
.comment-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Lightbox */
.lightbox-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  display: flex; align-items: center; justify-content: center;
  cursor: zoom-out;
}
.lightbox-img {
  max-width: 90vw; max-height: 90vh;
  object-fit: contain; border-radius: 8px;
  cursor: default;
}
.lightbox-close {
  position: absolute; top: 1.5rem; right: 1.5rem;
  width: 44px; height: 44px; border-radius: 50%;
  border: none; background: rgba(255,255,255,0.1);
  color: white; font-size: 1.5rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.25); }

.post-image-wrap { cursor: zoom-in; }
</style>
