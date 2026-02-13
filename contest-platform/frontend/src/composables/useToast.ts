import { ref } from 'vue'

export const toast = ref<{
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
} | null>(null)

export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
  toast.value = { message, type, duration }
}
