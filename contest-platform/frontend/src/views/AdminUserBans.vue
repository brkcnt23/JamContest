<template>
  <div class="bans-page min-h-screen bg-[hsl(var(--background))] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">User Management</h1>
        <p class="text-[hsl(var(--muted-foreground))]">Ban and manage users on the platform</p>
      </div>

      <!-- Search Section -->
      <div class="mb-8 space-y-4">
        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by username or email..."
            class="flex-1 px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))]"
            @keyup.enter="searchUsers"
          />
          <button
            @click="searchUsers"
            class="px-6 py-2 bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/80 text-white rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>
        <div class="flex gap-2 items-center">
          <button
            @click="showBannedOnly = false"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              !showBannedOnly
                ? 'bg-[hsl(var(--brand))] text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
            ]"
          >
            All Users
          </button>
          <button
            @click="showBannedOnly = true"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              showBannedOnly
                ? 'bg-[hsl(var(--brand))] text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
            ]"
          >
            Banned Users ({{ bannedCount }})
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[hsl(var(--brand))] border-t-transparent"></div>
      </div>

      <!-- No Results -->
      <div v-else-if="displayedUsers.length === 0" class="text-center py-12">
        <p class="text-[hsl(var(--muted-foreground))]">{{ showBannedOnly ? 'No banned users' : 'No users found' }}</p>
      </div>

      <!-- Users List -->
      <div v-else class="space-y-3">
        <div
          v-for="user in displayedUsers"
          :key="user.id"
          class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-4 hover:border-[hsl(var(--brand))] transition-colors"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-12 h-12 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center text-white font-bold">
                {{ (user.displayName || user.username)?.[0]?.toUpperCase() }}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-[hsl(var(--foreground))]">{{ user.displayName || user.username }}</h3>
                <p class="text-sm text-[hsl(var(--muted-foreground))]">
                  @{{ user.username }} • {{ user.email }}
                </p>
                <p v-if="user.userBans && user.userBans.length > 0" class="text-xs text-red-600 mt-1">
                  🔒 Banned: {{ formatDate(user.userBans[0].createdAt) }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-if="!isBanned(user.id)"
                @click="banUser(user.id)"
                class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-600 rounded-lg font-medium transition-colors"
              >
                Ban User
              </button>
              <button
                v-else
                @click="unbanUser(user.id)"
                class="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-600 rounded-lg font-medium transition-colors"
              >
                Unban User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  userBans?: any[];
}

const searchQuery = ref('');
const allUsers = ref<User[]>([]);
const loading = ref(true);
const showBannedOnly = ref(false);

const displayedUsers = computed(() => {
  const filtered = showBannedOnly.value
    ? allUsers.value.filter((u) => u.userBans && u.userBans.length > 0)
    : allUsers.value;
  
  if (!searchQuery.value) return filtered;
  
  const query = searchQuery.value.toLowerCase();
  return filtered.filter(
    (u) =>
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
  );
});

const bannedCount = computed(() =>
  allUsers.value.filter((u) => u.userBans && u.userBans.length > 0).length
);

onMounted(async () => {
  await loadUsers();
});

async function loadUsers() {
  loading.value = true;
  try {
    const res = await axios.get('/api/users');
    allUsers.value = res.data || [];
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
}

async function searchUsers() {
  // The computed displayedUsers already filters based on searchQuery
  // This can be used for more advanced search if needed
}

function isBanned(userId: string) {
  const user = allUsers.value.find((u) => u.id === userId);
  return user?.userBans && user.userBans.length > 0;
}

async function banUser(userId: string) {
  try {
    await axios.post(`/api/users/${userId}/ban`, {
      reason: 'Banned by admin',
      restrictions: []
    });
    await loadUsers();
  } catch (error) {
    console.error('Failed to ban user:', error);
  }
}

async function unbanUser(userId: string) {
  try {
    const user = allUsers.value.find((u) => u.id === userId);
    if (user?.userBans?.[0]) {
      await axios.delete(`/api/users/${userId}/ban/${user.userBans[0].id}`);
      await loadUsers();
    }
  } catch (error) {
    console.error('Failed to unban user:', error);
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}
</script>

<style scoped>
.bans-page {
  background: hsl(var(--background));
}
</style>
