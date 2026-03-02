<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from '@/composables/useToast';
import { Lock, Mail, Bell, Shield, Smartphone, Trash2, LogOut, Eye, EyeOff, Monitor, Clock } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const { showToast } = useToast();
const { t } = useI18n();

const activeTab = ref<'account' | 'security' | 'notifications' | 'danger'>('account');

// ── Password ──────────────────────────────────────────
const pwForm = ref({ current: '', next: '', confirm: '' });
const pwLoading = ref(false);
const showPw = ref({ current: false, next: false, confirm: false });

async function changePassword() {
  if (pwForm.value.next !== pwForm.value.confirm) {
    showToast(t('auth.password_mismatch'), 'error'); return;
  }
  if (pwForm.value.next.length < 8) {
    showToast(t('settings.password_hint'), 'error'); return;
  }
  pwLoading.value = true;
  try {
    await axios.put('/api/auth/change-password', {
      currentPassword: pwForm.value.current,
      newPassword: pwForm.value.next,
    });
    showToast(t('settings.password_success'), 'success');
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
    showToast(t('forms.required'), 'error'); return;
  }
  emailLoading.value = true;
  try {
    await axios.put('/api/auth/change-email', {
      currentPassword: emailForm.value.password,
      newEmail: emailForm.value.newEmail,
    });
    showToast(t('settings.email_success'), 'success');
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
    await authStore.logout();
    showToast('Logged out successfully', 'success', 3000);
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
  const confirmCode = t('settings.delete_account_confirm_code');
  if (deleteForm.value.confirm !== confirmCode) {
    showToast(t('settings.delete_account_confirm_error') || 'Invalid confirmation text', 'error'); return;
  }
  deleteLoading.value = true;
  try {
    await axios.delete('/api/auth/account', { data: { password: deleteForm.value.password } });
    authStore.logout();
    showToast(t('settings.delete_account_success') || 'Account deleted', 'success');
    router.push('/');
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Error', 'error');
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
      <h1 class="page-title">{{ t('settings.title') }}</h1>
      <p class="page-subtitle">{{ t('navigation.settings') }}</p>
    </div>

    <div class="settings-layout">
      <!-- Sidebar Nav -->
      <nav class="settings-nav">
        <button
          v-for="tab in [
            { key: 'account', icon: Mail, label: t('settings.account') },
            { key: 'security', icon: Shield, label: t('settings.security') },
            { key: 'notifications', icon: Bell, label: t('settings.notifications') },
            { key: 'danger', icon: Trash2, label: t('settings.danger') },
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
                <h2 class="card-title">{{ t('settings.email_change') }}</h2>
                <p class="card-desc">{{ t('settings.current_email') }}: <strong>{{ authStore.user?.email }}</strong></p>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ t('settings.new_email') }}</label>
                <input v-model="emailForm.newEmail" type="email" class="form-input" placeholder="new@email.com" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('settings.current_password') }}</label>
                <input v-model="emailForm.password" type="password" class="form-input" placeholder="••••••••" />
              </div>
            </div>
            <div class="card-footer">
              <p class="hint-text">{{ t('settings.email_desc') }}</p>
              <button @click="changeEmail" :disabled="emailLoading" class="btn btn--primary">
                {{ emailLoading ? t('forms.loading') : t('settings.email_change_btn') }}
              </button>
            </div>
          </div>

          <!-- Change Password -->
          <div class="settings-card">
            <div class="card-header">
              <Lock class="card-icon" />
              <div>
                <h2 class="card-title">{{ t('settings.password_change') }}</h2>
                <p class="card-desc">{{ t('settings.password_desc') }}</p>
              </div>
            </div>
            <div class="form-stack">
              <div class="form-group">
                <label class="form-label">{{ t('settings.current_password') }}</label>
                <div class="input-wrapper">
                  <input v-model="pwForm.current" :type="showPw.current ? 'text' : 'password'" class="form-input" placeholder="••••••••" />
                  <button type="button" class="eye-btn" @click="showPw.current = !showPw.current">
                    <EyeOff v-if="showPw.current" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('settings.new_password') }}</label>
                <div class="input-wrapper">
                  <input v-model="pwForm.next" :type="showPw.next ? 'text' : 'password'" class="form-input" :placeholder="t('settings.password_hint')" />
                  <button type="button" class="eye-btn" @click="showPw.next = !showPw.next">
                    <EyeOff v-if="showPw.next" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('settings.confirm_password') }}</label>
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
              <p class="hint-text">{{ t('settings.password_warning') }}</p>
              <button @click="changePassword" :disabled="pwLoading" class="btn btn--primary">
                {{ pwLoading ? t('forms.loading') : t('settings.change_password') }}
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
                <h2 class="card-title">{{ t('settings.active_sessions') }}</h2>
                <p class="card-desc">{{ sessions.length }} {{ t('settings.sessions_count_label') }}</p>
              </div>
              <button @click="revokeAll" class="btn btn--danger btn--sm ml-auto">
                <LogOut class="w-4 h-4" />
                {{ t('settings.end_all_sessions') }}
              </button>
            </div>

            <div v-if="sessionsLoading" class="loading-mini">{{ t('forms.loading') }}</div>

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
                  {{ revokingId === session.id ? '...' : t('settings.end_session') }}
                </button>
              </div>

              <div v-if="sessions.length === 0" class="empty-mini">{{ t('settings.no_active_sessions') }}</div>
            </div>
          </div>
        </div>

        <!-- ── NOTIFICATIONS ── -->
        <div v-if="activeTab === 'notifications'" class="tab-content">
          <div class="settings-card">
            <div class="card-header">
              <Bell class="card-icon" />
              <div>
                <h2 class="card-title">{{ t('settings.notification_preferences') }}</h2>
                <p class="card-desc">{{ t('settings.which_notifications') }}</p>
              </div>
            </div>

            <div class="notif-list">
              <div v-for="(item, key) in [
                { key: 'juryInvitation', label: t('settings.jury_invitations'), desc: t('settings.jury_invitations_desc') },
                { key: 'contestApproval', label: t('settings.contest_updates'), desc: t('settings.contest_updates_desc') },
                { key: 'submissionResult', label: t('settings.submission_feedback'), desc: t('settings.submission_feedback_desc') },
                { key: 'newMessage', label: t('settings.new_messages'), desc: t('settings.new_messages_desc') },
                { key: 'systemAnnouncements', label: t('settings.platform_news'), desc: t('settings.platform_news_desc') },
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
              <button @click="saveNotifPrefs" class="btn btn--primary">{{ t('common.save') }}</button>
            </div>
          </div>
        </div>

        <!-- ── DANGER ── -->
        <div v-if="activeTab === 'danger'" class="tab-content">
          <div class="settings-card settings-card--danger">
            <div class="card-header">
              <Trash2 class="card-icon card-icon--danger" />
              <div>
                <h2 class="card-title danger-title">{{ t('settings.delete_account') }}</h2>
                <p class="card-desc">{{ t('settings.delete_account_warning') }}</p>
              </div>
            </div>

            <div v-if="!showDeleteConfirm" class="card-footer">
              <span />
              <button @click="showDeleteConfirm = true" class="btn btn--danger">{{ t('settings.delete_account_button') }}</button>
            </div>

            <div v-else class="form-stack">
              <div class="danger-warning">
                ⚠️ {{ t('settings.delete_account_confirm_text') }}
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('settings.current_password') }}</label>
                <input v-model="deleteForm.password" type="password" class="form-input" placeholder="••••••••" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('settings.delete_account_confirm_label') }} <code>{{ t('settings.delete_account_confirm_code') }}</code> {{ t('settings.delete_account_confirm_write') }}</label>
                <input v-model="deleteForm.confirm" type="text" class="form-input form-input--danger" :placeholder="t('settings.delete_account_confirm_code')" />
              </div>
              <div class="card-footer">
                <button @click="showDeleteConfirm = false" class="btn btn--ghost">{{ t('common.cancel') }}</button>
                <button @click="deleteAccount" :disabled="deleteLoading || deleteForm.confirm !== t('settings.delete_account_confirm_code')" class="btn btn--danger">
                  {{ deleteLoading ? t('forms.loading') : t('settings.delete_account_permanently') }}
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