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
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useTheme } from '@/stores/theme';

const authStore = useAuthStore();
const router = useRouter();
const { theme } = useTheme();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
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
  height: 48px;
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
  background: hsl(var(--foreground));
  transition: width 0.2s ease;
}

.nav a:hover::after {
  width: 100%;
}

.nav a.router-link-active {
  color: hsl(var(--foreground));
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
  background: #ef4444;
  color: white;
}

.btn-logout:hover {
  background: #dc2626;
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