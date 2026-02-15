<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  Home, Trophy, Share2, Image, MessageSquare,
  Bell, FileText, Heart, Settings, Sun, Moon,
  Gavel, ClipboardList, Award,
  LayoutDashboard, Users, Cog,
  HelpCircle, BookOpen, ChevronLeft, ChevronRight
} from 'lucide-vue-next';
import { useTheme } from '@/stores/theme';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { theme, toggleTheme } = useTheme();

const isCollapsed = ref(false);

const emit = defineEmits<{
  'collapse-change': [value: boolean]
}>();
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('collapse-change', isCollapsed.value); // ← EKLE
};

const majorLinks = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Contests', icon: Trophy, path: '/contests' },
  { name: 'Social', icon: Share2, path: '/social' },
  { name: 'Portfolio', icon: Image, path: authStore.user?.id ? `/user/${authStore.user.id}` : '/portfolio' },
  { name: 'Messages', icon: MessageSquare, path: '/messages' },
];

const minorLinks = [
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Submissions', icon: FileText, path: '/submissions' },
  { name: 'Favorites', icon: Heart, path: '/favorites' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const juryLinks = [
  { name: 'Jury Panel', icon: Gavel, path: '/jury' },
  { name: 'Assigned', icon: ClipboardList, path: '/jury/assigned' },
  { name: 'Reviews', icon: Award, path: '/jury/reviews' },
];

const adminLinks = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Contests', icon: Trophy, path: '/admin/contests' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Settings', icon: Cog, path: '/admin/settings' },
];

const bottomLinks = [
  { name: 'Help', icon: HelpCircle, path: '/help' },
  { name: 'Docs', icon: BookOpen, path: '/docs' },
];

const isActive = (path: string) => {
  return route.path === path;
};

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <aside :class="['sidebar', isCollapsed && 'collapsed']">
    <!-- Logo -->
    <div class="logo-section">
      <router-link to="/" class="logo-link">
        <img :src="theme === 'dark' ? '/images/jamcontest_logo_white_for_dark.png' : '/images/logo-JC.png'"
          alt="JamContest" :class="['logo', isCollapsed && 'logo-small']" />
      </router-link>
    </div>

    <!-- Collapse Toggle -->
    <button @click="toggleSidebar" class="collapse-btn">
      <ChevronLeft v-if="!isCollapsed" class="w-5 h-5" />
      <ChevronRight v-else class="w-5 h-5" />
    </button>

    <!-- Navigation -->
    <nav class="nav-section">
      <!-- MAJOR LINKS -->
      <div class="nav-group">
        <a v-for="link in majorLinks" :key="link.path" @click="navigateTo(link.path)"
          :class="['nav-item', isActive(link.path) && 'active']" :title="isCollapsed ? link.name : ''">
          <component :is="link.icon" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-label">{{ link.name }}</span>
        </a>
      </div>
      <!-- MINOR LINKS -->
      <div v-if="!isCollapsed" class="nav-group">
        <p class="nav-group-title">More</p>
        <a v-for="link in minorLinks" :key="link.path" @click="navigateTo(link.path)"
          :class="['nav-item small', isActive(link.path) && 'active']">
          <component :is="link.icon" class="nav-icon" />
          <span class="nav-label">{{ link.name }}</span>
        </a>

        <!-- Theme Toggle KALDIRILDI - artık yok -->
      </div>

      <!-- JURY SECTION -->
      <div v-if="authStore.isJury && !isCollapsed" class="nav-group">
        <p class="nav-group-title">Jury</p>
        <a v-for="link in juryLinks" :key="link.path" @click="navigateTo(link.path)"
          :class="['nav-item small', isActive(link.path) && 'active']">
          <component :is="link.icon" class="nav-icon" />
          <span class="nav-label">{{ link.name }}</span>
        </a>
      </div>

      <!-- ADMIN SECTION -->
      <div v-if="authStore.isAdmin && !isCollapsed" class="nav-group">
        <p class="nav-group-title">Admin</p>
        <a v-for="link in adminLinks" :key="link.path" @click="navigateTo(link.path)"
          :class="['nav-item small', isActive(link.path) && 'active']">
          <component :is="link.icon" class="nav-icon" />
          <span class="nav-label">{{ link.name }}</span>
        </a>
      </div>
    </nav>

    <!-- Bottom Links -->
    <div class="bottom-section">
      <a v-for="link in bottomLinks" :key="link.path" @click="navigateTo(link.path)"
        :class="['nav-item', isActive(link.path) && 'active']" :title="isCollapsed ? link.name : ''">
        <component :is="link.icon" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">{{ link.name }}</span>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 240px;
  background: hsl(var(--background));
  border-right: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.sidebar.collapsed {
  width: 72px;
}

/* Logo Section */
.logo-section {
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88px;
  /* Sabit yükseklik - değişmez */
}

.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 80px; /* 56px → 80px */
  width: auto;
  max-width: 100%;
  object-fit: contain;
  transition: none;
}

.sidebar.collapsed .logo {
  height: 80px; /* Aynı boyut */
}

/* Collapse Button */
.collapse-btn {
  position: absolute;
  right: -12px;
  top: 80px;
  width: 24px;
  height: 24px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: hsl(var(--foreground));
  z-index: 101;
}

.collapse-btn:hover {
  background: hsl(var(--muted));
  transform: scale(1.1);
}

/* Navigation */
.nav-section {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-section::-webkit-scrollbar {
  width: 6px;
}

.nav-section::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 3px;
}

.nav-group {
  margin-bottom: 1.5rem;
  padding: 0 0.75rem;
}

.nav-group-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.5rem;
  padding-left: 0.75rem;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  color: hsl(var(--foreground));
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background: hsl(var(--muted));
}

.nav-item.active {
  background: hsl(var(--brand));
  color: hsl(var(--brand-foreground));
}

.nav-item.small {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .nav-label {
  display: none;
}

/* Bottom Section */
.bottom-section {
  border-top: 1px solid hsl(var(--border));
  padding: 1rem 0.75rem;
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }

  .logo {
    height: 32px;
  }

  .nav-label {
    display: none;
  }
}
</style>