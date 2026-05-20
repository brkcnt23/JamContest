<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[hsl(var(--foreground))]">{{ $t('jobs.title') }}</h1>
        <p class="text-[hsl(var(--muted-foreground))] mt-1">{{ $t('jobs.subtitle') }}</p>
      </div>
      <router-link
        to="/jobs/create"
        class="px-5 py-2.5 rounded-lg bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/80 text-white font-semibold text-sm transition-colors"
      >
        + {{ $t('jobs.create') }}
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-12 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>

    <div v-else-if="!jobs.length" class="text-center py-20">
      <p class="text-lg text-[hsl(var(--muted-foreground))]">{{ $t('jobs.empty') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="job in jobs"
        :key="job.id"
        class="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-[hsl(var(--brand))]/50 transition-colors"
      >
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
              <span
                v-for="tag in job.tags"
                :key="tag"
                class="px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] border border-[hsl(var(--brand))]/20"
              >{{ tag }}</span>
            </div>
            <p class="mt-3 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{{ job.description }}</p>
          </div>
          <div class="text-right text-xs text-[hsl(var(--muted-foreground))] shrink-0">
            <div class="flex items-center gap-2">
              <img v-if="job.user?.avatar" :src="job.user.avatar" class="w-6 h-6 rounded-full" />
              <span class="text-[hsl(var(--foreground))]">{{ job.user?.displayName || job.user?.username }}</span>
            </div>
            <div class="mt-1">{{ formatDate(job.createdAt) }}</div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="text-center pt-4">
        <button
          class="px-6 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm transition-colors"
          @click="loadMore"
        >
          {{ $t('common.load_more') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const jobs = ref<any[]>([]);
const loading = ref(true);
const skip = ref(0);
const hasMore = ref(false);
const take = 20;

onMounted(async () => {
  await loadJobs();
});

async function loadJobs() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/jobs', { params: { take, skip: skip.value } });
    if (skip.value === 0) {
      jobs.value = data;
    } else {
      jobs.value.push(...data);
    }
    hasMore.value = data.length === take;
    skip.value += data.length;
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  await loadJobs();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR');
}
</script>
