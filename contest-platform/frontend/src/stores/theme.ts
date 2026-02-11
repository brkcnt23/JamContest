import { ref } from 'vue';

// Global theme store (reactive)
const theme = ref(
  localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
);

function setTheme(newTheme: 'light' | 'dark') {
  console.log('[theme.ts] setTheme called with:', newTheme);
  theme.value = newTheme;
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(newTheme);
  localStorage.setItem('theme', newTheme);
  console.log('[theme.ts] theme.value:', theme.value, 'html class:', document.documentElement.className);
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark');
}

// Ensure theme is set on load
setTheme(theme.value as 'light' | 'dark');

export function useTheme() {
  return { theme, setTheme, toggleTheme };
}
