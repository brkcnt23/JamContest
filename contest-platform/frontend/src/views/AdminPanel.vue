<template>
  <div class="admin-panel min-h-screen bg-[hsl(var(--background))] py-12 px-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-6 text-[hsl(var(--foreground))]">Admin Panel</h1>
      <p class="mb-8 text-[hsl(var(--muted-foreground))]">Kullanıcıları ve rollerini yönet.</p>
      <div v-if="loading" class="py-12 text-center text-[hsl(var(--muted-foreground))]">Loading users...</div>
      <div v-else>
        <table class="w-full border rounded-lg bg-[hsl(var(--background))]">
          <thead>
            <tr class="bg-[hsl(var(--muted))]">
              <th class="py-2 px-4 text-left">Username</th>
              <th class="py-2 px-4 text-left">Email</th>
              <th class="py-2 px-4 text-left">Role</th>
              <th class="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b">
              <td class="py-2 px-4">{{ user.username }}</td>
              <td class="py-2 px-4">{{ user.email }}</td>
              <td class="py-2 px-4">{{ user.role }}</td>
              <td class="py-2 px-4">
                <select v-model="user.role" @change="updateRole(user)" :disabled="!canEditRole(user)">
                  <option value="USER">User</option>
                  <option value="JURY">Jury</option>
                  <option value="ORGANIZER">Organizer</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <span v-if="user.id === currentUserId" class="ml-2 text-xs text-[hsl(var(--muted-foreground))]">(You)</span>
                <span v-if="user.role === 'ADMIN' && user.id !== currentUserId && !isSuperAdmin" class="ml-2 text-xs text-red-500">(Protected)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
const currentUserId = authStore.user?.id;
const isSuperAdmin = authStore.user?.role === 'ADMIN' && authStore.user?.username === 'brkcn'; // örnek: sadece ana admin
const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  const { data } = await axios.get('/api/users');
  users.value = data;
  loading.value = false;
});

function canEditRole(user: any) {
  // Sadece super admin diğer adminlerin rolünü değiştirebilir
  if (user.role === 'ADMIN' && user.id !== currentUserId) {
    return !!isSuperAdmin;
  }
  return true;
}

async function updateRole(user: any) {
  await axios.put(`/api/users/${user.id}/role`, { role: user.role });
}
</script>

<style scoped>
.admin-panel table {
  border-collapse: collapse;
}
.admin-panel th, .admin-panel td {
  border: 1px solid hsl(var(--border));
}
</style>
