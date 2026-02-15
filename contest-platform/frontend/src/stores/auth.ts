import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  avatar?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isJury: (state) => state.user?.role === 'JURY' || state.user?.role === 'ADMIN',
  },

  actions: {
    async register(email: string, password: string, username: string) {
      const { data } = await axios.post('/api/auth/register', { email, password, username });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      this.setupAxiosInterceptor();
    },

    async login(email: string, password: string) {
      const { data } = await axios.post('/api/auth/login', { email, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      this.setupAxiosInterceptor();
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const { data } = await axios.get('/api/auth/me');
        this.user = data;
      } catch (error) {
        this.logout();
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },

    setupAxiosInterceptor() {
      axios.interceptors.request.use((config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      });
    },
  },
});