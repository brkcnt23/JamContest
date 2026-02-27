<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/composables/useSocket';
import axios from 'axios';
import { Send, Search, MessageSquare, X, ArrowLeft, MoreVertical } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { connect, disconnect, joinConversation, leaveConversation, sendMessage: socketSend, on, off } = useSocket();

// ── Types ─────────────────────────────────────────────
interface User { id: string; username: string; displayName?: string; avatar?: string }
interface Message { id: string; conversationId: string; senderId: string; body: string; createdAt: string; sender: User }
interface Conversation {
  id: string;
  updatedAt: string;
  participants: { userId: string; lastReadAt: string; user: User }[];
  messages: Message[];
  _unread?: number;
}

// ── State ─────────────────────────────────────────────
const conversations = ref<Conversation[]>([]);
const activeConvId = ref<string | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref('');
const convLoading = ref(true);
const msgLoading = ref(false);
const sending = ref(false);
const searchQuery = ref('');
const searchResults = ref<User[]>([]);
const searchLoading = ref(false);
const showSearch = ref(false);
const messagesEndRef = ref<HTMLElement | null>(null);

// ── Computed ──────────────────────────────────────────
const activeConv = computed(() => conversations.value.find(c => c.id === activeConvId.value));

const otherUser = computed((): User | null => {
  if (!activeConv.value) return null;
  const p = activeConv.value.participants.find(p => p.userId !== authStore.user?.id);
  return p?.user ?? null;
});

const filteredConvs = computed(() => {
  // sort by last message time
  return [...conversations.value].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
});

