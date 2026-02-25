<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { Lock, Mail, Bell, Shield, Smartphone, Trash2, LogOut, Eye, EyeOff, Monitor, Clock } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const { showToast } = useToast();

const activeTab = ref<'account' | 'security' | 'notifications' | 'danger'>('account');

// ── Password ──────────────────────────────────────────
const pwForm = ref({ current: '', next: '', confirm: '' });
const pwLoading = ref(false);
const showPw = ref({ current: false, next: false, confirm: false });

async function changePassword() {
  if (pwForm.value.next !== pwForm.value.confirm) {
    showToast('Şifreler eşleşmiyor', 'error'); return;
  }
  if (pwForm.value.next.length < 8) {
    showToast('Şifre en az 8 karakter olmalı', 'error'); return;
  }
  pwLoading.value = true;
  try {
    await axios.put('/api/auth/change-password', {
      currentPassword: pwForm.value.current,
      newPassword: pwForm.value.next,
    });
    showToast('Şifre güncellendi', 'success');
    pwForm.value = { current: '', next: '', confirm: '' };
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  } finally {
    pwLoading.value = false;
  }
}

// ── Email ──────────────────────────────────────────────
const emailForm = ref({ password: '', newEmail: '' });
const emailLoading = ref(false);

async function changeEmail() {
  if (!emailForm.value.newEmail || !emailForm.value.password) {
    showToast('Tüm alanları doldurun', 'error'); return;
  }
  emailLoading.value = true;
  try {
    await axios.put('/api/auth/change-email', {
      currentPassword: emailForm.value.password,
      newEmail: emailForm.value.newEmail,
    });
    showToast('Email güncellendi, doğrulama maili gönderildi', 'success');
    emailForm.value = { password: '', newEmail: '' };
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  } finally {
    emailLoading.value = false;
  }
}

// ── Sessions ──────────────────────────────────────────
interface Session { id: string; userAgent?: string; ip?: string; createdAt: string; }
const sessions = ref<Session[]>([]);
const sessionsLoading = ref(false);
const revokingId = ref<string | null>(null);

async function loadSessions() {
  sessionsLoading.value = true;
  try {
    const { data } = await axios.get('/api/auth/sessions');
    sessions.value = data;
  } catch { /* silently fail */ }
  finally { sessionsLoading.value = false; }
}

async function revokeSession(id: string) {
  revokingId.value = id;
  try {
    await axios.delete(`/api/auth/sessions/${id}`);
    sessions.value = sessions.value.filter(s => s.id !== id);
    showToast('Oturum sonlandırıldı', 'success');
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  } finally {
    revokingId.value = null;
  }
}

async function revokeAll() {
  try {
    await axios.post('/api/auth/logout-all');
    authStore.logout();
    router.push('/login');
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  }
}

