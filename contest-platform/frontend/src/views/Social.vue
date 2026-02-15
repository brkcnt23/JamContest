<template>
  <div class="page-container">
    <h1 class="page-title">Social Feed</h1>
    <p class="page-subtitle">Connect with other artists</p>
    <div class="placeholder-content">
      <p>Coming soon...</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
}

.placeholder-content {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
}
</style>