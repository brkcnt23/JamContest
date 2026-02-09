<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from '../i18n';

const { t } = useI18n({ useScope: 'global' });

function getArray(path: string) {
  const locale = (i18n.global.locale as any).value as string;
  let msgs: any = {};
  if (typeof (i18n.global as any).getLocaleMessage === 'function') {
    msgs = (i18n.global as any).getLocaleMessage(locale) || {};
  } else {
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
      <h1>{{ t('governance.title') }}</h1>
      <section class="section">
        <p>{{ t('governance.intro') }}</p>
      </section>
      <section class="section">
        <p><em>{{ t('governance.note') }}</em></p>
      </section>

      <section class="section" v-for="(s, i) in getArray('governance.sections')" :key="i">
        <h2>{{ s.heading }}</h2>
        <div v-if="s.points">
          <ul>
            <li v-for="(p, idx) in s.points" :key="idx">{{ p }}</li>
          </ul>
        </div>
        <p v-else-if="s.body">{{ s.body }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 60px 0; min-height: calc(100vh - 200px); }
.container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
h1 { font-size: 2.5rem; color: #2c3e50; margin-bottom: 2rem; text-align: center; }
.section { background: white; padding: 30px; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
h2 { font-size: 1.75rem; color: #667eea; margin-bottom: 1rem; }
p { line-height: 1.8; color: #555; margin-bottom: 1rem; }
ul { padding-left: 20px; line-height: 2; color: #555; }
li { margin-bottom: 0.75rem; }
</style>
