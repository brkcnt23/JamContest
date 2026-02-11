<template>
  <div id="app">
    <Header v-if="!isBlankLayout" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="!isBlankLayout" />
  </div>
</template>



<script setup lang="ts">
import { onMounted, computed, onUnmounted } from 'vue';
import { useTheme } from '@/stores/theme';
const { theme, setTheme } = useTheme();
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';

const route = useRoute();
const authStore = useAuthStore();

const isBlankLayout = computed(() => route.meta.layout === 'blank');
let cursorEl: HTMLDivElement | null = null;

onMounted(() => {
  authStore.setupAxiosInterceptor();
  if (authStore.token) {
    authStore.fetchUser();
  }
});

// Rainbow palette for cursor
const rainbow = [
  [0, 'red'],
  [30, 'orange'],
  [60, 'yellow'],
  [120, 'lime'],
  [180, 'turquoise'],
  [210, 'deepskyblue'],
  [240, 'blue'],
  [270, 'indigo'],
  [300, 'violet'],
  [330, 'magenta'],
  [360, 'red']
];
const getRainbowColor = (x: number, w: number) => {
  const hue = Math.round((x / w) * 360);
  return `hsl(${hue}, 95%, 60%)`;
};
const moveCursor = (e: MouseEvent) => {
  if (cursorEl) {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top = e.clientY + 'px';
    // Theme-aware cursor color
    if (theme.value === 'light') {
      cursorEl.style.background = 'radial-gradient(circle, #222 0%, rgba(0,0,0,0.18) 60%, transparent 100%)';
      cursorEl.style.boxShadow = '0 0 12px 4px #222, 0 0 0 2px #fff';
      cursorEl.style.border = '2.5px solid #222';
    } else {
      // Animate color by horizontal position (rainbow)
      const color = getRainbowColor(e.clientX, window.innerWidth);
      cursorEl.style.background = `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0.25) 60%, transparent 100%)`;
      cursorEl.style.boxShadow = `0 0 24px 8px ${color}`;
      cursorEl.style.border = `2.5px solid ${color}`;
    }
  }
};
onMounted(() => {
  cursorEl = document.createElement('div');
  cursorEl.className = 'custom-cursor';
  document.body.appendChild(cursorEl);
  window.addEventListener('mousemove', moveCursor);
});
onUnmounted(() => {
  if (cursorEl) {
    cursorEl.remove();
    cursorEl = null;
  }
  window.removeEventListener('mousemove', moveCursor);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/*
  Vars for palette and radius only, theme colors come from index.css for light/dark
*/
:root {
  --radius: 0.625rem;
  --brand: 271 91% 65%;
  --brand-foreground: 271 91% 85%;
  --palette-purple: 271 91% 65%;
  --palette-yellow: 48 100% 60%;
  --palette-green: 142 71% 45%;
  --palette-blue: 210 100% 60%;
  --palette-pink: 330 90% 70%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.main-content {
  flex: 1;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}


@keyframes float-up {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}
.animate-float-up {
  animation: float-up 6s ease-in-out infinite;
}
@keyframes appear {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-appear {
  animation: appear 0.5s ease-out forwards;
}
.delay-100 { animation-delay: 100ms; }
.delay-300 { animation-delay: 300ms; }
.delay-500 { animation-delay: 500ms; }
.delay-700 { animation-delay: 700ms; }
.delay-1000 { animation-delay: 1000ms; }
/* Custom glowing cursor, theme-aware */
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 38px;
  height: 38px;
  pointer-events: none;
  border-radius: 50%;
  z-index: 99999;
  transform: translate(-50%, -50%);
  transition: background 0.18s, box-shadow 0.18s, border 0.18s;
}

body, #app {
  cursor: none;
}

input, textarea, a, select, [role="button"] {
  cursor: auto !important;
}
button {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\'><path fill=\'%23222\' d=\'M3 17.25V21h3.75l11.06-11.06-3.75-3.75zm2.92 2.92l-1.17-1.17 9.19-9.19 1.17 1.17zm13.06-13.06a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.34-1.34a1.003 1.003 0 0 0 0-1.42l-2.33-2.33z\'/></svg>') 4 24, pointer;
}
</style>