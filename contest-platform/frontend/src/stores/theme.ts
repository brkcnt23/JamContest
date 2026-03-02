import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light');

export function useTheme() {
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    
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