<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="admin-header">
      <div>
        <h1 class="admin-title">Admin Panel</h1>
        <p class="admin-subtitle">Platform yönetimi ve kontrol merkezi</p>
      </div>
      <div class="admin-badge" v-if="authStore.isSuperAdmin">
        <Shield :size="16" /> Super Admin
      </div>
      <div class="admin-badge admin-badge--regular" v-else>
        <Shield :size="16" /> Admin
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', activeTab === tab.key && 'tab--active']"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" :size="18" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- ===================== USERS TAB ===================== -->
      <div v-if="activeTab === 'users'">
        <div class="section-header">
          <h2 class="section-title">Kullanıcılar</h2>
          <div class="search-box">
            <Search :size="16" />
            <input
              v-model="userSearch"
              type="text"
              placeholder="Kullanıcı ara..."
              class="search-input"
            />
          </div>
        </div>

        <div v-if="usersLoading" class="loading">Yükleniyor...</div>
        <div v-else class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Email</th>
                <th>Global Rol</th>
                <th>Yarışma Rolleri</th>
                <th>Kayıt Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      {{ (user.displayName || user.username)?.[0]?.toUpperCase() }}
                    </div>
                    <div>
                      <div class="user-name">{{ user.displayName || user.username }}</div>
                      <div class="user-username">@{{ user.username }}</div>
                    </div>
                  </div>
                </td>
                <td class="text-muted">{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', `role-badge--${user.globalRole?.toLowerCase()}`]">
                    {{ user.globalRole }}
                  </span>
                </td>
                <td>
                  <div class="contest-roles">
                    <span
                      v-for="cm in user.contestMembers"
                      :key="cm.contest?.id + cm.role"
                      class="contest-role-tag"
                    >
                      {{ cm.role }} @ {{ cm.contest?.title }}
                    </span>
                    <span v-if="!user.contestMembers?.length" class="text-muted">—</span>
                  </div>
                </td>
                <td class="text-muted">{{ formatDate(user.createdAt) }}</td>
                <td>
                  <select
                    :value="user.globalRole"
                    @change="changeRole(user, ($event.target as HTMLSelectElement).value)"
                    :disabled="!canEditRole(user)"
                    class="role-select"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option v-if="authStore.isSuperAdmin" value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===================== CONTESTS TAB ===================== -->
      <div v-if="activeTab === 'contests'">
        <div class="section-header">
          <h2 class="section-title">Onay Bekleyen Yarışmalar</h2>
        </div>

        <div v-if="contestsLoading" class="loading">Yükleniyor...</div>
        <div v-else-if="pendingContests.length === 0" class="empty-state">
          <CheckCircle :size="48" />
          <p>Onay bekleyen yarışma yok</p>
        </div>
        <div v-else class="contest-cards">
          <div v-for="contest in pendingContests" :key="contest.id" class="contest-card">
            <div class="contest-card-header">
              <div>
                <h3 class="contest-card-title">{{ contest.title }}</h3>
                <p class="contest-card-meta">
                  {{ contest.createdBy?.displayName || contest.createdBy?.username }} tarafından oluşturuldu
                </p>
              </div>
              <span class="status-badge status-badge--pending">Onay Bekliyor</span>
            </div>
            <p class="contest-card-desc">{{ contest.description?.substring(0, 200) }}...</p>
            <div class="contest-card-info">
              <span v-if="contest.category" class="info-tag">{{ contest.category }}</span>
              <span v-if="contest.maxParticipants" class="info-tag">Max: {{ contest.maxParticipants }}</span>
              <span class="info-tag">{{ contest.approvalMode === 'AUTO' ? 'Otomatik Onay' : 'Manuel Onay' }}</span>
            </div>
            <div class="contest-card-actions">
              <button class="btn btn--approve" @click="approveContest(contest.id)">
                <Check :size="16" /> Onayla
              </button>
              <button class="btn btn--reject" @click="openRejectModal(contest)">
                <X :size="16" /> Reddet
              </button>
            </div>
          </div>
        </div>

        <!-- All Contests -->
        <div class="section-header" style="margin-top: 2rem">
          <h2 class="section-title">Tüm Yarışmalar</h2>
        </div>
        <div v-if="allContests.length === 0" class="empty-state">
          <Trophy :size="48" />
          <p>Henüz yarışma yok</p>
        </div>
        <div v-else class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Yarışma</th>
                <th>Oluşturan</th>
                <th>Durum</th>
                <th>Başvuru</th>
                <th>Gönderim</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contest in allContests" :key="contest.id">
                <td class="font-medium">{{ contest.title }}</td>
                <td class="text-muted">{{ contest.createdBy?.displayName || contest.createdBy?.username }}</td>
                <td>
                  <span :class="['status-badge', `status-badge--${contest.status?.toLowerCase()}`]">
                    {{ contest.status }}
                  </span>
                </td>
                <td>{{ contest._count?.applications || 0 }}</td>
                <td>{{ contest._count?.submissions || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===================== SETTINGS TAB ===================== -->
      <div v-if="activeTab === 'settings'">
        <div class="section-header">
          <h2 class="section-title">Platform Ayarları</h2>
        </div>
        <div class="settings-placeholder">
          <Cog :size="48" />
          <p>Platform ayarları yakında eklenecek</p>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="rejectModal.show" class="modal-overlay" @click.self="rejectModal.show = false">
      <div class="modal">
        <h3 class="modal-title">Yarışmayı Reddet</h3>
        <p class="modal-subtitle">{{ rejectModal.contest?.title }}</p>
        <textarea
          v-model="rejectModal.note"
          placeholder="Red sebebini yazın..."
          class="modal-textarea"
          rows="4"
        ></textarea>
        <div class="modal-actions">
          <button class="btn btn--secondary" @click="rejectModal.show = false">İptal</button>
          <button class="btn btn--reject" @click="rejectContest" :disabled="!rejectModal.note.trim()">
            Reddet
          </button>
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
import {
  Shield, Search, Users, Trophy, Cog,
  Check, X, CheckCircle,
} from 'lucide-vue-next';

const authStore = useAuthStore();

// State
const activeTab = ref('users');
const userSearch = ref('');
const users = ref<any[]>([]);
const usersLoading = ref(true);
const pendingContests = ref<any[]>([]);
const allContests = ref<any[]>([]);
const contestsLoading = ref(true);
const rejectModal = ref({ show: false, contest: null as any, note: '' });

// Tabs
const tabs = computed(() => [
  { key: 'users', label: 'Kullanıcılar', icon: Users, badge: users.value.length || null },
  { key: 'contests', label: 'Yarışmalar', icon: Trophy, badge: pendingContests.value.length || null },
  { key: 'settings', label: 'Ayarlar', icon: Cog, badge: null },
]);

// Filtered users
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value;
  const q = userSearch.value.toLowerCase();
  return users.value.filter(
    (u: any) =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q)
  );
});

