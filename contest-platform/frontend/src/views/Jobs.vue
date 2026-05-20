<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-[hsl(var(--foreground))]">{{ $t('jobs.title') }}</h1>
        <p class="text-[hsl(var(--muted-foreground))] mt-1">{{ $t('jobs.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="authStore.isAuthenticated"
          :class="['px-4 py-2 rounded-lg text-sm font-semibold transition-colors', activeTab === 'my' ? 'bg-[hsl(var(--brand))] text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]']"
          @click="switchTab('my')"
        >{{ $t('jobs.my_applications') || 'Başvurularım' }}</button>
        <router-link
          to="/jobs/create"
          class="px-5 py-2.5 rounded-lg bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/80 text-white font-semibold text-sm transition-colors"
        >+ {{ $t('jobs.create') }}</router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>

    <!-- Job Listings -->
    <div v-else-if="activeTab === 'all' && !jobs.length" class="text-center py-20">
      <p class="text-lg text-[hsl(var(--muted-foreground))]">{{ $t('jobs.empty') }}</p>
    </div>

    <div v-else-if="activeTab === 'all'" class="space-y-4">
      <div v-for="job in jobs" :key="job.id"
        class="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-[hsl(var(--brand))]/50 transition-colors">
        <div class="flex items-start justify-between flex-wrap gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-semibold text-[hsl(var(--foreground))]">{{ job.title }}</h3>
              <span v-if="job.featured" class="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Featured</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[hsl(var(--muted-foreground))]">
              <span v-if="job.company">{{ job.company }}</span>
              <span v-if="job.location">{{ job.location }}</span>
              <span v-if="job.remote" class="text-green-400 font-medium">Remote</span>
              <span v-if="job.salary" class="text-[hsl(var(--brand))] font-semibold">{{ job.salary }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-3">
              <span v-for="tag in job.tags" :key="tag"
                class="px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] border border-[hsl(var(--brand))]/20">{{ tag }}</span>
            </div>
            <p class="mt-3 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{{ job.description }}</p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <div class="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <img v-if="job.user?.avatar" :src="job.user.avatar" class="w-6 h-6 rounded-full" />
              <span class="text-[hsl(var(--foreground))]">{{ job.user?.displayName || job.user?.username }}</span>
            </div>
            <div class="text-xs text-[hsl(var(--muted-foreground))]">{{ formatDate(job.createdAt) }}</div>
            <!-- Action buttons -->
            <div class="flex gap-2 mt-1">
              <button v-if="authStore.isAuthenticated && authStore.user?.id !== job.userId"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[hsl(var(--brand))] text-white hover:opacity-90 transition-opacity"
                @click="openApplyModal(job)">{{ $t('jobs.apply') || 'Başvur' }}</button>
              <button v-if="authStore.user?.id === job.userId"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                @click="openApplicationsView(job)">{{ $t('jobs.view_applications') || 'Başvurular' }}</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="text-center pt-4">
        <button class="px-6 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm transition-colors"
          @click="loadMore">{{ $t('common.load_more') }}</button>
      </div>
    </div>

    <!-- My Applications -->
    <div v-else-if="activeTab === 'my'" class="space-y-4">
      <div v-if="!myApplications.length" class="text-center py-20">
        <p class="text-lg text-[hsl(var(--muted-foreground))]">{{ $t('jobs.no_applications') || 'Henüz başvuru yok' }}</p>
      </div>
      <div v-for="app in myApplications" :key="app.id"
        class="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-[hsl(var(--foreground))]">{{ app.jobListing?.title }}</h3>
            <p class="text-sm text-[hsl(var(--muted-foreground))]">{{ app.jobListing?.company }}</p>
            <p v-if="app.message" class="text-sm text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{{ app.message }}</p>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-semibold', statusBadge(app.status)]">{{ app.status }}</span>
        </div>
        <div class="text-xs text-[hsl(var(--muted-foreground))] mt-2">{{ formatDate(app.createdAt) }}</div>
      </div>
    </div>

    <!-- Apply Modal -->
    <div v-if="showApplyModal" class="fixed inset-0 z-[200] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="closeApplyModal"></div>
      <div class="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto p-6">
        <h2 class="text-xl font-bold text-[hsl(var(--foreground))] mb-1">{{ $t('jobs.apply_modal_title') || 'İşe Başvur' }}</h2>
        <p class="text-sm text-[hsl(var(--muted-foreground))] mb-4">{{ selectedJob?.title }} {{ selectedJob?.company ? '· ' + selectedJob.company : '' }}</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">{{ $t('jobs.apply_message') || 'Başvuru Mesajı' }}</label>
            <textarea v-model="applyForm.message" rows="4" maxlength="2000"
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm resize-y focus:outline-none focus:border-[hsl(var(--brand))]"
              :placeholder="$t('jobs.apply_message_placeholder') || 'Kendinizi tanıtın...'"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">{{ $t('jobs.portfolio_link') || 'Portföy Linki' }}</label>
            <input v-model="applyForm.portfolioLink" type="url"
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--brand))]"
              :placeholder="$t('jobs.portfolio_link_placeholder') || 'https://...'" />
          </div>

          <!-- Dynamic questions -->
          <div v-for="q in questions" :key="q.id">
            <label class="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">{{ q.text }} <span v-if="q.type === 'NUMBER'" class="text-xs text-[hsl(var(--muted-foreground))]">(sayı)</span></label>
            <input v-if="q.type === 'NUMBER'" v-model="applyForm.answers[q.id]" type="number"
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--brand))]" />
            <select v-else-if="q.type === 'CHOICE'" v-model="applyForm.answers[q.id]"
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--brand))]">
              <option value="">{{ $t('common.select') || 'Seçiniz' }}</option>
              <option v-for="opt in q.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <textarea v-else v-model="applyForm.answers[q.id]" rows="2"
              class="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm resize-y focus:outline-none focus:border-[hsl(var(--brand))]"></textarea>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-6">
          <button :disabled="submitApplying"
            class="px-5 py-2.5 rounded-lg bg-[hsl(var(--brand))] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            @click="submitApply">{{ submitApplying ? ($t('common.sending') || 'Gönderiliyor...') : ($t('common.send') || 'Gönder') }}</button>
          <button class="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm hover:bg-[hsl(var(--muted))] transition-colors"
            @click="closeApplyModal">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- Applications View Modal (for job owner) -->
    <div v-if="showAppsView" class="fixed inset-0 z-[200] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showAppsView = false"></div>
      <div class="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[hsl(var(--foreground))]">{{ $t('jobs.applications') || 'Başvurular' }} — {{ viewingJob?.title }}</h2>
          <button class="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-2xl leading-none" @click="showAppsView = false">&times;</button>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-[hsl(var(--muted))]">
          <select v-model="appFilter.status" class="px-2 py-1.5 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs">
            <option value="">{{ $t('common.all') || 'Tümü' }}</option>
            <option value="PENDING">{{ $t('jobs.status_PENDING') || 'Beklemede' }}</option>
            <option value="REVIEWED">{{ $t('jobs.status_REVIEWED') || 'İncelendi' }}</option>
            <option value="ACCEPTED">{{ $t('jobs.status_ACCEPTED') || 'Kabul' }}</option>
            <option value="REJECTED">{{ $t('jobs.status_REJECTED') || 'Red' }}</option>
          </select>
          <template v-if="appQuestions.length">
            <select v-model="appFilter.questionId" class="px-2 py-1.5 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs">
              <option value="">{{ $t('jobs.questions') || 'Soru filtresi yok' }}</option>
              <option v-for="q in appQuestions" :key="q.id" :value="q.id">{{ q.text }}</option>
            </select>
            <select v-if="appFilter.questionId" v-model="appFilter.operator" class="px-2 py-1.5 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs">
              <option value="gte">&ge;</option>
              <option value="lte">&le;</option>
              <option value="eq">=</option>
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
            </select>
            <input v-if="appFilter.questionId" v-model="appFilter.value" type="text"
              class="w-20 px-2 py-1.5 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs" placeholder="Değer" />
          </template>
          <button class="px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--brand))] text-white font-semibold"
            @click="loadApplications">{{ $t('common.filter') || 'Filtrele' }}</button>
        </div>

        <div v-if="loadingApps" class="text-center py-8 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>
        <div v-else-if="!applications.length" class="text-center py-8 text-[hsl(var(--muted-foreground))]">{{ $t('jobs.no_applications') || 'Henüz başvuru yok' }}</div>
        <div v-else class="space-y-3">
          <div v-for="app in applications" :key="app.id" class="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2">
                <img v-if="app.user?.avatar" :src="app.user.avatar" class="w-8 h-8 rounded-full" />
                <div v-else class="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-bold text-[hsl(var(--foreground))]">{{ (app.user?.displayName || app.user?.username || '?')[0].toUpperCase() }}</div>
                <div>
                  <p class="font-semibold text-[hsl(var(--foreground))] text-sm">{{ app.user?.displayName || app.user?.username }}</p>
                  <p class="text-xs text-[hsl(var(--muted-foreground))]">{{ formatDate(app.createdAt) }}</p>
                </div>
              </div>
              <select :value="app.status" @change="updateAppStatus(app.id, ($event.target as HTMLSelectElement).value)"
                class="px-2 py-1 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs">
                <option value="PENDING">{{ $t('jobs.status_PENDING') || 'Beklemede' }}</option>
                <option value="REVIEWED">{{ $t('jobs.status_REVIEWED') || 'İncelendi' }}</option>
                <option value="ACCEPTED">{{ $t('jobs.status_ACCEPTED') || 'Kabul' }}</option>
                <option value="REJECTED">{{ $t('jobs.status_REJECTED') || 'Red' }}</option>
              </select>
            </div>
            <p v-if="app.message" class="mt-2 text-sm text-[hsl(var(--foreground))]">{{ app.message }}</p>
            <a v-if="app.portfolioLink" :href="app.portfolioLink" target="_blank" class="text-xs text-[hsl(var(--brand))] hover:underline mt-1 inline-block">{{ app.portfolioLink }}</a>
            <div v-if="app.answers?.length" class="mt-2 space-y-1">
              <div v-for="a in app.answers" :key="a.id" class="text-xs text-[hsl(var(--muted-foreground))]">
                <span class="font-medium text-[hsl(var(--foreground))]">{{ a.question?.text }}:</span> {{ a.value }}
              </div>
            </div>
          </div>
        </div>

        <!-- Add Question -->
        <div class="mt-6 p-4 rounded-xl border border-dashed border-[hsl(var(--border))]">
          <h3 class="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">{{ $t('jobs.add_question') || 'Soru Ekle' }}</h3>
          <div class="flex flex-wrap gap-2">
            <input v-model="newQuestion.text" placeholder="Soru metni" class="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:border-[hsl(var(--brand))]" />
            <select v-model="newQuestion.type" class="px-2 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm">
              <option value="TEXT">Metin</option>
              <option value="NUMBER">Sayı</option>
              <option value="CHOICE">Seçim</option>
            </select>
            <button class="px-4 py-2 rounded-lg bg-[hsl(var(--brand))] text-white text-sm font-semibold hover:opacity-90"
              @click="addQuestionToJob">+ {{ $t('common.add') || 'Ekle' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/composables/useToast';
import axios from 'axios';

const { t: $t } = useI18n();

const authStore = useAuthStore();
const jobs = ref<any[]>([]);
const loading = ref(true);
const skip = ref(0);
const hasMore = ref(false);
const take = 20;
const activeTab = ref<'all' | 'my'>('all');

// Apply modal
const showApplyModal = ref(false);
const selectedJob = ref<any>(null);
const questions = ref<any[]>([]);
const submitApplying = ref(false);
const applyForm = reactive<{ message: string; portfolioLink: string; answers: Record<string, string> }>({
  message: '', portfolioLink: '', answers: {},
});

// My applications
const myApplications = ref<any[]>([]);

// Applications view (owner)
const showAppsView = ref(false);
const viewingJob = ref<any>(null);
const applications = ref<any[]>([]);
const appQuestions = ref<any[]>([]);
const loadingApps = ref(false);
const appFilter = reactive({ status: '', questionId: '', operator: 'gte', value: '' });
const newQuestion = reactive({ text: '', type: 'TEXT' });

onMounted(async () => {
  await loadJobs();
});

async function loadJobs() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/jobs', { params: { take, skip: skip.value } });
    if (skip.value === 0) jobs.value = data;
    else jobs.value.push(...data);
    hasMore.value = data.length === take;
    skip.value += data.length;
  } catch { /* ignore */ }
  finally { loading.value = false; }
}

