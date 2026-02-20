// frontend/src/composables/useToast.ts

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 5000
) => {
  // ToastContainer component will handle this via window.showToast
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast(message, type, duration);
  } else {
    console.warn('[Toast] ToastContainer not mounted yet');
  }
};

export const useToast = () => {
  return { showToast };
};