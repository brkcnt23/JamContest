<template>
  <div :class="['auth-bg', theme]">
    <div class="auth-card">
      <div class="icon-box">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-3.31 0-6 2.69-6 6v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1c0-3.31-2.69-6-6-6z"/></svg>
      </div>
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input v-model="email" type="email" placeholder="Email" required />
        </div>
        <div class="input-group">
          <input v-model="password" type="password" placeholder="Password" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Loading...' : 'Login' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="switch-link">Don't have an account? <router-link to="/register">Register</router-link></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/stores/theme';
const { theme, setTheme } = useTheme();

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
}

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: background 0.3s;
}
.auth-bg.dark {
  background: #18181b;
}
.auth-bg.light {
  background: #fff;
}
.toggle-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #222;
  transition: color 0.2s;
}
.toggle-btn.dark {
  color: #fff;
}
.auth-card {
  background: var(--background, #fff);
  color: var(--foreground, #222);
  padding: 40px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102,126,234,0.18);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  transition: background 0.3s, color 0.3s;
}
.icon-box {
  margin-bottom: 12px;
  color: #8e44ff;
  background: rgba(102,126,234,0.08);
  border-radius: 50%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
h1 {
  margin-bottom: 12px;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
}
form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.input-group {
  width: 100%;
  display: flex;
  align-items: center;
  background: var(--muted, #f5f5f5);
  border-radius: 8px;
  padding: 2px 8px;
  box-shadow: 0 2px 8px rgba(102,126,234,0.04);
}
.auth-bg.dark .input-group {
  background: #232323;
}
input {
  width: 100%;
  padding: 14px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 16px;
  color: inherit;
  outline: none;
}
input::placeholder {
  color: #aaa;
}
button {
  padding: 14px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102,126,234,0.08);
  transition: background 0.2s;
}
.auth-bg.dark button {
  background: #fff;
  color: #222;
}
button:hover {
  opacity: 0.85;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #e74c3c;
  font-size: 15px;
  text-align: center;
  margin-top: 8px;
}
.switch-link {
  margin-top: 18px;
  text-align: center;
  color: #667eea;
}
.switch-link a {
  color: #8e44ff;
  font-weight: 600;
}
</style>