<template>
  <div class="max-w-3xl mx-auto py-12">
    <div v-if="loading" class="text-center py-12 text-[hsl(var(--muted-foreground))]">Yarışma yükleniyor...</div>
    <div v-else-if="error" class="text-center py-12 text-red-500">{{ error }}</div>
    <div v-else>
      <img v-if="contest.coverUrl" :src="contest.coverUrl" class="w-full max-h-80 object-cover rounded mb-6" />
      <h1 class="text-3xl font-bold mb-2 text-[hsl(var(--foreground))]">{{ contest.title }}</h1>
      <p class="mb-4 text-[hsl(var(--muted-foreground))]">{{ contest.description }}</p>
      <div class="mb-4 flex flex-wrap gap-4">
        <span class="badge">Başvuru Bitiş: {{ contest.applicationEnd }}</span>
        <span class="badge">Katılımcı Sınırı: {{ contest.maxParticipants || 'Sınırsız' }}</span>
        <span class="badge">Ödüller: {{ contest.prizes }}</span>
      </div>
      <div class="mb-8">
        <h3 class="font-semibold mb-2">Jüri</h3>
        <ul class="flex flex-wrap gap-2">
          <li v-for="jury in contest.juryList" :key="jury.id" class="badge">{{ jury.displayName || jury.username }}</li>
        </ul>
      </div>
      <div v-if="!applied">
        <button @click="applyToContest" class="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Başvur</button>
      </div>
      <div v-else class="mt-8">
        <h3 class="font-semibold mb-2">Teslim Linki</h3>
        <input v-model="submissionLink" class="input" placeholder="Drive/Wetransfer linki..." />
        <button @click="submitWork" class="ml-2 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700">Teslim Et</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { showToast } from '@/composables/useToast';

const route = useRoute();
const contest = ref<any>({});
const loading = ref(true);
const error = ref('');
const applied = ref(false);
const submissionLink = ref('');

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/contests/${route.params.slug}`);
    contest.value = data;
    // TODO: Kullanıcı başvurdu mu kontrolü
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Yarışma bulunamadı';
  } finally {
    loading.value = false;
  }
});

async function applyToContest() {
  await axios.post(`/api/contests/${route.params.id}/apply`);
  applied.value = true;
  showToast('Başvuru başarılı!', 'success');
}

async function submitWork() {
  await axios.post(`/api/contests/${route.params.id}/submit`, { link: submissionLink.value });
  showToast('Teslim başarılı!', 'success');
}
</script>

<style scoped>
.input {
  width: 60%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
.badge {
  display: inline-block;
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.95rem;
}
</style>