// Load data
onMounted(async () => {
  await Promise.all([loadUsers(), loadContests()]);
});

async function loadUsers() {
  usersLoading.value = true;
  try {
    const { data } = await axios.get('/api/users');
    users.value = data;
  } catch (e: any) {
    showToast('Kullanıcılar yüklenemedi', 'error');
  } finally {
    usersLoading.value = false;
  }
}

async function loadContests() {
  contestsLoading.value = true;
  try {
    const [pending, all] = await Promise.all([
      axios.get('/api/contests/pending'),
      axios.get('/api/contests'),
    ]);
    pendingContests.value = pending.data;
    allContests.value = all.data;
  } catch (e: any) {
    showToast('Yarışmalar yüklenemedi', 'error');
  } finally {
    contestsLoading.value = false;
  }
}

// Role management
function canEditRole(user: any) {
  if (user.id === authStore.user?.id) return false;
  if (user.globalRole === 'SUPER_ADMIN') return false;
  if (user.globalRole === 'ADMIN' && !authStore.isSuperAdmin) return false;
  return true;
}

async function changeRole(user: any, newRole: string) {
  try {
    await axios.put(`/api/users/${user.id}/role`, { globalRole: newRole });
    user.globalRole = newRole;
    showToast(`${user.username} → ${newRole}`, 'success');
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Rol değiştirilemedi', 'error');
    await loadUsers();
  }
}

