<script setup lang="ts">
import { X } from 'lucide-vue-next';

interface Props {
  imageUrl: string;
  imageTitle?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: []
}>();

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  }
};

// Mount escape listener
import { onMounted, onUnmounted } from 'vue';
onMounted(() => {
  document.addEventListener('keydown', handleEscape);
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div class="lightbox-backdrop" @click="handleBackdropClick">
      <div class="lightbox-container">
        <!-- Close Button -->
        <button class="lightbox-close" @click="emit('close')" aria-label="Close">
          <X class="w-6 h-6" />
        </button>

        <!-- Image -->
        <img :src="imageUrl" :alt="imageTitle || 'Artwork'" class="lightbox-image" />

        <!-- Title (optional) -->
        <div v-if="imageTitle" class="lightbox-title">
          {{ imageTitle }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.lightbox-container {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.lightbox-close {
  position: absolute;
  top: -3rem;
  right: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.lightbox-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.lightbox-title {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .lightbox-backdrop {
    padding: 1rem;
  }

  .lightbox-close {
    top: -2.5rem;
    width: 40px;
    height: 40px;
  }

  .lightbox-image {
    max-height: 80vh;
  }

  .lightbox-title {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
}
</style>