<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-[hsl(var(--foreground))] mb-8">Badge Yönetimi</h1>

    <!-- Create Badge -->
    <div class="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] mb-8">
      <h2 class="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Yeni Badge Oluştur</h2>
      <form @submit.prevent="createBadge" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="form.type" placeholder="Tip (örn: GOLD_ARTIST)" required
          class="px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm" />
        <input v-model="form.name" placeholder="İsim (örn: Altın Sanatçı)" required
          class="px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm" />
        <input v-model="form.description" placeholder="Açıklama" required
          class="px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm" />
        <div class="flex gap-2">
          <input v-model="form.icon" placeholder="İkon (emoji)" maxlength="4"
            class="w-20 px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm" />
          <input v-model="form.color" placeholder="Renk (#HEX)" maxlength="7"
            class="w-28 px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm" />
        </div>
        <button type="submit" class="px-4 py-2 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-semibold hover:opacity-90">
          Oluştur
        </button>
      </form>
    </div>

    <!-- Badge List -->
    <div class="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden">
      <div class="p-4 border-b border-[hsl(var(--border))]">
        <h2 class="text-lg font-semibold text-[hsl(var(--foreground))]">Tüm Badge'ler</h2>
      </div>
      <div class="divide-y divide-[hsl(var(--border))]">
        <div v-for="badge in badges" :key="badge.id"
          class="flex items-center justify-between p-4 hover:bg-[hsl(var(--muted))]/50 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ badge.icon || '🏷️' }}</span>
            <div>
              <p class="font-semibold text-[hsl(var(--foreground))]">{{ badge.name }}</p>
              <p class="text-xs text-[hsl(var(--muted-foreground))]">{{ badge.type }} · {{ badge.description }}</p>
            </div>
          </div>
          <button @click="deleteBadge(badge.id)" class="text-red-400 hover:text-red-300 text-sm">Sil</button>
        </div>
      </div>
    </div>

    <!-- Assign Badge -->
    <div class="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] mt-8">
      <h2 class="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Kullanıcıya Badge Ata</h2>
      <form @submit.prevent="assignBadge" class="flex flex-wrap gap-3">
        <select v-model="assign.badgeId" required
          class="px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm">
          <option value="">Badge seç</option>
          <option v-for="b in badges" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <input v-model="assign.userId" placeholder="Kullanıcı ID" required
          class="flex-1 px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm" />
        <button type="submit" class="px-4 py-2 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-semibold hover:opacity-90">
          Ata
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { showToast } from '@/composables/useToast';

const badges = ref<any[]>([]);

const form = reactive({ type: '', name: '', description: '', icon: '', color: '' });
const assign = reactive({ badgeId: '', userId: '' });

async function load() {
  try {
    const { data } = await axios.get('/api/admin/badges');
    badges.value = data;
  } catch { /* */ }
}

async function createBadge() {
  try {
    await axios.post('/api/admin/badges', form);
    showToast('Badge oluşturuldu', 'success');
    form.type = ''; form.name = ''; form.description = ''; form.icon = ''; form.color = '';
    await load();
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
}

async function deleteBadge(id: string) {
  if (!confirm('Badge silinsin mi?')) return;
  try {
    await axios.delete(`/api/admin/badges/${id}`);
    showToast('Badge silindi', 'success');
    await load();
  } catch { showToast('Hata', 'error'); }
}

async function assignBadge() {
  try {
    await axios.post('/api/admin/badges/assign', assign);
    showToast('Badge atandı', 'success');
    assign.userId = '';
  } catch (e: any) { showToast(e.response?.data?.message || 'Hata', 'error'); }
}

onMounted(() => load());
</script>