function parseUA(ua?: string): { browser: string; os: string } {
  if (!ua) return { browser: 'Bilinmeyen', os: 'Bilinmeyen' };
  const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Tarayıcı';
  const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : ua.includes('iOS') ? 'iOS' : 'OS';
  return { browser, os };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Notifications ──────────────────────────────────────
const notifPrefs = ref({
  juryInvitation: true,
  contestApproval: true,
  submissionResult: true,
  newMessage: true,
  systemAnnouncements: true,
});

function loadNotifPrefs() {
  const stored = localStorage.getItem('notif_prefs');
  if (stored) notifPrefs.value = { ...notifPrefs.value, ...JSON.parse(stored) };
}

function saveNotifPrefs() {
  localStorage.setItem('notif_prefs', JSON.stringify(notifPrefs.value));
  showToast('Bildirim tercihleri kaydedildi', 'success');
}

// ── Delete Account ──────────────────────────────────────
const deleteForm = ref({ password: '', confirm: '' });
const deleteLoading = ref(false);
const showDeleteConfirm = ref(false);

async function deleteAccount() {
  if (deleteForm.value.confirm !== 'HESABIMI SİL') {
    showToast('Onay metnini doğru girin', 'error'); return;
  }
  deleteLoading.value = true;
  try {
    await axios.delete('/api/auth/account', { data: { password: deleteForm.value.password } });
    authStore.logout();
    router.push('/');
    showToast('Hesabınız silindi', 'success');
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Hata', 'error');
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(() => {
  loadSessions();
  loadNotifPrefs();
});
</script>

<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Ayarlar</h1>
      <p class="page-subtitle">Hesap ve uygulama tercihlerinizi yönetin</p>
    </div>

    <div class="settings-layout">
      <!-- Sidebar Nav -->
      <nav class="settings-nav">
        <button
          v-for="tab in [
            { key: 'account', icon: Mail, label: 'Hesap' },
            { key: 'security', icon: Shield, label: 'Güvenlik & Oturumlar' },
            { key: 'notifications', icon: Bell, label: 'Bildirimler' },
            { key: 'danger', icon: Trash2, label: 'Tehlike Bölgesi' },
          ]"
          :key="tab.key"
          @click="activeTab = tab.key as any"
          :class="['nav-tab', activeTab === tab.key && 'nav-tab--active', tab.key === 'danger' && 'nav-tab--danger']"
        >
          <component :is="tab.icon" class="tab-icon" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Content -->
      <div class="settings-content">

        <!-- ── ACCOUNT ── -->
        <div v-if="activeTab === 'account'" class="tab-content">
          <!-- Change Email -->
          <div class="settings-card">
            <div class="card-header">
              <Mail class="card-icon" />
              <div>
                <h2 class="card-title">Email Adresi</h2>
                <p class="card-desc">Mevcut: <strong>{{ authStore.user?.email }}</strong></p>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Yeni Email</label>
                <input v-model="emailForm.newEmail" type="email" class="form-input" placeholder="yeni@email.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Mevcut Şifre</label>
                <input v-model="emailForm.password" type="password" class="form-input" placeholder="••••••••" />
              </div>
            </div>
            <div class="card-footer">
              <p class="hint-text">Email değişikliği doğrulama maili gönderir.</p>
              <button @click="changeEmail" :disabled="emailLoading" class="btn btn--primary">
                {{ emailLoading ? 'Güncelleniyor...' : 'Email Güncelle' }}
              </button>
            </div>
          </div>

          <!-- Change Password -->
          <div class="settings-card">
            <div class="card-header">
              <Lock class="card-icon" />
              <div>
                <h2 class="card-title">Şifre Değiştir</h2>
                <p class="card-desc">Güçlü, benzersiz bir şifre kullanın.</p>
              </div>
            </div>
            <div class="form-stack">
              <div class="form-group">
                <label class="form-label">Mevcut Şifre</label>
                <div class="input-wrapper">
                  <input v-model="pwForm.current" :type="showPw.current ? 'text' : 'password'" class="form-input" placeholder="••••••••" />
                  <button type="button" class="eye-btn" @click="showPw.current = !showPw.current">
                    <EyeOff v-if="showPw.current" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Yeni Şifre</label>
                <div class="input-wrapper">
                  <input v-model="pwForm.next" :type="showPw.next ? 'text' : 'password'" class="form-input" placeholder="En az 8 karakter" />
                  <button type="button" class="eye-btn" @click="showPw.next = !showPw.next">
                    <EyeOff v-if="showPw.next" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Yeni Şifre (Tekrar)</label>
                <div class="input-wrapper">
                  <input v-model="pwForm.confirm" :type="showPw.confirm ? 'text' : 'password'" class="form-input" placeholder="••••••••" />
                  <button type="button" class="eye-btn" @click="showPw.confirm = !showPw.confirm">
                    <EyeOff v-if="showPw.confirm" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <p class="hint-text">Şifre değişikliği tüm oturumları sonlandırır.</p>
              <button @click="changePassword" :disabled="pwLoading" class="btn btn--primary">
                {{ pwLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── SECURITY ── -->
        <div v-if="activeTab === 'security'" class="tab-content">
          <div class="settings-card">
            <div class="card-header">
              <Smartphone class="card-icon" />
              <div>
                <h2 class="card-title">Aktif Oturumlar</h2>
                <p class="card-desc">{{ sessions.length }} aktif oturum</p>
              </div>
              <button @click="revokeAll" class="btn btn--danger btn--sm ml-auto">
                <LogOut class="w-4 h-4" />
                Tümünü Sonlandır
              </button>
            </div>

            <div v-if="sessionsLoading" class="loading-mini">Yükleniyor...</div>

            <div v-else class="session-list">
              <div v-for="session in sessions" :key="session.id" class="session-item">
                <div class="session-icon">
                  <Monitor class="w-5 h-5" />
                </div>
                <div class="session-info">
                  <p class="session-device">{{ parseUA(session.userAgent).browser }} · {{ parseUA(session.userAgent).os }}</p>
                  <p class="session-meta">
                    <Clock class="w-3 h-3 inline mr-1" />{{ formatDate(session.createdAt) }}
                    <span v-if="session.ip"> · {{ session.ip }}</span>
                  </p>
                </div>
                <button
                  @click="revokeSession(session.id)"
                  :disabled="revokingId === session.id"
                  class="btn btn--ghost btn--sm"
                >
                  {{ revokingId === session.id ? '...' : 'Sonlandır' }}
                </button>
              </div>

              <div v-if="sessions.length === 0" class="empty-mini">Aktif oturum bulunamadı</div>
            </div>
          </div>
        </div>

        <!-- ── NOTIFICATIONS ── -->
        <div v-if="activeTab === 'notifications'" class="tab-content">
          <div class="settings-card">
            <div class="card-header">
              <Bell class="card-icon" />
              <div>
                <h2 class="card-title">Bildirim Tercihleri</h2>
                <p class="card-desc">Hangi bildirimleri almak istediğinizi seçin.</p>
              </div>
            </div>

            <div class="notif-list">
              <div v-for="(item, key) in [
                { key: 'juryInvitation', label: 'Jüri Davetleri', desc: 'Bir yarışmaya jüri olarak davet edildiğinizde' },
                { key: 'contestApproval', label: 'Yarışma Onayları', desc: 'Yarışmanız onaylandığında veya reddedildiğinde' },
                { key: 'submissionResult', label: 'Sonuçlar', desc: 'Katıldığınız yarışma sonuçlandığında' },
                { key: 'newMessage', label: 'Yeni Mesajlar', desc: 'Birisi size mesaj gönderdiğinde' },
                { key: 'systemAnnouncements', label: 'Sistem Duyuruları', desc: 'Platform güncellemeleri ve önemli haberler' },
              ]" :key="item.key" class="notif-item">
                <div class="notif-text">
                  <p class="notif-label">{{ item.label }}</p>
                  <p class="notif-desc">{{ item.desc }}</p>
                </div>
                <button
                  @click="(notifPrefs as any)[item.key] = !(notifPrefs as any)[item.key]"
                  :class="['toggle', (notifPrefs as any)[item.key] && 'toggle--on']"
                >
                  <span class="toggle-thumb" />
                </button>
              </div>
            </div>

            <div class="card-footer">
              <span />
              <button @click="saveNotifPrefs" class="btn btn--primary">Kaydet</button>
            </div>
          </div>
        </div>

        <!-- ── DANGER ── -->
        <div v-if="activeTab === 'danger'" class="tab-content">
          <div class="settings-card settings-card--danger">
            <div class="card-header">
              <Trash2 class="card-icon card-icon--danger" />
              <div>
                <h2 class="card-title danger-title">Hesabı Sil</h2>
                <p class="card-desc">Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinir.</p>
              </div>
            </div>

            <div v-if="!showDeleteConfirm" class="card-footer">
              <span />
              <button @click="showDeleteConfirm = true" class="btn btn--danger">Hesabımı Sil</button>
            </div>

            <div v-else class="form-stack">
              <div class="danger-warning">
                ⚠️ Tüm yarışma geçmişiniz, gönderileriniz ve profiliniz silinecek.
              </div>
              <div class="form-group">
                <label class="form-label">Mevcut Şifreniz</label>
                <input v-model="deleteForm.password" type="password" class="form-input" placeholder="••••••••" />
              </div>
              <div class="form-group">
                <label class="form-label">Onaylamak için <code>HESABIMI SİL</code> yazın</label>
                <input v-model="deleteForm.confirm" type="text" class="form-input form-input--danger" placeholder="HESABIMI SİL" />
              </div>
              <div class="card-footer">
                <button @click="showDeleteConfirm = false" class="btn btn--ghost">İptal</button>
                <button @click="deleteAccount" :disabled="deleteLoading || deleteForm.confirm !== 'HESABIMI SİL'" class="btn btn--danger">
                  {{ deleteLoading ? 'Siliniyor...' : 'Kalıcı Olarak Sil' }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page { max-width: 1000px; margin: 0 auto; }

.page-header { margin-bottom: 2rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { color: hsl(var(--muted-foreground)); margin-top: 0.25rem; font-size: 0.9rem; }

.settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 1.5rem; align-items: start; }

/* Nav */
.settings-nav { display: flex; flex-direction: column; gap: 0.25rem; position: sticky; top: 80px; }
.nav-tab {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.7rem 1rem; border-radius: 10px; border: none;
  background: transparent; color: hsl(var(--muted-foreground));
  font-size: 0.875rem; font-weight: 500; cursor: pointer; text-align: left;
  transition: all 0.15s;
}
.nav-tab:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.nav-tab--active { background: hsl(var(--muted)); color: hsl(var(--foreground)); font-weight: 600; }
.nav-tab--danger { color: hsl(0 72% 51%); }
.nav-tab--danger:hover { background: hsl(0 72% 51% / 0.1); }
.nav-tab--danger.nav-tab--active { background: hsl(0 72% 51% / 0.1); color: hsl(0 72% 51%); }
.tab-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Cards */
.tab-content { display: flex; flex-direction: column; gap: 1rem; }
.settings-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px; overflow: hidden;
}
.settings-card--danger { border-color: hsl(0 72% 51% / 0.3); }

.card-header { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.5rem 0; }
.card-icon { width: 20px; height: 20px; color: hsl(var(--brand)); flex-shrink: 0; margin-top: 2px; }
.card-icon--danger { color: hsl(0 72% 51%); }
.card-title { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); }
.danger-title { color: hsl(0 72% 51%); }
.card-desc { font-size: 0.8rem; color: hsl(var(--muted-foreground)); margin-top: 0.15rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.25rem 1.5rem; }
.form-stack { display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem 1.5rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.8rem; font-weight: 600; color: hsl(var(--foreground)); }
.form-input {
  padding: 0.55rem 0.85rem; border: 1px solid hsl(var(--border));
  border-radius: 8px; background: hsl(var(--muted) / 0.5); color: hsl(var(--foreground));
  font-size: 0.875rem; outline: none; transition: border-color 0.15s;
}
.form-input:focus { border-color: hsl(var(--brand)); }
.form-input--danger:focus { border-color: hsl(0 72% 51%); }

.input-wrapper { position: relative; }
.input-wrapper .form-input { padding-right: 2.5rem; width: 100%; }
.eye-btn {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: hsl(var(--muted-foreground));
  display: flex; align-items: center;
}

.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem; border-top: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.3);
}
.hint-text { font-size: 0.775rem; color: hsl(var(--muted-foreground)); }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.1rem; border-radius: 8px; border: none;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: hsl(var(--brand)); color: white; }
.btn--primary:hover:not(:disabled) { opacity: 0.9; }
.btn--danger { background: hsl(0 72% 51%); color: white; }
.btn--danger:hover:not(:disabled) { background: hsl(0 72% 44%); }
.btn--ghost { background: transparent; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); }
.btn--ghost:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.btn--sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.ml-auto { margin-left: auto; }

