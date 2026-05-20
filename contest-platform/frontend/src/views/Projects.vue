<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[hsl(var(--foreground))]">{{ $t('projects.title') }}</h1>
        <p class="text-[hsl(var(--muted-foreground))] mt-1">{{ $t('projects.subtitle') }}</p>
      </div>
      <router-link
        to="/projects/create"
        class="px-5 py-2.5 rounded-lg bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/80 text-white font-semibold text-sm transition-colors"
      >
        + {{ $t('projects.create') }}
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-12 text-[hsl(var(--muted-foreground))]">{{ $t('common.loading') }}</div>

    <div v-else-if="!projects.length" class="text-center py-20">
      <p class="text-lg text-[hsl(var(--muted-foreground))]">{{ $t('projects.empty') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="project in projects"
        :key="project.id"
        class="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-[hsl(var(--brand))]/30 transition-colors overflow-hidden"
      >
        <div v-if="project.images.length" class="w-full h-40 overflow-hidden bg-[hsl(var(--muted))]">
          <img :src="project.images[0]" class="w-full h-40 object-cover" />
        </div>
        <div class="p-5">
          <h3 class="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">{{ project.title }}</h3>
          <p class="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">{{ project.description }}</p>
          <div class="flex flex-wrap gap-1.5 mb-3">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] border border-[hsl(var(--brand))]/20"
            >{{ tag }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span v-if="project.price" class="text-lg font-bold text-[hsl(var(--brand))]">₺{{ project.price }}</span>
            <span v-else class="text-sm text-[hsl(var(--muted-foreground))]">{{ $t('projects.free') }}</span>
            <div class="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <img v-if="project.user?.avatar" :src="project.user.avatar" class="w-5 h-5 rounded-full" />
              <span class="text-[hsl(var(--foreground))]">{{ project.user?.displayName || project.user?.username }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasMore" class="text-center pt-6">
      <button
        class="px-6 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm transition-colors"
        @click="loadMore"
      >
        {{ $t('common.load_more') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const projects = ref<any[]>([]);
const loading = ref(true);
const skip = ref(0);
const hasMore = ref(false);
const take = 20;

onMounted(async () => {
  await loadProjects();
});

async function loadProjects() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/projects', { params: { take, skip: skip.value } });
    if (skip.value === 0) {
      projects.value = data;
    } else {
      projects.value.push(...data);
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
  await loadProjects();
}
</script>
