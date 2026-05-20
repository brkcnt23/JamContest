<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('jobs.create_title') }}</h1>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('jobs.form.title') }} *</label>
        <input
          v-model="form.title"
          type="text"
          required
          maxlength="150"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
          :placeholder="$t('jobs.form.title_placeholder')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('jobs.form.description') }} *</label>
        <textarea
          v-model="form.description"
          required
          rows="5"
          maxlength="3000"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-violet-500 transition-colors resize-y"
          :placeholder="$t('jobs.form.desc_placeholder')"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('jobs.form.company') }}</label>
          <input
            v-model="form.company"
            type="text"
            maxlength="100"
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('jobs.form.location') }}</label>
          <input
            v-model="form.location"
            type="text"
            maxlength="100"
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('jobs.form.salary') }}</label>
          <input
            v-model="form.salary"
            type="text"
            maxlength="50"
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
            placeholder="örn. 15.000 - 25.000 TL"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('jobs.form.contact_email') }}</label>
          <input
            v-model="form.contactEmail"
            type="email"
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ $t('jobs.form.tags') }}</label>
        <input
          v-model="tagInput"
          type="text"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
          :placeholder="$t('jobs.form.tags_placeholder')"
          @keydown.enter.prevent="addTag"
        />
        <div v-if="form.tags.length" class="flex flex-wrap gap-1.5 mt-2">
          <span
            v-for="(tag, i) in form.tags"
            :key="i"
            class="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-violet-500/20 text-violet-300"
          >
            {{ tag }}
            <button type="button" @click="form.tags.splice(i, 1)" class="hover:text-white">&times;</button>
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input v-model="form.remote" type="checkbox" id="remote" class="w-4 h-4 rounded accent-violet-600" />
        <label for="remote" class="text-sm text-gray-300">{{ $t('jobs.form.remote') }}</label>
      </div>

      <div class="flex items-center gap-3 pt-4">
        <button
          type="submit"
          :disabled="submitting"
          class="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
        >
          {{ submitting ? $t('common.saving') : $t('jobs.form.submit') }}
        </button>
        <router-link to="/jobs" class="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm transition-colors">
          {{ $t('common.cancel') }}
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { showToast } from '@/composables/useToast';

const router = useRouter();
const submitting = ref(false);
const tagInput = ref('');

const form = reactive({
  title: '',
  description: '',
  company: '',
  location: '',
  remote: false,
  salary: '',
  tags: [] as string[],
  contactEmail: '',
  contactUrl: '',
});

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag);
  }
  tagInput.value = '';
}

async function handleSubmit() {
  if (!form.title || !form.description) return;
  submitting.value = true;
  try {
    await axios.post('/api/jobs', form);
    showToast('İş ilanı oluşturuldu', 'success');
    router.push('/jobs');
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Bir hata oluştu', 'error');
  } finally {
    submitting.value = false;
  }
}
</script>
