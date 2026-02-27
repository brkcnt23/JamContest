<template>
  <div class="admin-page">
    <div class="admin-header">
      <div>
        <h1 class="admin-title">Admin Panel</h1>
        <p class="admin-subtitle">Platform yönetimi ve kontrol merkezi</p>
      </div>
      <div class="admin-badge" v-if="authStore.isSuperAdmin"><Shield :size="16" /> Super Admin</div>
      <div class="admin-badge admin-badge--regular" v-else><Shield :size="16" /> Admin</div>
    </div>

    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.key" :class="['tab', activeTab === tab.key && 'tab--active']" @click="activeTab = tab.key">
        <component :is="tab.icon" :size="18" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="tab-content">
      <!-- Users Tab -->
      <div v-if="activeTab === 'users'">
        <div class="section-header">
          <h2 class="section-title">Kullanıcılar</h2>
          <div class="header-controls">
            <div class="filter-group">
              <button v-for="f in roleFilters" :key="f.value" :class="['filter-btn', roleFilter === f.value && 'filter-btn--active']" @click="roleFilter = f.value">
                {{ f.label }} <span class="filter-count">{{ f.count }}</span>
              </button>
            </div>
            <div class="search-box">
              <Search :size="16" />
              <input v-model="userSearch" type="text" placeholder="Kullanıcı ara..." class="search-input" />
            </div>
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
                <th>Kayıt</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ (user.displayName || user.username)?.[0]?.toUpperCase() }}</div>
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
                    <span v-for="cm in user.contestMembers" :key="cm.contest?.id + cm.role" class="contest-role-tag">
                      {{ cm.role }} @ {{ cm.contest?.title }}
                    </span>
                    <span v-if="!user.contestMembers?.length" class="text-muted">—</span>
                  </div>
                </td>
                <td class="text-muted">{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <select :value="user.globalRole" @change="changeRole(user, ($event.target as HTMLSelectElement).value)" :disabled="!canEditRole(user)" class="role-select">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option v-if="authStore.isSuperAdmin" value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                    <button class="btn btn--assign btn--sm" @click="openAssignModal(user)" title="Yarışmaya Ata">
                      <UserPlus :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="text-center text-muted" style="padding:2rem">Sonuç bulunamadı</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Contests Tab -->
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
                <p class="contest-card-meta">{{ contest.createdBy?.displayName || contest.createdBy?.username }} tarafından</p>
              </div>
              <span class="status-badge status-badge--pending">Onay Bekliyor</span>
            </div>
            <p class="contest-card-desc">{{ contest.description?.substring(0, 200) }}...</p>
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

        <div class="section-header" style="margin-top:2rem">
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
                <th>Üyeler</th>
                <th>İşlem</th>
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
                <td>{{ contest._count?.members || 0 }}</td>
                <td>
                  <button class="btn btn--secondary btn--sm" @click="openContestMembersModal(contest)">
                    <Users :size="14" /> Üyeler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Jury Scores Tab -->
      <div v-if="activeTab === 'jury-scores'">
        <div class="section-header">
          <h2 class="section-title">Jüri Skorları</h2>
          <select v-model="selectedContestForScores" @change="loadContestScores(selectedContestForScores)" class="role-select" style="flex: 0 0 auto;">
            <option value="">Yarışma Seçin...</option>
            <option v-for="c in allContests" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>
        <div v-if="scoresLoading" class="loading">Yükleniyor...</div>
        <div v-else-if="!selectedContestForScores" class="empty-mini">Yarışma seçin</div>
        <div v-else-if="juryScores.length === 0" class="empty-mini">Skor bulunamadı</div>
        <div v-else class="table-wrapper">
          <table class="table">
            <thead><tr><th>Jüri</th><th>Katılımcı</th><th>Skor</th><th>Yorum</th><th>Tarih</th><th>İşlem</th></tr></thead>
            <tbody>
              <tr v-for="score in juryScores" :key="score.id" :style="{ opacity: score.archivedAt ? '0.5' : '1' }">
                <td>{{ score.jury?.displayName || score.jury?.username }}</td>
                <td>{{ score.submission?.user?.username }}</td>
                <td>{{ score.score }}</td>
                <td class="text-muted">{{ score.comment || '—' }}</td>
                <td class="text-muted">{{ formatDate(score.createdAt) }}</td>
                <td>
                  <button 
                    v-if="!score.archivedAt"
                    @click="archiveJuryScore(score.id)" 
                    class="btn btn--danger btn--xs"
                  >
                    Arşivle
                  </button>
                  <span v-else class="text-muted">Arşivlenmiş</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Requests Tab -->
      <div v-if="activeTab === 'edit-requests'">
        <div class="section-header">
          <h2 class="section-title">Düzenleme Talepleri</h2>
        </div>
        <div v-if="editRequests.length === 0" class="empty-mini">Düzenleme talebı bulunmamaktadır</div>
        <div v-else class="request-list">
          <div v-for="req in editRequests" :key="req.id" class="request-card">
            <div class="request-header">
              <div>
                <h4>{{ req.contest?.title }}</h4>
                <p class="text-muted">Tarafından: {{ req.requester?.displayName || req.requester?.username }}</p>
              </div>
              <small class="text-muted">{{ formatDate(req.createdAt) }}</small>
            </div>
            <div class="request-changes">
              <p><strong>Değişiklikler:</strong></p>
              <pre>{{ JSON.stringify(req.changes, null, 2) }}</pre>
            </div>
            <div class="request-actions">
              <button @click="approveEditRequest(req.id)" class="btn btn--approve btn--sm">Onayla</button>
              <button @click="rejectEditRequest(req.id)" class="btn btn--reject btn--sm">Reddet</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Requests Tab -->
      <div v-if="activeTab === 'cancel-requests'">
        <div class="section-header">
          <h2 class="section-title">İptal Talepleri</h2>
        </div>
        <div v-if="cancelRequests.length === 0" class="empty-mini">İptal talebı bulunmamaktadır</div>
        <div v-else class="request-list">
          <div v-for="req in cancelRequests" :key="req.id" class="request-card">
            <div class="request-header">
              <div>
                <h4>{{ req.contest?.title }}</h4>
                <p class="text-muted">Tarafından: {{ req.requester?.displayName || req.requester?.username }}</p>
              </div>
              <small class="text-muted">{{ formatDate(req.createdAt) }}</small>
            </div>
            <div class="request-reason">
              <p><strong>Sebep:</strong> {{ req.reason }}</p>
            </div>
            <div class="request-actions">
              <button @click="approveCancelRequest(req.contestId)" class="btn btn--approve btn--sm">Onayla (İptal Et)</button>
              <button @click="rejectCancelRequest(req.contestId)" class="btn btn--reject btn--sm">Reddet</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bans Tab (SUPER_ADMIN only) -->
      <div v-if="activeTab === 'bans' && authStore.isSuperAdmin">
        <div class="section-header">
          <h2 class="section-title">Aktif Ban Yönetimi</h2>
        </div>
        <div v-if="activeBans.length === 0" class="empty-mini">Aktif ban bulunmamaktadır</div>
        <div v-else class="request-list">
          <div v-for="ban in activeBans" :key="ban.id" class="request-card" style="border-color: #fee2e2;">
            <div class="request-header">
              <div>
                <h4>{{ ban.user?.username }} ({{ ban.user?.email }})</h4>
                <p class="text-muted">Ban Sebebi: {{ ban.reason }}</p>
              </div>
              <small class="text-muted">{{ formatDate(ban.createdAt) }}</small>
            </div>
            <div class="ban-restrictions">
              <p><strong>Kısıtlanan İşlemler:</strong></p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span v-for="r in ban.restrictions" :key="r" class="mini-badge" style="background: #fee2e2; color: #991b1b;">{{ r }}</span>
              </div>
            </div>
            <div class="request-actions">
              <button @click="removeBan(ban.id)" class="btn btn--danger btn--sm">Ban Kaldır</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
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
        <textarea v-model="rejectModal.note" placeholder="Red sebebini yazın..." class="modal-textarea" rows="4"></textarea>
        <div class="modal-actions">
          <button class="btn btn--secondary" @click="rejectModal.show = false">İptal</button>
          <button class="btn btn--reject" @click="rejectContest" :disabled="!rejectModal.note.trim()">Reddet</button>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="assignModal.show" class="modal-overlay" @click.self="assignModal.show = false">
      <div class="modal modal--wide">
        <h3 class="modal-title">Yarışmaya Üye Ata</h3>
        <p class="modal-subtitle">{{ assignModal.user?.displayName || assignModal.user?.username }}</p>
        <div class="assign-form">
          <div class="form-group">
            <label class="form-label">Yarışma *</label>
            <select v-model="assignModal.contestId" class="form-select">
              <option value="">Yarışma seçin...</option>
              <option v-for="c in allContests" :key="c.id" :value="c.id">{{ c.title }} ({{ c.status }})</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Rol *</label>
            <div class="role-options">
              <label v-for="r in contestRoleOptions" :key="r.value" :class="['role-option', assignModal.role === r.value && 'role-option--selected']">
                <input type="radio" :value="r.value" v-model="assignModal.role" />
                <span class="role-option-icon">{{ r.icon }}</span>
                <div>
                  <span class="role-option-name">{{ r.label }}</span>
                  <span class="role-option-desc">{{ r.desc }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div v-if="assignModal.user?.contestMembers?.length" class="current-assignments">
          <h4 class="mini-title">Mevcut Atamalar:</h4>
          <div class="assignment-tags">
            <span v-for="cm in assignModal.user.contestMembers" :key="cm.contest?.id + cm.role" class="assignment-tag">
              {{ cm.role }} @ {{ cm.contest?.title }}
              <button class="remove-tag" @click="removeAssignment(assignModal.user.id, cm.contest?.id, cm.role)">✕</button>
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn--secondary" @click="assignModal.show = false">İptal</button>
          <button class="btn btn--primary" @click="assignToContest" :disabled="!assignModal.contestId || !assignModal.role">
            <UserPlus :size="14" /> Ata
          </button>
        </div>
      </div>
    </div>

    <!-- Contest Members Modal -->
    <div v-if="membersModal.show" class="modal-overlay" @click.self="membersModal.show = false">
      <div class="modal modal--wide">
        <h3 class="modal-title">{{ membersModal.contest?.title }} — Üyeler</h3>
        <div class="add-member-row">
          <input v-model="membersModal.searchQuery" type="text" class="form-input" placeholder="Kullanıcı ara..." @input="searchUsersForMembers" />
          <select v-model="membersModal.newRole" class="form-select form-select--sm">
            <option value="ORGANIZER">Organizer</option>
            <option value="CO_ORGANIZER">Co-Organizer</option>
            <option value="JURY">Jury</option>
            <option value="PARTICIPANT">Participant</option>
          </select>
        </div>
        <div v-if="membersModal.searchResults.length" class="search-dropdown">
          <div v-for="u in membersModal.searchResults" :key="u.id" class="search-dropdown-item" @click="addMemberToContest(u)">
            {{ u.displayName || u.username }} <span class="text-muted">{{ u.email }}</span>
          </div>
        </div>
        <div v-if="membersModal.members.length === 0" class="empty-mini">Henüz üye yok</div>
        <div v-else class="members-list">
          <div v-for="m in membersModal.members" :key="m.id" class="member-row">
            <div class="user-avatar-sm">{{ m.user?.displayName?.[0] || m.user?.username?.[0] || '?' }}</div>
            <span class="member-name">{{ m.user?.displayName || m.user?.username }}</span>
            <span :class="['mini-badge', `mini-badge--${m.role.toLowerCase()}`]">{{ m.role }}</span>
            <button class="btn btn--danger btn--xs" @click="removeMemberFromContest(m.userId, m.role)">Çıkar</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn--secondary" @click="membersModal.show = false">Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import { Shield, Search, Users, Trophy, Cog, Check, X, CheckCircle, UserPlus } from 'lucide-vue-next';

const authStore = useAuthStore();
const route = useRoute();
const activeTab = ref('users');
const userSearch = ref('');
const roleFilter = ref('ALL');
const users = ref<any[]>([]);
const usersLoading = ref(true);
const pendingContests = ref<any[]>([]);
const allContests = ref<any[]>([]);
const contestsLoading = ref(true);
const editRequests = ref<any[]>([]);
const cancelRequests = ref<any[]>([]);
const activeBans = ref<any[]>([]);
const juryScores = ref<any[]>([]);
const selectedContestForScores = ref('');
const scoresLoading = ref(false);

const rejectModal = ref({ show: false, contest: null as any, note: '' });
const assignModal = ref({ show: false, user: null as any, contestId: '', role: '' });
const membersModal = ref({ show: false, contest: null as any, members: [] as any[], searchQuery: '', searchResults: [] as any[], newRole: 'JURY' });

const contestRoleOptions = [
  { value: 'ORGANIZER', label: 'Organizer', icon: '👑', desc: 'Yarışmayı yönetir' },
  { value: 'CO_ORGANIZER', label: 'Co-Organizer', icon: '🤝', desc: 'Yardımcı organizatör' },
  { value: 'JURY', label: 'Jüri', icon: '⚖️', desc: 'Eserleri puanlar' },
  { value: 'PARTICIPANT', label: 'Katılımcı', icon: '🎨', desc: 'Yarışmaya katılır' },
];

const tabs = computed(() => [
  { key: 'users', label: 'Kullanıcılar', icon: Users, badge: users.value.length || null },
  { key: 'contests', label: 'Yarışmalar', icon: Trophy, badge: pendingContests.value.length || null },
  { key: 'jury-scores', label: 'Jüri Skorları', icon: CheckCircle, badge: null },
  { key: 'edit-requests', label: 'Düzenleme Talepleri', icon: Check, badge: editRequests.value.length || null },
  { key: 'cancel-requests', label: 'İptal Talepleri', icon: X, badge: cancelRequests.value.length || null },
  { key: 'bans', label: 'Banlar', icon: Shield, badge: activeBans.value.length || null },
  { key: 'settings', label: 'Ayarlar', icon: Cog, badge: null },
]);

const roleFilters = computed(() => {
  const all = users.value;
  const hasContestRole = (role: string) => all.filter((u: any) => u.contestMembers?.some((cm: any) => cm.role === role));
  return [
    { label: 'Tümü', value: 'ALL', count: all.length },
    { label: 'Super Admin', value: 'SUPER_ADMIN', count: all.filter((u: any) => u.globalRole === 'SUPER_ADMIN').length },
    { label: 'Admin', value: 'ADMIN', count: all.filter((u: any) => u.globalRole === 'ADMIN').length },
    { label: 'Organizatör', value: 'ORGANIZER', count: hasContestRole('ORGANIZER').length },
    { label: 'Jüri', value: 'JURY', count: hasContestRole('JURY').length },
    { label: 'Katılımcı', value: 'PARTICIPANT', count: hasContestRole('PARTICIPANT').length },
    { label: 'User', value: 'USER', count: all.filter((u: any) => u.globalRole === 'USER').length },
  ];
});

const filteredUsers = computed(() => {
  let result = users.value;
  if (roleFilter.value !== 'ALL') {
    const globalRoles = ['SUPER_ADMIN', 'ADMIN', 'USER'];
    if (globalRoles.includes(roleFilter.value)) {
      result = result.filter((u: any) => u.globalRole === roleFilter.value);
    } else {
      result = result.filter((u: any) => u.contestMembers?.some((cm: any) => cm.role === roleFilter.value));
    }
  }
  if (userSearch.value) {
    const q = userSearch.value.toLowerCase();
    result = result.filter((u: any) => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q));
  }
  return result;
});

onMounted(async () => {
  const tabParam = route.query.tab as string;
  if (tabParam) activeTab.value = tabParam;
  
  await Promise.all([loadUsers(), loadContests(), loadRequests(), loadBans()]);
});

watch(() => route.query.tab, (tab) => {
  if (tab) activeTab.value = tab as string;
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
    const [p, a] = await Promise.all([
      axios.get('/api/contests/pending'),
      axios.get('/api/contests'),
    ]);
    pendingContests.value = p.data;
    allContests.value = a.data;
  } catch (e: any) {
    showToast('Yarışmalar yüklenemedi', 'error');
  } finally {
    contestsLoading.value = false;
  }
}

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
    showToast(e.response?.data?.message || 'Hata', 'error');
    await loadUsers();
  }
}

