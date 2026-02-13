<template>
  <div class="max-w-2xl mx-auto py-12">
    <h1 class="text-3xl font-bold mb-6 text-[hsl(var(--foreground))]">Yeni Yarışma Oluştur</h1>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block mb-1 font-medium">Yarışma Adı</label>
        <input v-model="form.title" required class="input" placeholder="Yarışma başlığı" />
      </div>
      <div>
        <label class="block mb-1 font-medium">Açıklama</label>
        <textarea v-model="form.description" required class="input" rows="4" placeholder="Yarışma açıklaması"></textarea>
      </div>
      <div>
        <label class="block mb-1 font-medium">Kapak Görseli</label>
        <input type="file" @change="onFileChange" accept="image/*" />
        <img v-if="form.coverUrl" :src="form.coverUrl" class="mt-2 max-h-40 rounded border" />
      </div>
      <div>
        <label class="block mb-1 font-medium">Başvuru Bitiş Tarihi</label>
        <input v-model="form.applicationEnd" type="date" required class="input" />
      </div>
      <div>
        <label class="block mb-1 font-medium">Katılımcı Sınırı</label>
        <input v-model.number="form.maxParticipants" type="number" min="1" class="input" placeholder="Sınırsız için boş bırak" />
      </div>
      <div>
        <label class="block mb-1 font-medium">Ödüller</label>
        <textarea v-model="form.prizes" class="input" rows="2" placeholder="Ödülleri yazın"></textarea>
      </div>
      <div>
        <label class="block mb-1 font-medium">Jüri Seç</label>
        <select v-model="form.juryIds" multiple class="input">
          <option v-for="user in juryList" :key="user.id" :value="user.id">{{ user.displayName || user.username }}</option>
        </select>
      </div>
      <button type="submit" class="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700">Yayınla</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { showToast } from '@/composables/useToast';

const form = ref({
  title: '',
  description: '',
  coverUrl: '',
  applicationEnd: '',
  maxParticipants: null,
  prizes: '',
  juryIds: [] as string[],
});
const juryList = ref<any[]>([]);

onMounted(async () => {
  const { data } = await axios.get('/api/users?role=JURY');
  juryList.value = data;
});

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  // TODO: Görseli backend'e yükle, url'yi form.coverUrl'a ata
}

async function handleSubmit() {
  await axios.post('/api/contests', form.value);
  showToast('Yarışma başarıyla oluşturuldu!', 'success');
  // TODO: yönlendirme veya form reset
}
</script>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
</style>
