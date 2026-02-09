<template>
  <div class="page">
    <div class="container">
      <h1>{{ t('privacy.title') }}</h1>
      <p class="updated">{{ t('privacy.last_updated') }}</p>

      <section class="section">
        <h2>{{ t('privacy.sec1_heading') }}</h2>
        <h3>{{ t('privacy.sec1_acc_heading') }}</h3>
        <ul>
          <li>{{ t('privacy.sec1_acc_item_1') }}</li>
          <li>{{ t('privacy.sec1_acc_item_2') }}</li>
          <li>{{ t('privacy.sec1_acc_item_3') }}</li>
        </ul>
        <h3>{{ t('privacy.sec1_subm_heading') }}</h3>
        <ul>
          <li>{{ t('privacy.sec1_subm_item_1') }}</li>
          <li>{{ t('privacy.sec1_subm_item_2') }}</li>
          <li>{{ t('privacy.sec1_subm_item_3') }}</li>
        </ul>
        <h3>{{ t('privacy.sec1_usage_heading') }}</h3>
        <ul>
          <li>{{ t('privacy.sec1_usage_item_1') }}</li>
          <li>{{ t('privacy.sec1_usage_item_2') }}</li>
          <li>{{ t('privacy.sec1_usage_item_3') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec2_heading') }}</h2>
        <ul>
          <li>{{ t('privacy.sec2_item_1') }}</li>
          <li>{{ t('privacy.sec2_item_2') }}</li>
          <li>{{ t('privacy.sec2_item_3') }}</li>
          <li>{{ t('privacy.sec2_item_4') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec3_heading') }}</h2>
        <p><strong>{{ t('privacy.sec3_para1') }}</strong></p>
        <p>{{ t('privacy.sec3_para2') }}</p>
        <ul>
          <li>{{ t('privacy.sec3_item_1') }}</li>
          <li>{{ t('privacy.sec3_item_2') }}</li>
          <li>{{ t('privacy.sec3_item_3') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec4_heading') }}</h2>
        <p>{{ t('privacy.sec4_para1') }}</p>
        <p>{{ t('privacy.sec4_para2') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec5_heading') }}</h2>
        <p>{{ t('privacy.sec5_para1') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec6_heading') }}</h2>
        <p>{{ t('privacy.sec6_intro') }}</p>
        <ul>
          <li>{{ t('privacy.sec6_item_1') }}</li>
          <li>{{ t('privacy.sec6_item_2') }}</li>
          <li>{{ t('privacy.sec6_item_3') }}</li>
          <li>{{ t('privacy.sec6_item_4') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec7_heading') }}</h2>
        <ul>
          <li>{{ t('privacy.sec7_item_1') }}</li>
          <li>{{ t('privacy.sec7_item_2') }}</li>
          <li>{{ t('privacy.sec7_item_3') }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec8_heading') }}</h2>
        <p>{{ t('privacy.sec8_para1') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec9_heading') }}</h2>
        <p>{{ t('privacy.sec9_para1') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec10_heading') }}</h2>
        <p>{{ t('privacy.sec10_para1') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('privacy.sec11_heading') }}</h2>
        <p>{{ t('privacy.sec11_para1') }}</p>
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

h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 1.5rem 0 0.75rem 0;
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

a {
  color: #667eea;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>