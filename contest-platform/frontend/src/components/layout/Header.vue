<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="logo">
        <h1>Contest Platform</h1>
      </router-link>
      
      <nav class="nav">
        <router-link to="/">Home</router-link>
        <router-link to="/contests">Contests</router-link>
        
        <template v-if="authStore.isAuthenticated">
          <router-link v-if="authStore.isAdmin" to="/admin">Admin</router-link>
          <router-link v-if="authStore.isJury" to="/jury">Jury</router-link>
          <template v-if="authStore.user?.id">
            <router-link :to="{ name: 'UserProfile', params: { id: authStore.user.id } }">{{ authStore.user?.username }}</router-link>
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

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.header {
  background: linear-gradient(90deg, #667eea 0%, #8e44ff 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 6px 20px rgba(102,126,234,0.12);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: white;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav a {
  color: rgba(255,255,255,0.95);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.18s, transform 0.12s;
}

.nav a:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.nav a.router-link-active {
  border-bottom: 2px solid white;
  padding-bottom: 2px;
}

.btn-primary, .btn-secondary, .btn-logout {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #7c5cff;
  color: white;
}

.btn-primary:hover {
  background: #6749e6;
}

.btn-secondary {
  background: transparent;
  border: 2px solid rgba(255,255,255,0.35);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.95);
  color: #2c3e50;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  cursor: pointer;
}

.btn-logout:hover {
  background: #c0392b;
}
</style>