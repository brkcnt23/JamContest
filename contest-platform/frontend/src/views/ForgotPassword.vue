<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🎮 JamContest</h1>
        <p class="text-slate-400">Şifre Sıfırlama</p>
      </div>

      <!-- Card -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
        <div v-if="sent" class="text-center">
          <div class="inline-block bg-green-500/20 rounded-full p-4 mb-4">
            <svg class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Email Gönderildi!</h2>
          <p class="text-slate-400 mb-6">Lütfen email adresinizi kontrol edin ve şifre sıfırlama linkine tıklayın.</p>
          <router-link to="/login" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Giriş Sayfasına Dön
          </router-link>
        </div>

        <form v-else @submit.prevent="submit" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-300 mb-2">Email Adresiniz</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="ornek@jamcontest.com"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <span v-if="loading">⏳ Gönderiliyor...</span>
            <span v-else>🔑 Şifre Sıfırlama Maili Gönder</span>
          </button>

          <!-- Login Link -->
          <p class="text-center text-slate-400 text-sm">
            Hatırladınız mı? <router-link to="/login" class="text-purple-400 hover:text-purple-300">Giriş Yap</router-link>
          </p>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-500 text-sm mt-8">
        Hesabınız mı yok? <router-link to="/register" class="text-purple-400 hover:text-purple-300">Kayıt Ol</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const form = ref({
  email: '',
});

const loading = ref(false);
const error = ref('');
const sent = ref(false);

const submit = async () => {
  if (!form.value.email) return;
  
  loading.value = true;
  error.value = '';

  try {
    await axios.post('/api/auth/forgot-password', {
      email: form.value.email,
    });
    sent.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Bir hata oluştu';
  } finally {
    loading.value = false;
  }
};
</script>
