<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🎮 JamContest</h1>
        <p class="text-slate-400">Email Adresinizi Doğrulayın</p>
      </div>

      <!-- Card -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
        <div v-if="loading" class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p class="text-slate-400">Doğrulanıyor...</p>
        </div>

        <div v-else-if="success" class="text-center">
          <div class="inline-block bg-green-500/20 rounded-full p-4 mb-4">
            <svg class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Başarılı!</h2>
          <p class="text-slate-400 mb-6">Email adresiniz doğrulandı. Artık giriş yapabilirsiniz.</p>
          <router-link to="/login" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Giriş Yap
          </router-link>
        </div>

        <div v-else-if="error" class="text-center">
          <div class="inline-block bg-red-500/20 rounded-full p-4 mb-4">
            <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Hata!</h2>
          <p class="text-slate-400 mb-6">{{ error }}</p>
          <router-link to="/login" class="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition">
            Giriş Sayfasına Dön
          </router-link>
        </div>

        <div v-else class="text-center">
          <p class="text-slate-400">Token bulunamadı. Lütfen email'deki linki kullanın.</p>
          <router-link to="/login" class="inline-block mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Giriş Yap
          </router-link>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-500 text-sm mt-8">
        Hesabınız mı yok? <router-link to="/register" class="text-purple-400 hover:text-purple-300">Kayıt Ol</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const loading = ref(false);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    error.value = 'Geçersiz link';
    return;
  }

  loading.value = true;
  try {
    await axios.post('/api/auth/verify-email', { token });
    success.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Email doğrulama başarısız';
  } finally {
    loading.value = false;
  }
});
</script>
