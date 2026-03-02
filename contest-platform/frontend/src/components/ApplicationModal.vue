<script setup lang="ts">
import { ref } from 'vue';
import { X } from 'lucide-vue-next';
import { showToast } from '@/composables/useToast';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  type: 'jury' | 'organizer';
  onClose: () => void;
}

const props = defineProps<Props>();

const motivation = ref('');
const loading = ref(false);
const maxLength = 500;

const handleSubmit = async () => {
  if (!motivation.value.trim()) {
    showToast('Motivation required', 'error');
    return;
  }

  loading.value = true;
  try {
    const endpoint = `/api/applications/${props.type}`;
    await axios.post(endpoint, {
      motivation: motivation.value,
    });

    showToast(`${props.type.charAt(0).toUpperCase() + props.type.slice(1)} application submitted successfully!`, 'success');
    motivation.value = '';
    props.onClose();
  } catch (error: any) {
    showToast(error.response?.data?.message || 'Application failed', 'error');
  } finally {
    loading.value = false;
  }
};

const remaining = maxLength - motivation.value.length;
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="onClose">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          Apply for {{ type === 'jury' ? 'Jury' : 'Organizer' }}
        </h2>
        <button @click="onClose" class="close-btn">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">
            Tell us why you want to be a {{ type === 'jury' ? 'jury member' : 'contest organizer' }}
            <span class="required">*</span>
          </label>
          <textarea
            v-model="motivation"
            :maxlength="maxLength"
            :placeholder="`Describe your experience and motivation (max ${maxLength} characters)...`"
            class="form-textarea"
            rows="6"
          ></textarea>
          <div class="char-count" :class="{ 'near-limit': remaining < 50 }">
            {{ remaining }} characters remaining
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="onClose" class="btn btn-secondary" :disabled="loading">
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="btn btn-primary"
          :disabled="loading || !motivation.trim()"
        >
          {{ loading ? 'Submitting...' : 'Submit Application' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.modal-body {
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  display: flex;
  gap: 4px;
}

.required {
  color: hsl(var(--accent-coral));
}

.form-textarea {
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: hsl(var(--brand));
  box-shadow: 0 0 0 3px hsl(var(--brand) / 0.1);
}

.char-count {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: right;
}

.char-count.near-limit {
  color: hsl(var(--accent-coral));
  font-weight: 600;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--muted));
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: hsl(var(--brand));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: hsl(var(--brand) / 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 12px hsl(var(--brand) / 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover:not(:disabled) {
  background: hsl(var(--muted) / 0.8);
  border-color: hsl(var(--border) / 0.6);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
