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
    _interceptorsSet: false,
    _initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.globalRole === 'ADMIN' || state.user?.globalRole === 'SUPER_ADMIN',
    isJury: (state) => state.user?.globalRole === 'JURY' || state.user?.globalRole === 'ADMIN' || state.user?.globalRole === 'SUPER_ADMIN',
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
      this.token = data.accessToken;
      this.user = data.user;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      this.setupAxiosInterceptor();
      return { success: true };
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const { data } = await axios.get('/api/auth/me');
        this.user = data.user || data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        throw error;
      }
    },

    init() {
      this.setupAxiosInterceptor();
      this.initAuth();
    },

    async initAuth() {
      if (this._initialized) return;

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token) {
        this.token = token;
        this.user = userStr ? JSON.parse(userStr) : null;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.setupAxiosInterceptor();
        
        // Verify token is still valid
        try {
          await this.fetchUser();
        } catch {
          this.logout();
        }
      }
      
      this._initialized = true;
    },

    setupAxiosInterceptor() {
      // Already set up
      if (this._interceptorsSet) return;
      this._interceptorsSet = true;

      // Axios default config — credentials aç (cookie gönder)
      axios.defaults.withCredentials = true;

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
          if (error.response?.status === 401 && !original._retry && 
              !original.url?.includes('/auth/refresh') && 
              !original.url?.includes('/auth/login')) {
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
      this._initialized = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },
  },
});