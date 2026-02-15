<template>
  <div class="dashboard-layout">
    <Sidebar @collapse-change="handleSidebarCollapse" />
    
    <div :class="['main-wrapper', { 'sidebar-collapsed': sidebarCollapsed }]">
      <TopHeader />
      
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import TopHeader from '@/components/layout/TopHeader.vue';

const sidebarCollapsed = ref(false);

const handleSidebarCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed;
};
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: hsl(var(--muted));
}

.main-wrapper {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-wrapper.sidebar-collapsed {
  margin-left: 72px;
}

.main-content {
  min-height: calc(100vh - 64px);
  padding: 2rem;
  background: hsl(var(--background));
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 72px;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>