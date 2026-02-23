<template>
  <div class="org-dashboard">
    <!-- Loading -->
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Yükleniyor...</p></div>

    <!-- No contests -->
    <div v-else-if="contests.length === 0" class="empty-state">
      <Trophy :size="48" />
      <h3>Henüz yarışmanız yok</h3>
      <p>Yarışma oluşturmak için aşağıdaki butona tıklayın</p>
      <router-link to="/contests/create" class="btn btn--primary" style="margin-top:1rem; display:inline-flex; text-decoration:none;">Yarışma Oluştur</router-link>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Organizatör Paneli</h1>
          <p class="page-subtitle">Yarışmalarınızı yönetin</p>
        </div>
      </div>

      <!-- Contest Selector -->
      <div class="contest-selector">
        <label class="selector-label">Yarışma Seçin:</label>
        <select v-model="selectedContestId" class="selector-select">
          <option v-for="c in contests" :key="c.id" :value="c.id">{{ c.title }} ({{ c.status }})</option>
        </select>
      </div>

      <!-- Tabs -->
      <div class="tabs" v-if="selectedContest">
        <button v-for="tab in tabs" :key="tab.key" :class="['tab', activeTab === tab.key && 'tab--active']" @click="activeTab = tab.key">
          <component :is="tab.icon" :size="16" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <div v-if="selectedContest" class="tab-content">

        <!-- ====== OVERVIEW ====== -->
        <div v-if="activeTab === 'overview'" class="section">
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">{{ applications.length }}</span>
              <span class="stat-label">Başvuru</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ applications.filter(a => a.status === 'APPROVED').length }}</span>
              <span class="stat-label">Onaylı</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ submissions.length }}</span>
              <span class="stat-label">Gönderim</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ juryMembers.length }}</span>
              <span class="stat-label">Jüri</span>
            </div>
          </div>

          <div class="status-section">
            <h3 class="section-title">Yarışma Durumu</h3>
            <span :class="['status-badge', `status-badge--${selectedContest.status?.toLowerCase()}`]">{{ selectedContest.status }}</span>
            <div class="status-actions" v-if="selectedContest.status === 'APPROVED' || selectedContest.status === 'APPLICATIONS'">
              <button class="btn btn--primary btn--sm" @click="changeStatus('ACTIVE')">Aktif Yap</button>
            </div>
            <div class="status-actions" v-if="selectedContest.status === 'ACTIVE'">
              <button class="btn btn--secondary btn--sm" @click="changeStatus('JUDGING')">Oylamaya Geç</button>
            </div>
          </div>
        </div>

        <!-- ====== APPLICATIONS ====== -->
        <div v-if="activeTab === 'applications'" class="section">
          <h3 class="section-title">Başvurular</h3>
          <div v-if="applications.length === 0" class="empty-mini">Henüz başvuru yok</div>
          <div v-else class="app-list">
            <div v-for="app in applications" :key="app.id" class="app-item">
              <div class="app-user">
                <div class="user-avatar">{{ app.user?.displayName?.[0] || app.user?.username?.[0] || '?' }}</div>
                <div>
                  <div class="user-name">{{ app.user?.displayName || app.user?.username }}</div>
                  <div class="user-email">{{ app.user?.email }}</div>
                </div>
              </div>
              <div class="app-message" v-if="app.message">{{ app.message }}</div>
              <div class="app-status">
                <span :class="['mini-badge', `mini-badge--${app.status?.toLowerCase()}`]">{{ app.status }}</span>
              </div>
              <div class="app-actions" v-if="app.status === 'PENDING'">
                <button class="btn btn--approve btn--sm" @click="approveApp(app.id)">Onayla</button>
                <button class="btn btn--reject btn--sm" @click="rejectApp(app.id)">Reddet</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ====== JURY ====== -->
        <div v-if="activeTab === 'jury'" class="section">
          <h3 class="section-title">Jüri Yönetimi</h3>

          <!-- Add jury -->
          <div class="add-member-box">
            <input v-model="jurySearch" type="text" class="form-input" placeholder="Kullanıcı adı veya email ile ara..." @input="searchUsers" />
            <div v-if="searchResults.length" class="search-results">
              <div v-for="u in searchResults" :key="u.id" class="search-result-item" @click="addJury(u)">
                <span class="result-name">{{ u.displayName || u.username }}</span>
                <span class="result-email">{{ u.email }}</span>
              </div>
            </div>
          </div>

          <!-- Jury list -->
          <div v-if="juryMembers.length === 0" class="empty-mini">Henüz jüri atanmamış</div>
          <div v-else class="member-list">
            <div v-for="m in juryMembers" :key="m.id" class="member-item">
              <div class="user-avatar">{{ m.user?.displayName?.[0] || m.user?.username?.[0] || '?' }}</div>
              <div class="member-info">
                <span class="user-name">{{ m.user?.displayName || m.user?.username }}</span>
                <span class="user-email">{{ m.user?.email }}</span>
              </div>
              <span class="role-tag">JURY</span>
              <button class="btn btn--danger btn--sm" @click="removeMember(m.user?.id, 'JURY')">Çıkar</button>
            </div>
          </div>
        </div>

        <!-- ====== SUBMISSIONS ====== -->
        <div v-if="activeTab === 'submissions'" class="section">
          <h3 class="section-title">Gönderimler</h3>
          <div v-if="submissions.length === 0" class="empty-mini">Henüz gönderim yok</div>
          <div v-else class="table-wrapper">
            <table class="table">
              <thead><tr><th>Katılımcı</th><th>Eser</th><th>Link</th><th>Tarih</th><th>Oy Sayısı</th></tr></thead>
              <tbody>
                <tr v-for="sub in submissions" :key="sub.id">
                  <td>{{ sub.user?.displayName || sub.user?.username }}</td>
                  <td class="font-medium">{{ sub.title }}</td>
                  <td><a v-if="sub.link" :href="sub.link" target="_blank" class="link">Görüntüle</a><span v-else class="text-muted">—</span></td>
                  <td class="text-muted">{{ formatDate(sub.submittedAt) }}</td>
                  <td>{{ sub._count?.scores || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Finalize -->
          <div v-if="selectedContest.status === 'JUDGING'" class="finalize-box">
            <p>Tüm jüriler oylamayı tamamladığında sonuçları hesaplayabilirsiniz.</p>
            <button class="btn btn--submit" @click="finalizeContest" :disabled="finalizing">
              {{ finalizing ? 'Hesaplanıyor...' : '🏆 Sonuçları Hesapla & Yayınla' }}
            </button>
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
import { Trophy, Eye, FileText, Users, Gavel } from 'lucide-vue-next';

const authStore = useAuthStore();

const loading = ref(true);
const contests = ref<any[]>([]);
const selectedContestId = ref('');
const activeTab = ref('overview');
const applications = ref<any[]>([]);
const submissions = ref<any[]>([]);
const members = ref<any[]>([]);
const jurySearch = ref('');
const searchResults = ref<any[]>([]);
const finalizing = ref(false);

const selectedContest = computed(() => contests.value.find(c => c.id === selectedContestId.value));
const juryMembers = computed(() => members.value.filter(m => m.role === 'JURY'));

const tabs = computed(() => [
  { key: 'overview', label: 'Genel Bakış', icon: Eye, badge: null },
  { key: 'applications', label: 'Başvurular', icon: FileText, badge: applications.value.filter(a => a.status === 'PENDING').length || null },
  { key: 'jury', label: 'Jüri', icon: Gavel, badge: juryMembers.value.length || null },
  { key: 'submissions', label: 'Gönderimler', icon: Users, badge: submissions.value.length || null },
]);

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/contests');
    // Filter: only contests where user is organizer or admin
    contests.value = data.filter((c: any) => {
      if (authStore.isAdmin) return true;
      return c.createdBy?.id === authStore.user?.id;
    });
    if (contests.value.length) {
      selectedContestId.value = contests.value[0].id;
    }
  } finally {
    loading.value = false;
  }
});

