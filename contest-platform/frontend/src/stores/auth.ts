// stores/auth.ts
import { defineStore } from 'pinia';
import { api } from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isJury: (state) => state.user?.role === 'JURY' || state.user?.role === 'ADMIN',
    isAdmin: (state) => state.user?.role === 'ADMIN',
  },

  actions: {
    async login(email: string, password: string) {
      const { token, user } = await api.post('/auth/login', { email, password });
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
    },

    async fetchUser() {
      if (!this.token) return;
      this.user = await api.get('/auth/me');
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});