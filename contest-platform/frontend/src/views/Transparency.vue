<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n({ useScope: 'global' });
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>{{ t('transparency.title') }}</h1>
      <p class="muted">{{ t('transparency.year') }}</p>

      <section class="section">
        <ul>
          <li><strong>{{ t('transparency.active_contests') }}:</strong> {{ t('transparency.values.active_contests') }}</li>
          <li><strong>{{ t('transparency.participants') }}:</strong> {{ t('transparency.values.participants') }}</li>
          <li><strong>{{ t('transparency.volunteer_organizers') }}:</strong> {{ t('transparency.values.volunteer_organizers') }}</li>
          <li><strong>{{ t('transparency.infrastructure_status') }}:</strong> {{ t('transparency.values.infrastructure_status') }}</li>
          <li><strong>{{ t('transparency.financial_inflow') }}:</strong> {{ t('transparency.values.financial_inflow') }}</li>
          <li><strong>{{ t('transparency.financial_outflow') }}:</strong> {{ t('transparency.values.financial_outflow') }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 60px 0; min-height: calc(100vh - 200px); }
.container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
h1 { font-size: 2.5rem; color: #2c3e50; margin-bottom: 0.5rem; text-align: center; }
.muted { text-align:center; color:#666; margin-bottom:1.5rem }
.section { background: white; padding: 24px; margin-bottom: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
</style>
