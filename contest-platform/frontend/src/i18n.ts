import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import tr from './locales/tr.json';

const messages = { en, tr } as Record<string, any>;

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null;
const locale = (saved as string) || 'tr';

const i18n = createI18n({
  legacy: false,
  locale: locale as string,
  fallbackLocale: 'en',
  messages: messages as any,
});

export default i18n;
