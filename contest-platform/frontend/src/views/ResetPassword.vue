<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🎮 JamContest</h1>
        <p class="text-slate-400">Yeni Şifre Belirleyin</p>
      </div>

      <!-- Card -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
        <div v-if="success" class="text-center">
          <div class="inline-block bg-green-500/20 rounded-full p-4 mb-4">
            <svg class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Başarılı!</h2>
          <p class="text-slate-400 mb-6">Şifreniz başarıyla sıfırlandı. Einci şifrenizle giriş yapın.</p>
          <router-link to="/login" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Giriş Yap
          </router-link>
        </div>

        <form v-else @submit.prevent="submit" class="space-y-6">
          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-300 mb-2">Yeni Şifre</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="En az 8 karakter"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- ConfirmPassword Input -->
          <div>
            <label for="confirm" class="block text-sm font-medium text-slate-300 mb-2">Şifreyi Onayla</label>
            <input
              id="confirm"
              v-model="form.confirm"
              type="password"
              required
              placeholder="Şifreyi tekrar girin"
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
            <span v-if="loading">⏳ Sıfırlanıyor...</span>
            <span v-else>🔑 Şifreyi Sıfırla</span>
          </button>

          <!-- Login Link -->
          <p class="text-center text-slate-400 text-sm">
            Geri dön <router-link to="/login" class="text-purple-400 hover:text-purple-300">Giriş Sayfasına</router-link>
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const form = ref({
  password: '',
  confirm: '',
});

const loading = ref(false);
const error = ref('');
const success = ref(false);
const token = ref('');

onMounted(() => {
  token.value = route.query.token as string;
  if (!token.value) {
    error.value = 'Geçersiz link';
  }
});

const submit = async () => {
  if (!form.value.password || !form.value.confirm) {
    error.value = 'Tüm alanları doldurun';
    return;
  }

  if (form.value.password !== form.value.confirm) {
    error.value = 'Şifreler eşleşmiyor';
    return;
  }

  if (form.value.password.length < 8) {
    error.value = 'Şifre en az 8 karakter olmalı';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await axios.post('/api/auth/reset-password', {
      token: token.value,
      password: form.value.password,
    });
    success.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Şifre sıfırlama başarısız';
  } finally {
    loading.value = false;
  }
};
</script>