async function loadMore() { await loadJobs(); }

function formatDate(date: string) { return new Date(date).toLocaleDateString('tr-TR'); }

function statusBadge(status: string) {
  const map: Record<string, string> = { PENDING: 'bg-yellow-500/20 text-yellow-400', REVIEWED: 'bg-blue-500/20 text-blue-400', ACCEPTED: 'bg-green-500/20 text-green-400', REJECTED: 'bg-red-500/20 text-red-400' };
  return map[status] || 'bg-gray-500/20 text-gray-400';
}

async function switchTab(tab: 'all' | 'my') {
  activeTab.value = tab;
  if (tab === 'my') {
    loading.value = true;
    try { const { data } = await axios.get('/api/jobs/my-applications'); myApplications.value = data; } catch { /* */ }
    finally { loading.value = false; }
  }
}

// Apply flow
async function openApplyModal(job: any) {
  selectedJob.value = job;
  applyForm.message = ''; applyForm.portfolioLink = ''; applyForm.answers = {};
  try { const { data } = await axios.get(`/api/jobs/${job.id}/questions`); questions.value = data; } catch { questions.value = []; }
  showApplyModal.value = true;
}

function closeApplyModal() { showApplyModal.value = false; selectedJob.value = null; questions.value = []; }

async function submitApply() {
  if (!selectedJob.value) return;
  submitApplying.value = true;
  try {
    const answers = Object.entries(applyForm.answers).filter(([_, v]) => v !== '').map(([qId, v]) => ({ questionId: qId, value: v }));
    await axios.post(`/api/jobs/${selectedJob.value.id}/apply`, { message: applyForm.message, portfolioLink: applyForm.portfolioLink, answers });
    showToast($t('jobs.application_sent') || 'Başvurunuz gönderildi', 'success');
    closeApplyModal();
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
  finally { submitApplying.value = false; }
}

// Owner applications view
async function openApplicationsView(job: any) {
  viewingJob.value = job;
  appFilter.status = ''; appFilter.questionId = ''; appFilter.operator = 'gte'; appFilter.value = '';
  try { const { data } = await axios.get(`/api/jobs/${job.id}/questions`); appQuestions.value = data; } catch { appQuestions.value = []; }
  await loadApplications();
  showAppsView.value = true;
}

async function loadApplications() {
  if (!viewingJob.value) return;
  loadingApps.value = true;
  try {
    const params: any = {};
    if (appFilter.status) params.status = appFilter.status;
    if (appFilter.questionId) { params.questionId = appFilter.questionId; params.operator = appFilter.operator; params.value = appFilter.value; }
    const { data } = await axios.get(`/api/jobs/${viewingJob.value.id}/applications`, { params });
    applications.value = data;
  } catch { /* */ }
  finally { loadingApps.value = false; }
}

async function updateAppStatus(appId: string, status: string) {
  try {
    await axios.patch(`/api/jobs/${viewingJob.value.id}/applications/${appId}/status`, { status });
    const app = applications.value.find(a => a.id === appId);
    if (app) app.status = status;
    showToast('Durum güncellendi', 'success');
  } catch { showToast('Hata', 'error'); }
}

async function addQuestionToJob() {
  if (!viewingJob.value || !newQuestion.text.trim()) return;
  try {
    await axios.post(`/api/jobs/${viewingJob.value.id}/questions`, { text: newQuestion.text, type: newQuestion.type });
    newQuestion.text = ''; newQuestion.type = 'TEXT';
    const { data } = await axios.get(`/api/jobs/${viewingJob.value.id}/questions`);
    appQuestions.value = data;
    showToast('Soru eklendi', 'success');
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
}
</script>