/* Sessions */
.loading-mini { padding: 1.5rem; text-align: center; color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
.session-list { display: flex; flex-direction: column; }
.session-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.85rem 1.5rem; border-top: 1px solid hsl(var(--border));
}
.session-item:first-child { border-top: none; }
.session-icon {
  width: 36px; height: 36px; border-radius: 8px; background: hsl(var(--muted));
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  color: hsl(var(--muted-foreground));
}
.session-info { flex: 1; min-width: 0; }
.session-device { font-size: 0.875rem; font-weight: 500; color: hsl(var(--foreground)); }
.session-meta { font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-top: 0.1rem; display: flex; align-items: center; gap: 0.25rem; }
.empty-mini { padding: 2rem 1.5rem; text-align: center; color: hsl(var(--muted-foreground)); font-size: 0.875rem; }

/* Notifications */
.notif-list { display: flex; flex-direction: column; }
.notif-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem; border-top: 1px solid hsl(var(--border));
}
.notif-item:first-child { border-top: none; }
.notif-text { flex: 1; }
.notif-label { font-size: 0.875rem; font-weight: 500; color: hsl(var(--foreground)); }
.notif-desc { font-size: 0.775rem; color: hsl(var(--muted-foreground)); margin-top: 0.1rem; }

.toggle {
  width: 44px; height: 24px; border-radius: 9999px; border: none; cursor: pointer;
  background: hsl(var(--border)); position: relative; transition: background 0.2s;
  flex-shrink: 0;
}
.toggle--on { background: hsl(var(--brand)); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%; background: white;
  transition: transform 0.2s;
}
.toggle--on .toggle-thumb { transform: translateX(20px); }

/* Danger */
.danger-warning {
  padding: 0.85rem 1rem; background: hsl(0 72% 51% / 0.08);
  border: 1px solid hsl(0 72% 51% / 0.2); border-radius: 8px;
  font-size: 0.875rem; color: hsl(0 72% 51%);
}

code {
  font-family: monospace; background: hsl(var(--muted));
  padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.85em;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-nav { flex-direction: row; flex-wrap: wrap; position: static; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>