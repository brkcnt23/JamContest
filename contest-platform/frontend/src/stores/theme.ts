import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light');

export function useTheme() {
  const setTheme = (newTheme: Theme) => {
    console.log('[theme.ts] setTheme called with:', newTheme);
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    
    console.log('[theme.ts] theme.value:', theme.value, 'html class:', document.documentElement.className);
    
    // Update DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize on mount
  setTheme(theme.value);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}