// ── Helpers ───────────────────────────────────────────
function avatar(u?: User | null): string {
  return (u?.displayName || u?.username || '?')[0].toUpperCase();
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'şimdi';
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

function formatMsgTime(d: string): string {
  return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatMsgDate(d: string): string {
  const today = new Date(); const date = new Date(d);
  if (date.toDateString() === today.toDateString()) return 'Bugün';
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Dün';
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' });
}

function lastMessage(conv: Conversation): string {
  const last = conv.messages[conv.messages.length - 1];
  if (!last) return 'Henüz mesaj yok';
  const isMe = last.senderId === authStore.user?.id;
  const preview = last.body.length > 40 ? last.body.slice(0, 40) + '…' : last.body;
  return isMe ? `Sen: ${preview}` : preview;
}

function isUnread(conv: Conversation): boolean {
  const me = conv.participants.find(p => p.userId === authStore.user?.id);
  if (!me) return false;
  const last = conv.messages[conv.messages.length - 1];
  if (!last) return false;
  return last.senderId !== authStore.user?.id && new Date(last.createdAt) > new Date(me.lastReadAt);
}

// Group messages by date for separators
function groupedMessages() {
  const groups: { date: string; msgs: Message[] }[] = [];
  let currentDate = '';
  for (const m of messages.value) {
    const d = formatMsgDate(m.createdAt);
    if (d !== currentDate) {
      groups.push({ date: d, msgs: [m] });
      currentDate = d;
    } else {
      groups[groups.length - 1].msgs.push(m);
    }
  }
  return groups;
}

// ── API ───────────────────────────────────────────────
async function loadConversations() {
  try {
    const { data } = await axios.get('/api/messages/conversations');
    conversations.value = data;
  } catch { /* silent */ }
  finally { convLoading.value = false; }
}

async function openConversation(convId: string) {
  if (activeConvId.value === convId) return;
  if (activeConvId.value) leaveConversation(activeConvId.value);
  activeConvId.value = convId;
  joinConversation(convId);
  messages.value = [];
  msgLoading.value = true;
  try {
    const { data } = await axios.get(`/api/messages/conversations/${convId}/messages`);
    messages.value = data;
    await axios.put(`/api/messages/conversations/${convId}/read`);
    // mark local as read
    const conv = conversations.value.find(c => c.id === convId);
    if (conv) {
      const me = conv.participants.find(p => p.userId === authStore.user?.id);
      if (me) me.lastReadAt = new Date().toISOString();
    }
  } catch { /* silent */ }
  finally {
    msgLoading.value = false;
    scrollBottom();
  }
}

async function startConversation(user: User) {
  showSearch.value = false;
  searchQuery.value = '';
  searchResults.value = [];
  try {
    const { data } = await axios.post('/api/messages/conversations', { otherUserId: user.id });
    // check if already in list
    const exists = conversations.value.find(c => c.id === data.conversationId);
    if (!exists) await loadConversations();
    await openConversation(data.conversationId);
  } catch { /* silent */ }
}

async function sendMessage() {
  const body = newMessage.value.trim();
  if (!body || !activeConvId.value || sending.value) return;
  const optimistic: Message = {
    id: `temp-${Date.now()}`,
    conversationId: activeConvId.value,
    senderId: authStore.user!.id,
    body,
    createdAt: new Date().toISOString(),
    sender: authStore.user as User,
  };
  messages.value.push(optimistic);
  newMessage.value = '';
  scrollBottom();
  socketSend(activeConvId.value, body);
}

let searchTimeout: ReturnType<typeof setTimeout>;
async function searchUsers() {
  clearTimeout(searchTimeout);
  if (!searchQuery.value || searchQuery.value.length < 2) { searchResults.value = []; return; }
  searchTimeout = setTimeout(async () => {
    searchLoading.value = true;
    try {
      const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(searchQuery.value)}`);
      searchResults.value = data.filter((u: User) => u.id !== authStore.user?.id);
    } catch { searchResults.value = []; }
    finally { searchLoading.value = false; }
  }, 300);
}

function scrollBottom() {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' });
  });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

// ── Lifecycle ─────────────────────────────────────────
onMounted(async () => {
  connect();

  on('new_message', (msg: Message) => {
    if (msg.conversationId !== activeConvId.value) return;
    // replace optimistic if exists, otherwise push
    const idx = messages.value.findIndex(m => m.id.startsWith('temp-') && m.body === msg.body);
    if (idx !== -1) messages.value[idx] = msg;
    else messages.value.push(msg);
    scrollBottom();
  });

  on('conversation_updated', async ({ conversationId }: { conversationId: string }) => {
    await loadConversations();
  });

  await loadConversations();
  const withUserId = route.query.with as string;
  if (withUserId) {
    try {
      const { data } = await axios.post('/api/messages/conversations', { otherUserId: withUserId });
      if (!conversations.value.find(c => c.id === data.conversationId)) await loadConversations();
      await openConversation(data.conversationId);
    } catch { /* silent */ }
  } else if (conversations.value.length) {
    await openConversation(conversations.value[0].id);
  }
});

onUnmounted(() => {
  off('new_message', () => {});
  off('conversation_updated', () => {});
  disconnect();
});

watch(searchQuery, searchUsers);
</script>

<template>
  <div class="messages-page">
    <div class="conv-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Mesajlar</h2>
        <button class="icon-btn" @click="showSearch = !showSearch" title="Yeni konuşma">
          <Search class="w-4 h-4" />
        </button>
      </div>

      <!-- New conversation search -->
      <div v-if="showSearch" class="new-conv-panel">
        <div class="search-box">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kullanıcı ara..."
            class="search-input"
            autofocus
          />
          <button @click="showSearch = false; searchQuery = ''; searchResults = []" class="close-btn">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div v-if="searchLoading" class="search-hint">Aranıyor...</div>
        <div v-else-if="searchResults.length" class="search-results">
          <button
            v-for="u in searchResults"
            :key="u.id"
            class="search-result-item"
            @click="startConversation(u)"
          >
            <div class="user-avatar">{{ avatar(u) }}</div>
            <div>
              <p class="user-name">{{ u.displayName || u.username }}</p>
              <p class="user-handle">@{{ u.username }}</p>
            </div>
          </button>
        </div>
        <div v-else-if="searchQuery.length >= 2" class="search-hint">Kullanıcı bulunamadı</div>
      </div>

      <!-- Loading -->
      <div v-if="convLoading" class="conv-loading">
        <div class="spinner" />
      </div>

      <!-- Empty -->
      <div v-else-if="conversations.length === 0 && !showSearch" class="conv-empty">
        <MessageSquare class="empty-icon" />
        <p>Henüz mesajınız yok</p>
        <small>Kullanıcı araması yaparak konuşma başlatın</small>
      </div>

      <!-- List -->
      <div v-else class="conv-list">
        <button
          v-for="conv in filteredConvs"
          :key="conv.id"
          :class="['conv-item', activeConvId === conv.id && 'conv-item--active', isUnread(conv) && 'conv-item--unread']"
          @click="openConversation(conv.id)"
        >
          <div class="conv-avatar">
            {{ avatar(conv.participants.find(p => p.userId !== authStore.user?.id)?.user) }}
          </div>
          <div class="conv-info">
            <div class="conv-top">
              <span class="conv-name">
                {{ conv.participants.find(p => p.userId !== authStore.user?.id)?.user?.displayName ||
                   conv.participants.find(p => p.userId !== authStore.user?.id)?.user?.username || '?' }}
              </span>
              <span class="conv-time">{{ timeAgo(conv.updatedAt) }}</span>
            </div>
            <p class="conv-preview" :class="isUnread(conv) && 'conv-preview--bold'">
              {{ lastMessage(conv) }}
            </p>
          </div>
          <div v-if="isUnread(conv)" class="unread-dot" />
        </button>
      </div>
    </div>

    <!-- Main: message thread -->
    <div class="msg-main" :class="!activeConvId && 'msg-main-hidden-mobile'">
      <!-- No conversation selected -->
      <div v-if="!activeConvId" class="no-conv">
        <MessageSquare class="no-conv-icon" />
        <p>Bir konuşma seçin</p>
        <small>ya da yeni bir konuşma başlatın</small>
      </div>

      <template v-else>
        <!-- Thread header -->
        <div class="thread-header">
          <button class="back-btn" @click="activeConvId = null">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="thread-avatar">{{ avatar(otherUser) }}</div>
          <div class="thread-info">
            <p class="thread-name">{{ otherUser?.displayName || otherUser?.username }}</p>
            <p class="thread-handle">@{{ otherUser?.username }}</p>
          </div>
          <button
            v-if="otherUser"
            class="icon-btn ml-auto"
            @click="router.push(`/user/${otherUser.id}`)"
            title="Profile git"
          >
            <MoreVertical class="w-4 h-4" />
          </button>
        </div>

        <!-- Messages -->
        <div class="msg-body">
          <div v-if="msgLoading" class="msg-loading">
            <div class="spinner" />
          </div>

          <div v-else-if="messages.length === 0" class="msg-empty">
            Konuşmayı başlatmak için mesaj gönderin
          </div>

          <template v-else>
            <template v-for="group in groupedMessages()" :key="group.date">
              <div class="date-separator">
                <span>{{ group.date }}</span>
              </div>
              <div
                v-for="m in group.msgs"
                :key="m.id"
                :class="['msg-row', m.senderId === authStore.user?.id && 'msg-row--mine']"
              >
                <div
                  v-if="m.senderId !== authStore.user?.id"
                  class="msg-avatar"
                >{{ avatar(m.sender) }}</div>
                <div class="msg-bubble-wrap">
                  <div
                    :class="['msg-bubble', m.senderId === authStore.user?.id ? 'bubble--mine' : 'bubble--theirs']"
                  >{{ m.body }}</div>
                  <span class="msg-time">{{ formatMsgTime(m.createdAt) }}</span>
                </div>
              </div>
            </template>
          </template>

          <div ref="messagesEndRef" />
        </div>

        <!-- Input -->
        <div class="msg-input-bar">
          <textarea
            v-model="newMessage"
            placeholder="Mesaj yaz..."
            class="msg-textarea"
            rows="1"
            @keydown="handleKeydown"
          />
          <button
            class="send-btn"
            :disabled="!newMessage.trim() || sending"
            @click="sendMessage"
          >
            <Send class="w-4 h-4" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.messages-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 64px);
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
  background: hsl(var(--background));
}

/* ── Sidebar ── */
.conv-sidebar {
  border-right: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid hsl(var(--border));
  flex-shrink: 0;
}
.sidebar-title { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid hsl(var(--border));
  background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: hsl(var(--muted-foreground)); transition: all 0.15s;
}
.icon-btn:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.ml-auto { margin-left: auto; }

/* New conversation search */
.new-conv-panel { padding: 0.75rem; border-bottom: 1px solid hsl(var(--border)); flex-shrink: 0; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: hsl(var(--muted-foreground)); }
.search-input { width: 100%; padding: 0.5rem 2.25rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--muted)); color: hsl(var(--foreground)); font-size: 0.825rem; outline: none; }
.search-input:focus { border-color: hsl(var(--brand)); }
.close-btn { position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: hsl(var(--muted-foreground)); display: flex; }
.search-hint { font-size: 0.775rem; color: hsl(var(--muted-foreground)); padding: 0.5rem 0.25rem; }
.search-results { display: flex; flex-direction: column; gap: 0.125rem; margin-top: 0.5rem; }
.search-result-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.5rem; border-radius: 8px; border: none; background: transparent; cursor: pointer; text-align: left; transition: background 0.15s; }
.search-result-item:hover { background: hsl(var(--muted)); }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
.user-name { font-size: 0.825rem; font-weight: 600; color: hsl(var(--foreground)); }
.user-handle { font-size: 0.7rem; color: hsl(var(--muted-foreground)); }

/* Conv list */
.conv-loading { display: flex; justify-content: center; padding: 2rem; }
.conv-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 2rem; text-align: center; color: hsl(var(--muted-foreground)); gap: 0.5rem; font-size: 0.875rem; }
.empty-icon { width: 32px; height: 32px; color: hsl(var(--border)); }
.conv-list { flex: 1; overflow-y: auto; }

.conv-item {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; padding: 0.85rem 1.25rem; border: none; background: transparent;
  cursor: pointer; text-align: left; transition: background 0.15s; position: relative;
}
.conv-item:hover { background: hsl(var(--muted) / 0.5); }
.conv-item--active { background: hsl(var(--brand) / 0.08); }
.conv-item--unread { background: hsl(var(--brand) / 0.04); }

.conv-avatar { width: 40px; height: 40px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }
.conv-info { flex: 1; min-width: 0; }
.conv-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.15rem; }
.conv-name { font-size: 0.875rem; font-weight: 600; color: hsl(var(--foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conv-time { font-size: 0.7rem; color: hsl(var(--muted-foreground)); flex-shrink: 0; }
.conv-preview { font-size: 0.775rem; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conv-preview--bold { font-weight: 600; color: hsl(var(--foreground)); }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: hsl(var(--brand)); flex-shrink: 0; }

/* ── Main thread ── */
.msg-main { display: flex; flex-direction: column; overflow: hidden; }

.no-conv { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 0.5rem; color: hsl(var(--muted-foreground)); }
.no-conv-icon { width: 48px; height: 48px; color: hsl(var(--border)); margin-bottom: 0.5rem; }
.no-conv p { font-size: 1rem; font-weight: 500; color: hsl(var(--foreground)); }
.no-conv small { font-size: 0.825rem; }

.thread-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1.25rem; border-bottom: 1px solid hsl(var(--border)); flex-shrink: 0;
}
.back-btn { background: none; border: none; cursor: pointer; color: hsl(var(--muted-foreground)); display: flex; align-items: center; display: none; }
.thread-avatar { width: 36px; height: 36px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.825rem; flex-shrink: 0; }
.thread-name { font-size: 0.9rem; font-weight: 600; color: hsl(var(--foreground)); }
.thread-handle { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }

.msg-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.15rem; }
.msg-loading { display: flex; justify-content: center; padding: 2rem; }
.msg-empty { text-align: center; color: hsl(var(--muted-foreground)); font-size: 0.875rem; padding: 2rem; margin: auto; }

.date-separator { display: flex; align-items: center; justify-content: center; margin: 1rem 0 0.5rem; }
.date-separator span { font-size: 0.7rem; color: hsl(var(--muted-foreground)); background: hsl(var(--background)); padding: 0 0.75rem; position: relative; z-index: 1; }
.date-separator::before { content: ''; position: absolute; left: 1.25rem; right: 1.25rem; height: 1px; background: hsl(var(--border)); }

.msg-row { display: flex; align-items: flex-end; gap: 0.5rem; margin-bottom: 0.25rem; }
.msg-row--mine { flex-direction: row-reverse; }
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; flex-shrink: 0; }
.msg-bubble-wrap { display: flex; flex-direction: column; max-width: 70%; }
.msg-row--mine .msg-bubble-wrap { align-items: flex-end; }
.msg-bubble { padding: 0.55rem 0.9rem; border-radius: 14px; font-size: 0.875rem; line-height: 1.5; word-break: break-word; white-space: pre-wrap; }
.bubble--mine { background: hsl(var(--brand)); color: white; border-bottom-right-radius: 4px; }
.bubble--theirs { background: hsl(var(--muted)); color: hsl(var(--foreground)); border-bottom-left-radius: 4px; }
.msg-time { font-size: 0.65rem; color: hsl(var(--muted-foreground)); margin-top: 0.2rem; padding: 0 0.2rem; }

.msg-input-bar {
  display: flex; align-items: flex-end; gap: 0.75rem;
  padding: 0.75rem 1.25rem; border-top: 1px solid hsl(var(--border)); flex-shrink: 0;
}
.msg-textarea {
  flex: 1; padding: 0.6rem 0.9rem; border: 1px solid hsl(var(--border));
  border-radius: 12px; background: hsl(var(--muted) / 0.5); color: hsl(var(--foreground));
  font-size: 0.875rem; resize: none; outline: none; font-family: inherit;
  max-height: 120px; transition: border-color 0.15s;
}
.msg-textarea:focus { border-color: hsl(var(--brand)); }
.send-btn {
  width: 38px; height: 38px; border-radius: 10px; border: none;
  background: hsl(var(--brand)); color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { opacity: 0.85; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Scrollbar */
.conv-list::-webkit-scrollbar, .msg-body::-webkit-scrollbar { width: 4px; }
.conv-list::-webkit-scrollbar-thumb, .msg-body::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }

/* Spinner */
.spinner { width: 24px; height: 24px; border: 2px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile */
@media (max-width: 768px) {
  .messages-page { grid-template-columns: 1fr; }
  .sidebar-hidden-mobile { display: none; }
  .msg-main-hidden-mobile { display: none; }
  .back-btn { display: flex; }
}
</style>