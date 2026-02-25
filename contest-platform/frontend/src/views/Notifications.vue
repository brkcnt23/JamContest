<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from '@/composables/useToast';
import { Bell, Trophy, Gavel, CheckCircle, XCircle, Info, Check, Trash2, RefreshCw } from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

interface Notification {
  id: string;
  type: 'JURY_INVITATION' | 'CONTEST_APPROVED' | 'CONTEST_REJECTED' | 'SUBMISSION_RESULT' | 'SYSTEM';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const notifications = ref<Notification[]>([]);
const loading = ref(true);
const filter = ref<'all' | 'unread'>('all');

const filtered = computed(() =>
  filter.value === 'unread' ? notifications.value.filter(n => !n.read) : notifications.value
);

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

async function load() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/notifications');
    notifications.value = data;
  } catch {
    showToast('Bildirimler yüklenemedi', 'error');
  } finally {
    loading.value = false;
  }
}

async function markRead(n: Notification) {
  if (!n.read) {
    try {
      await axios.put(`/api/notifications/${n.id}/read`);
      n.read = true;
    } catch { /* silent */ }
  }
  if (n.link) router.push(n.link);
}

async function markAllRead() {
  try {
    await axios.put('/api/notifications/read-all');
    notifications.value.forEach(n => (n.read = true));
    showToast('Tümü okundu olarak işaretlendi', 'success');
  } catch {
    showToast('Hata', 'error');
  }
}

async function deleteNotif(id: string, e: Event) {
  e.stopPropagation();
  try {
    await axios.delete(`/api/notifications/${id}`);
    notifications.value = notifications.value.filter(n => n.id !== id);
  } catch {
    showToast('Silinemedi', 'error');
  }
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa önce`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}g önce`;
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

function typeConfig(type: Notification['type']) {
  const map = {
    JURY_INVITATION:   { icon: Gavel,       color: 'var(--brand)',    bg: 'var(--brand-bg)' },
    CONTEST_APPROVED:  { icon: CheckCircle,  color: '#10b981',         bg: 'rgba(16,185,129,0.1)' },
    CONTEST_REJECTED:  { icon: XCircle,      color: '#ef4444',         bg: 'rgba(239,68,68,0.1)' },
    SUBMISSION_RESULT: { icon: Trophy,       color: '#f59e0b',         bg: 'rgba(245,158,11,0.1)' },
    SYSTEM:            { icon: Info,         color: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted))' },
  };
  return map[type] ?? map.SYSTEM;
}

onMounted(load);
</script>

