<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from '../i18n';

const { t } = useI18n({ useScope: 'global' });

function getArray(path: string) {
  const locale = (i18n.global.locale as any).value as string;
  let msgs: any = {};
  // prefer public API to get messages for the active locale
  if (typeof (i18n.global as any).getLocaleMessage === 'function') {
    msgs = (i18n.global as any).getLocaleMessage(locale) || {};
  } else {
    // fallback for older versions
    msgs = (i18n.global as any).messages?.[locale] || {};
  }

  const parts = path.split('.');
  let node: any = msgs;
  for (const p of parts) {
    if (node == null) return [];
    node = node[p];
  }
  if (Array.isArray(node)) return node;
  if (typeof node === 'string') return [node];
  return [];
}
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>{{ t('about.title') }}</h1>
      <h3 style="text-align:center;margin-bottom:1.5rem">{{ t('about.subtitle') }}</h3>

      <section class="section">
        <p>{{ t('about_extra.independent_line') }}</p>
        <p>{{ t('about_extra.operational_line') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('about.intro_title') }}</h2>
        <template v-if="getArray('about.intro').length">
          <div v-for="(p, idx) in getArray('about.intro')" :key="idx">
            <p>{{ p }}</p>
          </div>
        </template>
        <template v-else>
          <p>{{ t('about.intro') }}</p>
        </template>
      </section>

      <section class="section">
        <h2>{{ t('about.mission_title') }}</h2>
        <ul>
          <li v-for="(m, i) in getArray('about.mission_points')" :key="i">{{ m }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('about_extra.open_disciplines_title') }}</h2>
        <ul>
          <li v-for="(d, i) in getArray('about_extra.open_disciplines')" :key="i">{{ d }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('about.funding_title') }}</h2>
        <template v-if="getArray('about.funding_paragraphs').length">
          <div v-for="(p, idx) in getArray('about.funding_paragraphs')" :key="idx">
            <p>{{ p }}</p>
          </div>
        </template>
        <template v-else>
          <p>{{ t('about.funding_paragraphs') }}</p>
        </template>
        <ul>
          <li v-for="(f, i) in getArray('about.funding_list')" :key="i">{{ f }}</li>
        </ul>
        <p>{{ t('about.funding_note') }}</p>
      </section>

      <section class="section">
        <h2>{{ t('about.transparency_title') }}</h2>
        <ul>
          <li v-for="(tr, i) in getArray('about.transparency_list')" :key="i">{{ tr }}</li>
        </ul>
      </section>

      <section class="section">
        <h2>{{ t('about.governance_title') }}</h2>
        <template v-if="getArray('about.governance_paragraphs').length">
          <div v-for="(p, idx) in getArray('about.governance_paragraphs')" :key="idx">
            <p>{{ p }}</p>
          </div>
        </template>
        <template v-else>
          <p>{{ t('about.governance_paragraphs') }}</p>
        </template>
      </section>

      <section class="section">
        <h2>{{ t('about.core_title') }}</h2>
        <ul>
          <li v-for="(c, i) in getArray('about.core_list')" :key="i">{{ c }}</li>
        </ul>
        <p>{{ t('about.closing') }}</p>
      </section>
    </div>
  </div>
</template>

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
  margin-bottom: 2rem;
  text-align: center;
}

.section {
  background: white;
  padding: 30px;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  font-size: 1.75rem;
  color: #667eea;
  margin-bottom: 1rem;
}

p {
  line-height: 1.8;
  color: #555;
  margin-bottom: 1rem;
}

ol, ul {
  padding-left: 20px;
  line-height: 2;
  color: #555;
}

li {
  margin-bottom: 0.75rem;
}

strong {
  color: #2c3e50;
  font-weight: 600;
}
</style>