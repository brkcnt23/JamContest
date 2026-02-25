import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  globalRole: string;
  avatar?: string;
}


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => ['ADMIN', 'SUPER_ADMIN'].includes(state.user?.globalRole || ''),
    isJury: (state) => ['JURY', 'ADMIN', 'SUPER_ADMIN'].includes(state.user?.globalRole || ''),
    isSuperAdmin: (state) => state.user?.globalRole === 'SUPER_ADMIN',
  },

  actions: {
    async register(email: string, password: string, username: string) {
      await axios.post('/api/auth/register', { email, password, username });
      // token yok artık, kullanıcıyı verify sayfasına yönlendir
      return { message: 'Email doğrulama maili gönderildi' };
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

    setupAxiosInterceptor() {
      // Request interceptor — accessToken ekle
      axios.interceptors.request.use((config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      });

      // Response interceptor — 401 gelirse refresh dene
      axios.interceptors.response.use(
        (res) => res,
        async (error) => {
          const original = error.config;
          if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
            original._retry = true;
            try {
              const { data } = await axios.post('/api/auth/refresh');
              this.token = data.accessToken;
              localStorage.setItem('token', data.accessToken);
              original.headers.Authorization = `Bearer ${data.accessToken}`;
              return axios(original);
            } catch {
              this.logout();
              window.location.href = '/login';
            }
          }
          return Promise.reject(error);
        }
      );
    },

    async logout() {
      try {
        await axios.post('/api/auth/logout');
      } catch {}
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});