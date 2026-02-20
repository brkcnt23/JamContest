<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-vue-next';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const toasts = ref<Toast[]>([]);

const showToast = (message: string, type: Toast['type'] = 'info', duration = 5000) => {
  const id = Math.random().toString(36).substring(7);
  const toast: Toast = { id, message, type, duration };
  
  toasts.value.push(toast);
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

const getIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertCircle;
    case 'info': return Info;
  }
};

const getColorClass = (type: Toast['type']) => {
  switch (type) {
    case 'success': return 'toast-success';
    case 'error': return 'toast-error';
    case 'warning': return 'toast-warning';
    case 'info': return 'toast-info';
  }
};

// Expose showToast globally
onMounted(() => {
  (window as any).showToast = showToast;
});

defineExpose({ showToast });
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', getColorClass(toast.type)]"
        >
          <component :is="getIcon(toast.type)" class="toast-icon" />
          <p class="toast-message">{{ toast.message }}</p>
          <button @click="removeToast(toast.id)" class="toast-close">
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 320px;
  max-width: 420px;
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 0.95rem;
  color: hsl(var(--foreground));
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

/* Type Colors */
.toast-success {
  border-left: 4px solid hsl(var(--accent-emerald));
}

.toast-success .toast-icon {
  color: hsl(var(--accent-emerald));
}

.toast-error {
  border-left: 4px solid hsl(var(--accent-coral));
}

.toast-error .toast-icon {
  color: hsl(var(--accent-coral));
}

.toast-warning {
  border-left: 4px solid hsl(var(--accent-amber));
}

.toast-warning .toast-icon {
  color: hsl(var(--accent-amber));
}

.toast-info {
  border-left: 4px solid hsl(var(--accent-teal));
}

.toast-info .toast-icon {
  color: hsl(var(--accent-teal));
}

/* Animations */
.toast-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.2s ease-out forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .toast {
    min-width: auto;
  }
}
</style>