<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/stores/theme';
import { Search, Bell, Settings, User, LogOut, Circle, Sun, Moon } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const { theme, toggleTheme } = useTheme();

const searchQuery = ref('');
const showDropdown = ref(false);
const userStatus = ref<'online' | 'offline' | 'away'>('online');

const notificationCount = ref(3);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${searchQuery.value}`);
  }
};


const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const navigateTo = (path: string) => {
  router.push(path);
  closeDropdown();
};

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  closeDropdown();
};

const setStatus = (status: 'online' | 'offline' | 'away') => {
  userStatus.value = status;
};

const statusColor = computed(() => {
  switch (userStatus.value) {
    case 'online': return '#10B981'; // emerald
    case 'away': return '#FBBF24'; // amber
    case 'offline': return '#6B7280'; // gray
  }
});

const statusLabel = computed(() => {
  return userStatus.value.charAt(0).toUpperCase() + userStatus.value.slice(1);
});
</script>

<template>
  <header class="top-header">
    <!-- Search Bar -->
    <div class="search-container">
      <Search class="search-icon" />
      <input v-model="searchQuery" type="text" placeholder="Search contests, artists, works..." class="search-input"
        @keyup.enter="handleSearch" />
    </div>
    <!-- Right Section - Theme + Notifications + Avatar -->
    <div class="header-right">
      <!-- Theme Toggle -->
      <button @click="toggleTheme" class="icon-btn" aria-label="Toggle theme">
        <Sun v-if="theme === 'light'" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>

      <!-- Notifications -->
      <button class="icon-btn" @click="navigateTo('/notifications')">
        <Bell class="w-5 h-5" />
        <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
      </button>

      <!-- Avatar Dropdown -->
      <div class="avatar-container">
        <button @click="toggleDropdown" class="avatar-btn">
          <div class="avatar-wrapper">
            <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              <User class="w-5 h-5" />
            </div>
            <div class="status-indicator" :style="{ background: statusColor }"></div>
          </div>
        </button>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
          <div v-if="showDropdown" class="dropdown-menu" @click.stop>
            <!-- User Info -->
            <div class="dropdown-header">
              <div class="user-info">
                <p class="user-name">{{ authStore.user?.username || 'User' }}</p>
                <p class="user-email">{{ authStore.user?.email || '' }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="dropdown-section">
              <p class="section-title">Status</p>
              <button v-for="status in ['online', 'away', 'offline']" :key="status" @click="setStatus(status as any)"
                :class="['status-item', userStatus === status && 'active']">
                <Circle :class="['status-dot', userStatus === status && 'filled']" :style="{
                  color: status === 'online' ? '#10B981' : status === 'away' ? '#FBBF24' : '#6B7280',
                  fill: userStatus === status ? 'currentColor' : 'none'
                }" />
                <span>{{ status.charAt(0).toUpperCase() + status.slice(1) }}</span>
              </button>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Menu Items -->
            <div class="dropdown-section">
              <button @click="navigateTo('/settings')" class="dropdown-item">
                <Settings class="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button v-if="authStore.user?.id" @click="navigateTo(`/user/${authStore.user.id}`)" class="dropdown-item">
                <User class="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Logout -->
            <div class="dropdown-section">
              <button @click="handleLogout" class="dropdown-item danger">
                <LogOut class="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Click Outside to Close -->
    <div v-if="showDropdown" class="dropdown-overlay" @click="closeDropdown"></div>
  </header>
</template>

<style scoped>
.top-header {
  height: 64px;
  background: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  gap: 2rem;
  position: sticky;
  top: 0;
  z-index: 90;
  backdrop-filter: blur(12px);
}

/* Search */
.search-container {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: hsl(var(--muted-foreground));
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: hsl(var(--brand));
  background: hsl(var(--background));
}

.search-input::placeholder {
  color: hsl(var(--muted-foreground));
}

/* Header Right */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  position: relative;
  padding: 0.5rem;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: hsl(var(--muted));
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: hsl(var(--accent-coral));
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Avatar */
.avatar-container {
  position: relative;
}

.avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.avatar-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid hsl(var(--border));
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: hsl(var(--muted));
  border: 2px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--foreground));
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid hsl(var(--background));
}

/* Dropdown */
.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 89;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 280px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 91;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: hsl(var(--foreground));
}

.user-email {
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground));
}

.dropdown-section {
  padding: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  padding: 0.5rem 0.75rem;
  letter-spacing: 0.05em;
}

.status-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: none;
  border: none;
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.status-item:hover {
  background: hsl(var(--muted));
}

.status-item.active {
  background: hsl(var(--muted));
}

.status-dot {
  width: 12px;
  height: 12px;
}

.dropdown-divider {
  height: 1px;
  background: hsl(var(--border));
  margin: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: none;
  border: none;
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: hsl(var(--muted));
}

.dropdown-item.danger {
  color: hsl(var(--accent-coral));
}

.dropdown-item.danger:hover {
  background: hsl(var(--accent-coral) / 0.1);
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile */
@media (max-width: 768px) {
  .top-header {
    padding: 0 1rem;
    gap: 1rem;
  }

  .search-container {
    max-width: none;
  }
}
</style>