// Contest approval
async function approveContest(contestId: string) {
  try {
    await axios.put(`/api/contests/${contestId}/approve`);
    showToast('Yarışma onaylandı', 'success');
    await loadContests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Onaylama başarısız', 'error');
  }
}

function openRejectModal(contest: any) {
  rejectModal.value = { show: true, contest, note: '' };
}

async function rejectContest() {
  try {
    await axios.put(`/api/contests/${rejectModal.value.contest.id}/reject`, {
      note: rejectModal.value.note,
    });
    showToast('Yarışma reddedildi', 'success');
    rejectModal.value.show = false;
    await loadContests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Reddetme başarısız', 'error');
  }
}

// Utils
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.admin-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.admin-subtitle {
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: hsl(var(--brand));
  color: white;
}

.admin-badge--regular {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid hsl(var(--border));
  margin-bottom: 1.5rem;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  color: hsl(var(--muted-foreground));
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
  border-radius: 8px 8px 0 0;
}

.tab--active {
  color: hsl(var(--brand));
  border-bottom-color: hsl(var(--brand));
}

.tab-badge {
  background: hsl(var(--brand));
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
}

/* Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
}

.search-input {
  border: none;
  outline: none;
  background: none;
  color: hsl(var(--foreground));
  font-size: 0.85rem;
  width: 200px;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--background));
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
}

.table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover td {
  background: hsl(var(--muted) / 0.5);
}

/* User cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: hsl(var(--brand));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.user-name {
  font-weight: 600;
}

.user-username {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
}

/* Role badges */
.role-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge--user {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.role-badge--admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge--super_admin {
  background: hsl(var(--brand) / 0.15);
  color: hsl(var(--brand));
}

/* Contest roles */
.contest-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.contest-role-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

/* Role select */
.role-select {
  padding: 0.35rem 0.5rem;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.8rem;
  cursor: pointer;
}

.role-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge--pending_approval { background: #fef3c7; color: #92400e; }
.status-badge--approved { background: #d1fae5; color: #065f46; }
.status-badge--rejected { background: #fee2e2; color: #991b1b; }
.status-badge--active { background: #dbeafe; color: #1e40af; }
.status-badge--draft { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }
.status-badge--completed { background: #e0e7ff; color: #3730a3; }
.status-badge--finalized { background: #d1fae5; color: #065f46; }
.status-badge--pending { background: #fef3c7; color: #92400e; }

/* Contest cards */
.contest-cards {
  display: grid;
  gap: 1rem;
}

.contest-card {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 1.25rem;
  background: hsl(var(--background));
}

.contest-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.contest-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.contest-card-meta {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
}

.contest-card-desc {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.contest-card-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.info-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.contest-card-actions {
  display: flex;
  gap: 0.5rem;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--approve {
  background: #059669;
  color: white;
}

.btn--approve:hover {
  background: #047857;
}

.btn--reject {
  background: #dc2626;
  color: white;
}

.btn--reject:hover {
  background: #b91c1c;
}

.btn--reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--secondary {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.btn--secondary:hover {
  background: hsl(var(--border));
}

/* Empty & Loading */
.loading {
  text-align: center;
  padding: 3rem;
  color: hsl(var(--muted-foreground));
}

.empty-state, .settings-placeholder {
  text-align: center;
  padding: 4rem 2rem;
  color: hsl(var(--muted-foreground));
  border: 1px dashed hsl(var(--border));
  border-radius: 12px;
}

.empty-state p, .settings-placeholder p {
  margin-top: 0.75rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: hsl(var(--background));
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.modal-subtitle {
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
  margin-bottom: 1rem;
}

.modal-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.85rem;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Utils */
.text-muted { color: hsl(var(--muted-foreground)); }
.font-medium { font-weight: 500; }
</style>