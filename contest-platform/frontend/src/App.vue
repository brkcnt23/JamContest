<template>
  <div id="app">
     <Header v-if="!isBlank" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="!isBlank" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import Header from "@/components/layout/Header.vue"
import Footer from "@/components/layout/Footer.vue"
import { useAuthStore } from "@/stores/auth"

const route = useRoute();
const authStore = useAuthStore();
const isBlank = computed(() => route.meta?.layout === "blank")


onMounted(() => {
  authStore.setupAxiosInterceptor();
  if (authStore.token) {
    authStore.fetchUser();
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --radius: 0.625rem;
  --background: 214 10% 9%;
  --foreground: 0 0% 98%;
  --card: 214 10% 13%;
  --card-foreground: 0 0% 98%;
  --popover: 214 10% 13%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 92%;
  --primary-foreground: 214 10% 13%;
  --secondary: 214 10% 17%;
  --secondary-foreground: 0 0% 98%;
  --muted: 214 10% 17%;
  --muted-foreground: 0 0% 71%;
  --accent: 214 10% 17%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 72% 51%;
  --border: 0 0% 100% / 10%;
  --input: 0 0% 100% / 15%;
  --ring: 0 0% 56%;
  --brand: var(--foreground);
  --brand-foreground: var(--muted-foreground);
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
</style>