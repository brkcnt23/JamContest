<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="logo">
        <img 
          :src="theme === 'dark' ? '/images/jamcontest_logo_white_for_dark.png' : '/images/logo-JC.png'" 
          alt="JamContest" 
          class="logo-img"
        />
      </router-link>
      
      <nav class="nav">
        <router-link to="/">Home</router-link>
        <router-link to="/contests">Contests</router-link>
        
        <!-- Theme Toggle (moved) -->
        <button 
          @click="handleThemeToggle" 
          class="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          <Sun v-if="theme === 'light'" class="icon" />
          <Moon v-else class="icon" />
        </button>

        <!-- Notifications Icon -->
        <router-link to="/notifications" class="icon-btn" aria-label="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </router-link>

        <!-- Avatar/Profile Icon -->
        <template v-if="authStore.isAuthenticated">
          <router-link v-if="authStore.user?.id" :to="{ name: 'UserProfile', params: { id: authStore.user.id } }" class="icon-btn" aria-label="Profile">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.004 9.004 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </router-link>
        </template>

        <template v-else>
          <router-link to="/login" class="btn-primary">Login</router-link>
          <router-link to="/register" class="btn-secondary">Register</router-link>
        </template>

        <template v-if="authStore.isAuthenticated">
          <router-link v-if="authStore.isAdmin" to="/admin">Admin</router-link>
          <router-link v-if="authStore.isJury" to="/jury">Jury</router-link>
          <template v-if="authStore.user?.id">
            <router-link :to="{ name: 'UserProfile', params: { id: authStore.user.id } }">
              {{ authStore.user?.username }}
            </router-link>
          </template>
          <template v-else>
            <router-link to="/profile">{{ authStore.user?.username || 'Profile' }}</router-link>
          </template>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </template>
        
        <template v-else>
          <router-link to="/login" class="btn-primary">Login</router-link>
          <router-link to="/register" class="btn-secondary">Register</router-link>
        </template>

        <!-- Theme Toggle -->
        <button 
          @click="handleThemeToggle" 
          class="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          <Sun v-if="theme === 'light'" class="icon" />
          <Moon v-else class="icon" />
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useTheme } from '@/stores/theme';
import { Sun, Moon } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const { theme, toggleTheme } = useTheme();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const handleThemeToggle = async () => {
  if (!document.startViewTransition) {
    toggleTheme();
    return;
  }

  await document.startViewTransition(() => {
    toggleTheme();
  }).ready;
};
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-img {
  height: 152px;  /* 48px → 56px */
  width: auto;
  transition: transform 0.2s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav a {
  color: hsl(var(--foreground));
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: hsl(var(--brand));
  transition: width 0.2s ease;
}

.nav a:hover::after {
  width: 100%;
}

.nav a.router-link-active {
  color: hsl(var(--brand));
  font-weight: 600;
}

.nav a.router-link-active::after {
  width: 100%;
}

.btn-primary, .btn-secondary, .btn-logout {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #000;
  color: #fff;
}

:root.dark .btn-primary {
  background: #fff;
  color: #000;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-secondary {
  background: transparent;
  border: 1.5px solid hsl(var(--border));
  color: hsl(var(--foreground));
}

.btn-secondary:hover {
  background: hsl(var(--muted));
}

.btn-logout {
  background: hsl(var(--accent-coral));
  color: white;
}

.btn-logout:hover {
  background: hsl(var(--accent-coral-dark));
}

.theme-toggle-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--foreground));
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  background: hsl(var(--muted));
}

.theme-toggle-btn .icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .nav {
    gap: 1rem;
  }
  
  .nav a {
    font-size: 0.85rem;
  }
}
</style>