<template>
  <div class="notif-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Bildirimler</h1>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }} okunmamış</span>
      </div>
      <div class="header-actions">
        <button @click="load" class="icon-btn" title="Yenile">
          <RefreshCw class="w-4 h-4" :class="loading && 'spin'" />
        </button>
        <button v-if="unreadCount > 0" @click="markAllRead" class="btn btn--ghost">
          <Check class="w-4 h-4" /> Tümünü Okundu İşaretle
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button :class="['tab', filter === 'all' && 'tab--active']" @click="filter = 'all'">
        Tümü <span class="tab-count">{{ notifications.length }}</span>
      </button>
      <button :class="['tab', filter === 'unread' && 'tab--active']" @click="filter = 'unread'">
        Okunmamış <span class="tab-count">{{ unreadCount }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <p>Yükleniyor...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="empty-state">
      <Bell class="empty-icon" />
      <p class="empty-title">{{ filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok' }}</p>
      <p class="empty-sub">Yeni aktiviteler burada görünecek</p>
    </div>

    <!-- List -->
    <div v-else class="notif-list">
      <div
        v-for="n in filtered"
        :key="n.id"
        :class="['notif-item', !n.read && 'notif-item--unread', n.link && 'notif-item--clickable']"
        @click="markRead(n)"
      >
        <!-- Icon -->
        <div
          class="notif-icon"
          :style="{ background: typeConfig(n.type).bg, color: typeConfig(n.type).color }"
        >
          <component :is="typeConfig(n.type).icon" class="w-5 h-5" />
        </div>

        <!-- Content -->
        <div class="notif-content">
          <div class="notif-header">
            <p class="notif-title">{{ n.title }}</p>
            <span class="notif-time">{{ timeAgo(n.createdAt) }}</span>
          </div>
          <p class="notif-body">{{ n.body }}</p>
          <span v-if="n.link" class="notif-link-hint">Görüntülemek için tıkla →</span>
        </div>

        <!-- Unread dot -->
        <div v-if="!n.read" class="unread-dot" />

        <!-- Delete -->
        <button class="delete-btn" @click="deleteNotif(n.id, $event)" title="Sil">
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-page { max-width: 720px; margin: 0 auto; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.unread-badge { padding: 0.2rem 0.65rem; background: hsl(var(--brand)); color: white; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.header-actions { display: flex; align-items: center; gap: 0.5rem; }

.icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid hsl(var(--border)); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: hsl(var(--muted-foreground)); transition: all 0.15s; }
.icon-btn:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; border-radius: 8px; font-size: 0.825rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; }
.btn--ghost { background: transparent; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); }
.btn--ghost:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }

/* Tabs */
.filter-tabs { display: flex; gap: 0.25rem; margin-bottom: 1rem; border-bottom: 1px solid hsl(var(--border)); }
.tab { padding: 0.6rem 1rem; background: none; border: none; border-bottom: 2px solid transparent; font-size: 0.875rem; font-weight: 500; color: hsl(var(--muted-foreground)); cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: all 0.15s; margin-bottom: -1px; }
.tab:hover { color: hsl(var(--foreground)); }
.tab--active { color: hsl(var(--foreground)); border-bottom-color: hsl(var(--brand)); }
.tab-count { font-size: 0.7rem; padding: 0.1rem 0.4rem; background: hsl(var(--muted)); border-radius: 9999px; }
.tab--active .tab-count { background: hsl(var(--brand) / 0.15); color: hsl(var(--brand)); }

/* States */
.loading-state { text-align: center; padding: 4rem 2rem; color: hsl(var(--muted-foreground)); }
.spinner { width: 28px; height: 28px; border: 2px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
.empty-state { text-align: center; padding: 5rem 2rem; }
.empty-icon { width: 48px; height: 48px; color: hsl(var(--border)); margin: 0 auto 1rem; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.25rem; }
.empty-sub { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }

/* List */
.notif-list { display: flex; flex-direction: column; gap: 0; border: 1px solid hsl(var(--border)); border-radius: 12px; overflow: hidden; }

.notif-item {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 1rem 1.25rem; background: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border)); position: relative;
  transition: background 0.15s;
}
.notif-item:last-child { border-bottom: none; }
.notif-item--unread { background: hsl(var(--brand) / 0.03); }
.notif-item--clickable { cursor: pointer; }
.notif-item--clickable:hover { background: hsl(var(--muted) / 0.5); }

.notif-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.notif-content { flex: 1; min-width: 0; }
.notif-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.2rem; }
.notif-title { font-size: 0.9rem; font-weight: 600; color: hsl(var(--foreground)); }
.notif-time { font-size: 0.75rem; color: hsl(var(--muted-foreground)); white-space: nowrap; flex-shrink: 0; }
.notif-body { font-size: 0.825rem; color: hsl(var(--muted-foreground)); line-height: 1.5; }
.notif-link-hint { font-size: 0.75rem; color: hsl(var(--brand)); margin-top: 0.25rem; display: block; }

.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: hsl(var(--brand)); flex-shrink: 0; margin-top: 0.4rem; }

.delete-btn {
  width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: hsl(var(--muted-foreground)); opacity: 0; transition: all 0.15s; flex-shrink: 0;
}
.notif-item:hover .delete-btn { opacity: 1; }
.delete-btn:hover { background: hsl(0 72% 51% / 0.1); color: hsl(0 72% 51%); }
</style>