watch(selectedContestId, async (id) => {
  if (!id) return;
  await loadContestData(id);
});

async function loadContestData(id: string) {
  try {
    const [appRes, subRes, memRes] = await Promise.allSettled([
      axios.get(`/api/contests/${id}/applications`),
      axios.get(`/api/contests/${id}/submissions`),
      axios.get(`/api/contests/${id}/members`),
    ]);
    applications.value = appRes.status === 'fulfilled' ? appRes.value.data : [];
    submissions.value = subRes.status === 'fulfilled' ? subRes.value.data : [];
    members.value = memRes.status === 'fulfilled' ? memRes.value.data : [];
  } catch { /* silent */ }
}

async function approveApp(appId: string) {
  try {
    await axios.put(`/api/contests/${selectedContestId.value}/applications/${appId}/approve`);
    showToast('Başvuru onaylandı', 'success');
    await loadContestData(selectedContestId.value);
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
}

async function rejectApp(appId: string) {
  try {
    await axios.put(`/api/contests/${selectedContestId.value}/applications/${appId}/reject`);
    showToast('Başvuru reddedildi', 'success');
    await loadContestData(selectedContestId.value);
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
}

let searchTimeout: any;
function searchUsers() {
  clearTimeout(searchTimeout);
  if (!jurySearch.value || jurySearch.value.length < 2) { searchResults.value = []; return; }
  searchTimeout = setTimeout(async () => {
    try {
      const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(jurySearch.value)}`);
      searchResults.value = data.filter((u: any) => !juryMembers.value.some(m => m.user?.id === u.id));
    } catch { searchResults.value = []; }
  }, 300);
}

async function addJury(user: any) {
  try {
    await axios.post(`/api/contests/${selectedContestId.value}/members`, { userId: user.id, role: 'JURY' });
    showToast(`${user.displayName || user.username} jüri olarak eklendi`, 'success');
    jurySearch.value = '';
    searchResults.value = [];
    await loadContestData(selectedContestId.value);
  } catch (e: any) { showToast(e.response?.data?.message || 'Eklenemedi', 'error'); }
}

async function removeMember(userId: string, role: string) {
  try {
    await axios.delete(`/api/contests/${selectedContestId.value}/members/${userId}/${role}`);
    showToast('Üye çıkarıldı', 'success');
    await loadContestData(selectedContestId.value);
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
}

async function changeStatus(newStatus: string) {
  try {
    await axios.put(`/api/contests/${selectedContestId.value}`, { status: newStatus });
    showToast(`Durum: ${newStatus}`, 'success');
    const idx = contests.value.findIndex(c => c.id === selectedContestId.value);
    if (idx >= 0) contests.value[idx].status = newStatus;
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
}

async function finalizeContest() {
  finalizing.value = true;
  try {
    await axios.post(`/api/contests/${selectedContestId.value}/finalize`);
    showToast('Sonuçlar hesaplandı ve yayınlandı!', 'success');
    await loadContestData(selectedContestId.value);
    const idx = contests.value.findIndex(c => c.id === selectedContestId.value);
    if (idx >= 0) contests.value[idx].status = 'FINALIZED';
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
  finally { finalizing.value = false; }
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}
</script>

<style scoped>
.org-dashboard { max-width: 1000px; margin: 0 auto; }
.loading-state { text-align: center; padding: 4rem; color: hsl(var(--muted-foreground)); }
.spinner { width: 32px; height: 32px; border: 3px solid hsl(var(--border)); border-top-color: hsl(var(--brand)); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 4rem; color: hsl(var(--muted-foreground)); }
.empty-state h3 { margin-top: 1rem; color: hsl(var(--foreground)); }

.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { color: hsl(var(--muted-foreground)); }

/* Selector */
.contest-selector { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.selector-label { font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); }
.selector-select { padding: 0.5rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.85rem; flex: 1; max-width: 400px; }

/* Tabs */
.tabs { display: flex; gap: 0.25rem; border-bottom: 2px solid hsl(var(--border)); margin-bottom: 1.5rem; }
.tab { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem; border: none; background: none; color: hsl(var(--muted-foreground)); font-size: 0.85rem; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
.tab:hover { color: hsl(var(--foreground)); }
.tab--active { color: hsl(var(--brand)); border-bottom-color: hsl(var(--brand)); }
.tab-badge { background: hsl(var(--brand)); color: white; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 9999px; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 12px; padding: 1.25rem; text-align: center; }
.stat-number { display: block; font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.stat-label { font-size: 0.8rem; color: hsl(var(--muted-foreground)); }

/* Status */
.status-section { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.section-title { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.75rem; }
.status-actions { margin-left: auto; }

.status-badge { display: inline-block; padding: 0.25rem 0.7rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-badge--pending_approval { background: #fef3c7; color: #92400e; }
.status-badge--approved { background: #d1fae5; color: #065f46; }
.status-badge--active { background: #dbeafe; color: #1e40af; }
.status-badge--judging { background: #e0e7ff; color: #3730a3; }
.status-badge--finalized { background: #d1fae5; color: #065f46; }
.status-badge--draft { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }
.status-badge--rejected { background: #fee2e2; color: #991b1b; }

/* Applications */
.app-list { display: flex; flex-direction: column; gap: 0.75rem; }
.app-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; flex-wrap: wrap; }
.app-user { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 200px; }
.app-message { font-size: 0.8rem; color: hsl(var(--muted-foreground)); flex-basis: 100%; margin-top: 0.25rem; }
.app-status { margin-left: auto; }
.app-actions { display: flex; gap: 0.5rem; }

.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: hsl(var(--brand)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
.user-name { font-weight: 600; font-size: 0.85rem; }
.user-email { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }

.mini-badge { padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
.mini-badge--pending { background: #fef3c7; color: #92400e; }
.mini-badge--approved { background: #d1fae5; color: #065f46; }
.mini-badge--rejected { background: #fee2e2; color: #991b1b; }

/* Jury */
.add-member-box { margin-bottom: 1rem; position: relative; }
.form-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.85rem; }
.form-input:focus { outline: none; border-color: hsl(var(--brand)); }

.search-results { position: absolute; top: 100%; left: 0; right: 0; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 10; max-height: 200px; overflow-y: auto; }
.search-result-item { display: flex; justify-content: space-between; padding: 0.6rem 0.8rem; cursor: pointer; font-size: 0.85rem; }
.search-result-item:hover { background: hsl(var(--muted)); }
.result-name { font-weight: 600; color: hsl(var(--foreground)); }
.result-email { color: hsl(var(--muted-foreground)); font-size: 0.8rem; }

.member-list { display: flex; flex-direction: column; gap: 0.5rem; }
.member-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 8px; }
.member-info { flex: 1; display: flex; flex-direction: column; }
.role-tag { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; background: #e0e7ff; color: #3730a3; }

/* Submissions table */
.table-wrapper { overflow-x: auto; border: 1px solid hsl(var(--border)); border-radius: 10px; background: hsl(var(--background)); }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.6rem 0.8rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: hsl(var(--muted-foreground)); background: hsl(var(--muted)); border-bottom: 1px solid hsl(var(--border)); }
.table td { padding: 0.6rem 0.8rem; font-size: 0.85rem; border-bottom: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); }
.table tr:last-child td { border-bottom: none; }
.link { color: hsl(var(--brand)); text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }

/* Finalize */
.finalize-box { margin-top: 1.5rem; padding: 1.25rem; background: hsl(var(--brand) / 0.03); border: 1px solid hsl(var(--brand) / 0.2); border-radius: 12px; text-align: center; }
.finalize-box p { font-size: 0.85rem; color: hsl(var(--muted-foreground)); margin-bottom: 1rem; }

/* Buttons */
.btn { padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.3rem; }
.btn--sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn--primary { background: hsl(var(--brand)); color: white; }
.btn--primary:hover { opacity: 0.9; }
.btn--secondary { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.btn--approve { background: #059669; color: white; }
.btn--approve:hover { background: #047857; }
.btn--reject { background: #dc2626; color: white; }
.btn--reject:hover { background: #b91c1c; }
.btn--danger { background: transparent; color: #dc2626; border: 1px solid #dc2626; }
.btn--danger:hover { background: #fee2e2; }
.btn--submit { background: #059669; color: white; font-size: 0.9rem; padding: 0.65rem 1.5rem; }
.btn--submit:hover { background: #047857; }
.btn--submit:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-mini { padding: 2rem; text-align: center; color: hsl(var(--muted-foreground)); font-size: 0.85rem; border: 1px dashed hsl(var(--border)); border-radius: 8px; }
.text-muted { color: hsl(var(--muted-foreground)); }
.font-medium { font-weight: 500; }

.section { margin-bottom: 1rem; }

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>