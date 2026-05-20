<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">{{ $t('company.title') }}</h1>
    <p class="text-[hsl(var(--muted-foreground))] mb-8">{{ $t('company.subtitle') }}</p>

    <div v-if="loading" class="text-center py-12 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>

    <div v-else class="space-y-8">
      <!-- İş İlanlarım -->
      <section>
        <h2 class="text-xl font-bold text-[hsl(var(--foreground))] mb-4">{{ $t('company.my_jobs') }}</h2>
        <div v-if="!myJobs.length" class="p-6 rounded-xl border border-[hsl(var(--border))] text-center text-[hsl(var(--muted-foreground))]">
          {{ $t('company.no_jobs') }}
        </div>
        <div v-else class="space-y-3">
          <div v-for="job in myJobs" :key="job.id" class="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 class="font-semibold text-[hsl(var(--foreground))]">{{ job.title }}</h3>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">{{ job.company }}</p>
                <div class="flex gap-1.5 mt-1">
                  <span v-for="tag in job.tags" :key="tag" class="px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))]">{{ tag }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm text-[hsl(var(--muted-foreground))]">{{ job._count?.applications || 0 }} {{ $t('company.applications_count') }}</span>
                <button class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[hsl(var(--brand))] text-white hover:opacity-90"
                  @click="viewJobApplications(job)">{{ $t('company.view_applications') }}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Projelerim -->
      <section>
        <h2 class="text-xl font-bold text-[hsl(var(--foreground))] mb-4">{{ $t('company.my_projects') }}</h2>
        <div v-if="!myProjects.length" class="p-6 rounded-xl border border-[hsl(var(--border))] text-center text-[hsl(var(--muted-foreground))]">
          {{ $t('company.no_projects') }}
        </div>
        <div v-else class="space-y-3">
          <div v-for="project in myProjects" :key="project.id" class="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 class="font-semibold text-[hsl(var(--foreground))]">{{ project.title }}</h3>
                <div class="flex gap-1.5 mt-1">
                  <span v-for="tag in project.tags" :key="tag" class="px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))]">{{ tag }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm text-[hsl(var(--muted-foreground))]">{{ project._count?.applications || 0 }} {{ $t('company.messages_count') }}</span>
                <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  @click="viewProjectMessages(project)">{{ $t('company.view_messages') }}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sponsorluklarım -->
      <section v-if="mySponsorships.length">
        <h2 class="text-xl font-bold text-[hsl(var(--foreground))] mb-4">{{ $t('company.my_sponsorships') }}</h2>
        <div class="space-y-3">
          <div v-for="s in mySponsorships" :key="s.id" class="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-[hsl(var(--foreground))]">{{ s.package?.name }}</h3>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">{{ s.contest?.title }} · ₺{{ s.amount }}</p>
              </div>
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', s.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400']">{{ s.status }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Job Applications Modal -->
    <div v-if="showJobApps" class="fixed inset-0 z-[200] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showJobApps = false"></div>
      <div class="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[hsl(var(--foreground))]">{{ $t('company.applications_for') }} {{ selectedJob?.title }}</h2>
          <button class="text-2xl leading-none text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" @click="showJobApps = false">&times;</button>
        </div>
        <div v-if="loadingApps" class="text-center py-8 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>
        <div v-else-if="!jobApplications.length" class="text-center py-8 text-[hsl(var(--muted-foreground))]">{{ $t('company.no_applications_yet') }}</div>
        <div v-else class="space-y-3">
          <div v-for="app in jobApplications" :key="app.id" class="p-4 rounded-xl border border-[hsl(var(--border))]">
            <div class="flex items-center gap-2 mb-2">
              <img v-if="app.user?.avatar" :src="app.user.avatar" class="w-8 h-8 rounded-full" />
              <div v-else class="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-bold">{{ (app.user?.displayName || app.user?.username || '?')[0].toUpperCase() }}</div>
              <div>
                <p class="font-semibold text-sm text-[hsl(var(--foreground))]">{{ app.user?.displayName || app.user?.username }}</p>
                <p class="text-xs text-[hsl(var(--muted-foreground))]">{{ new Date(app.createdAt).toLocaleDateString('tr-TR') }}</p>
              </div>
              <span :class="['ml-auto px-2 py-0.5 rounded-full text-xs font-semibold', statusBadge(app.status)]">{{ app.status }}</span>
            </div>
            <p v-if="app.message" class="text-sm text-[hsl(var(--foreground))] mt-1">{{ app.message }}</p>
            <a v-if="app.portfolioLink" :href="app.portfolioLink" target="_blank" class="text-xs text-[hsl(var(--brand))] hover:underline mt-1 inline-block">{{ app.portfolioLink }}</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Messages Modal -->
    <div v-if="showProjectMsgs" class="fixed inset-0 z-[200] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showProjectMsgs = false"></div>
      <div class="relative bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[hsl(var(--foreground))]">{{ $t('company.messages_for') }} {{ selectedProject?.title }}</h2>
          <button class="text-2xl leading-none text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" @click="showProjectMsgs = false">&times;</button>
        </div>
        <div v-if="!projectMessages.length" class="text-center py-8 text-[hsl(var(--muted-foreground))]">{{ $t('company.no_messages_yet') }}</div>
        <div v-else class="space-y-3">
          <div v-for="msg in projectMessages" :key="msg.id" class="p-4 rounded-xl border border-[hsl(var(--border))]">
            <div class="flex items-center gap-2 mb-2">
              <img v-if="msg.user?.avatar" :src="msg.user.avatar" class="w-8 h-8 rounded-full" />
              <div v-else class="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-bold">?</div>
              <div>
                <p class="font-semibold text-sm text-[hsl(var(--foreground))]">{{ msg.user?.displayName || msg.user?.username }}</p>
                <p class="text-xs text-[hsl(var(--muted-foreground))]">{{ new Date(msg.createdAt).toLocaleDateString('tr-TR') }}</p>
              </div>
            </div>
            <p class="text-sm text-[hsl(var(--foreground))]">{{ msg.message }}</p>
            <div class="flex gap-2 mt-2 text-xs">
              <a v-if="msg.portfolioLink" :href="msg.portfolioLink" target="_blank" class="text-[hsl(var(--brand))] hover:underline">{{ $t('company.portfolio') }} →</a>
              <a v-if="msg.contactEmail" :href="'mailto:' + msg.contactEmail" class="text-[hsl(var(--brand))] hover:underline">{{ msg.contactEmail }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const authStore = useAuthStore();
const { t: $t } = useI18n();
const loading = ref(true);
const myJobs = ref<any[]>([]);
const myProjects = ref<any[]>([]);
const mySponsorships = ref<any[]>([]);

const showJobApps = ref(false);
const selectedJob = ref<any>(null);
const jobApplications = ref<any[]>([]);
const loadingApps = ref(false);

const showProjectMsgs = ref(false);
const selectedProject = ref<any>(null);
const projectMessages = ref<any[]>([]);

function statusBadge(s: string) {
  const m: Record<string, string> = { PENDING: 'bg-yellow-500/20 text-yellow-400', REVIEWED: 'bg-blue-500/20 text-blue-400', ACCEPTED: 'bg-green-500/20 text-green-400', REJECTED: 'bg-red-500/20 text-red-400' };
  return m[s] || 'bg-gray-500/20 text-gray-400';
}

onMounted(async () => {
  loading.value = true;
  try {
    const [jobsRes, projectsRes, sponsorsRes] = await Promise.all([
      axios.get('/api/jobs', { params: { take: 50 } }),
      axios.get('/api/projects', { params: { take: 50 } }),
      axios.get('/api/sponsorships/my', { params: { take: 50 } }).catch(() => ({ data: [] })),
    ]);
    const uid = authStore.user?.id;
    myJobs.value = (jobsRes.data || []).filter((j: any) => j.userId === uid);
    myProjects.value = (projectsRes.data || []).filter((p: any) => p.userId === uid);
    mySponsorships.value = sponsorsRes.data || [];
  } catch { /* */ }
  finally { loading.value = false; }
});

async function viewJobApplications(job: any) {
  selectedJob.value = job;
  showJobApps.value = true;
  loadingApps.value = true;
  try {
    const { data } = await axios.get(`/api/jobs/${job.id}/applications`);
    jobApplications.value = data;
  } catch { jobApplications.value = []; }
  finally { loadingApps.value = false; }
}

async function viewProjectMessages(project: any) {
  selectedProject.value = project;
  showProjectMsgs.value = true;
  try {
    const { data } = await axios.get(`/api/projects/${project.id}/messages`);
    projectMessages.value = data;
  } catch { projectMessages.value = []; }
}
</script>
