<template>
  <div class="page">
    <div class="container">
      <h1>{{ t('terms.title') }}</h1>
      <p class="updated">{{ t('terms.last_updated') }}</p>

      <section class="section">
        <h2>{{ t('terms.sec1_heading') }}</h2>
        <p>{{ t('terms.sec1_para') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec2_heading') }}</h2>
        <p v-html="t('terms.sec2_para')"></p>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec3_heading') }}</h2>
        <ul>
          <li>{{ t('terms.sec3_item_1') }}</li>
          <li>{{ t('terms.sec3_item_2') }}</li>
          <li>{{ t('terms.sec3_item_3') }}</li>
          <li>{{ t('terms.sec3_item_4') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec4_heading') }}</h2>
        <ul>
          <li>{{ t('terms.sec4_item_1') }}</li>
          <li>{{ t('terms.sec4_item_2') }}</li>
          <li>{{ t('terms.sec4_item_3') }}</li>
          <li>{{ t('terms.sec4_item_4') }}</li>
          <li>{{ t('terms.sec4_item_5') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec5_heading') }}</h2>
        <p>{{ t('terms.sec5_intro') }}</p>
        <ul>
          <li>{{ t('terms.sec5_item_1') }}</li>
          <li>{{ t('terms.sec5_item_2') }}</li>
          <li>{{ t('terms.sec5_item_3') }}</li>
          <li>{{ t('terms.sec5_item_4') }}</li>
          <li>{{ t('terms.sec5_item_5') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec6_heading') }}</h2>
        <p>{{ t('terms.sec6_para') }}</p>
        <ul>
          <li>{{ t('terms.sec6_item_1') }}</li>
          <li>{{ t('terms.sec6_item_2') }}</li>
          <li>{{ t('terms.sec6_item_3') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec7_heading') }}</h2>
        <p>{{ t('terms.sec7_para') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec8_heading') }}</h2>
        <p>{{ t('terms.sec8_para') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('terms.sec9_heading') }}</h2>
        <p>{{ t('terms.sec9_para') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.page {
  padding: 60px 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
}

.updated {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 3rem;
  font-style: italic;
}

.section {
  background: white;
  padding: 30px;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

p {
  line-height: 1.8;
  color: #555;
  margin-bottom: 1rem;
}

ul {
  padding-left: 20px;
  line-height: 1.9;
  color: #555;
}

li {
  margin-bottom: 0.5rem;
}

strong {
  color: #2c3e50;
  font-weight: 600;
}
</style>