async function approveContest(id: string) {
  try {
    await axios.put(`/api/contests/${id}/approve`);
    showToast('Onaylandı', 'success');
    await loadContests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

function openRejectModal(c: any) {
  rejectModal.value = { show: true, contest: c, note: '' };
}

async function rejectContest() {
  try {
    await axios.put(`/api/contests/${rejectModal.value.contest.id}/reject`, { note: rejectModal.value.note });
    showToast('Reddedildi', 'success');
    rejectModal.value.show = false;
    await loadContests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

function openAssignModal(user: any) {
  assignModal.value = { show: true, user, contestId: '', role: '' };
}

async function assignToContest() {
  try {
    await axios.post(`/api/contests/${assignModal.value.contestId}/members`, {
      userId: assignModal.value.user.id,
      role: assignModal.value.role,
    });
    showToast(`${assignModal.value.user.displayName || assignModal.value.user.username} → ${assignModal.value.role}`, 'success');
    assignModal.value.show = false;
    await loadUsers();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function removeAssignment(userId: string, contestId: string, role: string) {
  try {
    await axios.delete(`/api/contests/${contestId}/members/${userId}/${role}`);
    showToast('Kaldırıldı', 'success');
    await loadUsers();
    if (assignModal.value.user?.id === userId) {
      assignModal.value.user = users.value.find(u => u.id === userId);
    }
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function openContestMembersModal(contest: any) {
  membersModal.value = { show: true, contest, members: [], searchQuery: '', searchResults: [], newRole: 'JURY' };
  try {
    const { data } = await axios.get(`/api/contests/${contest.id}/members`);
    membersModal.value.members = data;
  } catch (e: any) {
    // silently fail
  }
}

let searchTimeout: any;

function searchUsersForMembers() {
  clearTimeout(searchTimeout);
  const q = membersModal.value.searchQuery;
  if (!q || q.length < 2) {
    membersModal.value.searchResults = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(q)}`);
      membersModal.value.searchResults = data.filter(
        (u: any) => !membersModal.value.members.some(m => m.userId === u.id && m.role === membersModal.value.newRole)
      );
    } catch (e: any) {
      membersModal.value.searchResults = [];
    }
  }, 300);
}

async function addMemberToContest(user: any) {
  try {
    await axios.post(`/api/contests/${membersModal.value.contest.id}/members`, {
      userId: user.id,
      role: membersModal.value.newRole,
    });
    showToast(`${user.displayName || user.username} → ${membersModal.value.newRole}`, 'success');
    membersModal.value.searchQuery = '';
    membersModal.value.searchResults = [];
    const { data } = await axios.get(`/api/contests/${membersModal.value.contest.id}/members`);
    membersModal.value.members = data;
    await loadUsers();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function removeMemberFromContest(userId: string, role: string) {
  try {
    await axios.delete(`/api/contests/${membersModal.value.contest.id}/members/${userId}/${role}`);
    showToast('Çıkarıldı', 'success');
    const { data } = await axios.get(`/api/contests/${membersModal.value.contest.id}/members`);
    membersModal.value.members = data;
    await loadUsers();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

// ====== NEW: Requests and Bans ======

async function loadRequests() {
  try {
    const [editRes, cancelRes] = await Promise.all([
      axios.get('/api/contests/admin/edit-requests'),
      axios.get('/api/contests/admin/cancel-requests'),
    ]);
    editRequests.value = editRes.data;
    cancelRequests.value = cancelRes.data;
  } catch (e: any) {
    showToast('Taleptemler yüklenemedi', 'error');
  }
}

async function loadBans() {
  try {
    const { data } = await axios.get('/api/users/bans/active');
    activeBans.value = data;
  } catch (e: any) {
    showToast('Banlar yüklenemedi', 'error');
  }
}

async function approveEditRequest(requestId: string) {
  try {
    await axios.put(`/api/contests/admin/edit-requests/${requestId}/approve`);
    showToast('Düzenleme talebı onaylandı', 'success');
    await loadRequests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function rejectEditRequest(requestId: string) {
  try {
    const note = prompt('RED SEBEBİ GİRİN:');
    if (!note) return;
    await axios.put(`/api/contests/admin/edit-requests/${requestId}/reject`, { adminNote: note });
    showToast('Düzenleme talebı reddedildi', 'success');
    await loadRequests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function approveCancelRequest(contestId: string) {
  try {
    await axios.put(`/api/contests/${contestId}/cancel-request/approve`);
    showToast('İptal talebı onaylandı', 'success');
    await loadRequests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function rejectCancelRequest(contestId: string) {
  try {
    const note = prompt('RED SEBEBİ GİRİN:');
    if (!note) return;
    await axios.put(`/api/contests/${contestId}/cancel-request/reject`, { adminNote: note });
    showToast('İptal talebı reddedildi', 'success');
    await loadRequests();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function removeBan(banId: string) {
  try {
    await axios.delete(`/api/users/${activeBans.value.find(b => b.id === banId)?.user?.id}/ban/${banId}`);
    showToast('Ban kaldırıldı', 'success');
    await loadBans();
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function archiveJuryScore(scoreId: string) {
  try {
    await axios.delete(`/api/contests/jury-scores/${scoreId}`);
    showToast('Skor arşivlendi', 'success');
    if (selectedContestForScores.value) {
      await loadContestScores(selectedContestForScores.value);
    }
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

async function loadContestScores(contestId: string) {
  if (!contestId) return;
  scoresLoading.value = true;
  try {
    const { data } = await axios.get(`/api/contests/${contestId}/jury/scores`);
    juryScores.value = data;
  } catch (e: any) {
    showToast('Skorlar yüklenemedi', 'error');
  } finally {
    scoresLoading.value = false;
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

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
  margin: 0;
}

.admin-subtitle {
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
  margin: 0;
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

.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid hsl(var(--border));
  margin-bottom: 1.5rem;
  overflow-x: auto;
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
  white-space: nowrap;
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
  margin-left: 0.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
}

.header-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid hsl(var(--border));
  border-radius: 9999px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: hsl(var(--brand));
  color: hsl(var(--foreground));
}

.filter-btn--active {
  background: hsl(var(--brand));
  color: white;
  border-color: hsl(var(--brand));
}

.filter-count {
  font-size: 0.65rem;
  opacity: 0.7;
}

.filter-btn--active .filter-count {
  opacity: 1;
}

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
  white-space: nowrap;
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

.text-center {
  text-align: center;
}

.text-muted {
  color: hsl(var(--muted-foreground));
}

.font-medium {
  font-weight: 500;
}

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
  flex-shrink: 0;
}

.user-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: hsl(var(--brand));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  margin: 0;
}

.user-username {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

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

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge--pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge--approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge--rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge--active {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge--draft {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.status-badge--finalized {
  background: #d1fae5;
  color: #065f46;
}

.status-badge--judging {
  background: #e0e7ff;
  color: #3730a3;
}

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
  gap: 1rem;
}

.contest-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
}

.contest-card-meta {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
  margin: 0;
}

.contest-card-desc {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.contest-card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn--sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.btn--xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
}

.btn--primary {
  background: hsl(var(--brand));
  color: white;
}

.btn--primary:hover {
  opacity: 0.9;
}

.btn--primary:disabled {
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

.btn--assign {
  background: hsl(var(--brand) / 0.1);
  color: hsl(var(--brand));
  border: 1px solid hsl(var(--brand) / 0.3);
}

.btn--assign:hover {
  background: hsl(var(--brand) / 0.2);
}

.btn--danger {
  background: transparent;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn--danger:hover {
  background: #fee2e2;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: hsl(var(--muted-foreground));
}

.empty-state,
.settings-placeholder {
  text-align: center;
  padding: 4rem 2rem;
  color: hsl(var(--muted-foreground));
  border: 1px dashed hsl(var(--border));
  border-radius: 12px;
}

.empty-state p,
.settings-placeholder p {
  margin-top: 0.75rem;
  margin: 0;
}

.empty-mini {
  padding: 1.5rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  font-size: 0.85rem;
}

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
  max-height: 90vh;
  overflow-y: auto;
}

.modal--wide {
  max-width: 560px;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
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
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.assign-form {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.3rem;
}

.form-select,
.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.85rem;
  font-family: inherit;
}

.form-select {
  width: 100%;
}

.form-select--sm {
  width: auto;
}

.form-input {
  width: 100%;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: hsl(var(--brand));
}

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.role-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem;
  border: 2px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.role-option:hover {
  border-color: hsl(var(--brand));
}

.role-option--selected {
  border-color: hsl(var(--brand));
  background: hsl(var(--brand) / 0.05);
}

.role-option input {
  display: none;
}

.role-option-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.role-option-name {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.role-option-desc {
  display: block;
  font-size: 0.7rem;
  color: hsl(var(--muted-foreground));
}

.current-assignments {
  margin-bottom: 1rem;
}

.mini-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
  margin: 0 0 0.5rem 0;
}

.assignment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.assignment-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: hsl(var(--muted));
  border-radius: 4px;
  font-size: 0.7rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0;
  margin-left: 0.25rem;
}

.add-member-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.search-dropdown {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 160px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.search-dropdown-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid hsl(var(--border));
}

.search-dropdown-item:last-child {
  border-bottom: none;
}

.search-dropdown-item:hover {
  background: hsl(var(--muted));
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 250px;
  overflow-y: auto;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
}

.member-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
}

.mini-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.mini-badge--organizer {
  background: #fef3c7;
  color: #92400e;
}

.mini-badge--co_organizer {
  background: #fed7aa;
  color: #9a3412;
}

.mini-badge--jury {
  background: #e0e7ff;
  color: #3730a3;
}

.mini-badge--participant {
  background: #d1fae5;
  color: #065f46;
}

/* Request cards */
.request-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-left: 4px solid hsl(var(--brand));
  border-radius: 10px;
  padding: 1rem;
}

.request-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.request-header h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.request-header p {
  margin: 0;
  font-size: 0.8rem;
}

.request-changes,
.request-reason,
.ban-restrictions {
  background: hsl(var(--muted) / 0.5);
  padding: 0.75rem;
  border-radius: 6px;
  margin: 0.75rem 0;
  font-size: 0.85rem;
}

.request-changes pre {
  background: hsl(var(--background));
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  margin:  0.5rem 0 0 0;
  font-size: 0.75rem;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

.btn--xs {
  padding: 0.3rem 0.5rem;
  font-size: 0.75rem;
}

.empty-mini {
  padding: 2rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
}
</style>

```
