<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n({ useScope: 'global' });

function setLocale(l: string) {
    locale.value = l;
    localStorage.setItem('locale', l);
}
</script>

<template>
    <footer class="footer">
        <div class="container">
            <p>{{ t('footer.copyright') }}</p>
            <div class="links-and-lang">
                <div class="links">
                        <router-link to="/about">{{ t('footer.about') }}</router-link>
                        <router-link to="/coc">{{ t('coc.title') }}</router-link>
                        <router-link to="/governance">{{ t('governance.title') }}</router-link>
                    <router-link to="/terms">{{ t('footer.terms') }}</router-link>
                    <router-link to="/transparency">{{ t('transparency.title') }}</router-link>
                    <router-link to="/privacy">{{ t('footer.privacy') }}</router-link>
                    <router-link to="/contact">{{ t('footer.contact') }}</router-link>
                </div>
                <div class="lang">
                    <span class="label">{{ t('footer.language') }}:</span>
                    <button :class="{ active: locale === 'tr' }" @click="setLocale('tr')">TR</button>
                    <button :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    background: linear-gradient(180deg, #1f2340 0%, #0f1324 100%);
    color: rgba(255,255,255,0.95);
    padding: 2rem 0;
    margin-top: auto;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.links {
    display: flex;
    gap: 1.5rem;
}

.links-and-lang {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.lang {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.lang .label {
    font-weight: 600;
}

.lang button {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
}

.lang button.active {
    background: #7c5cff;
    color: white;
    border-color: transparent;
}
.links a {
    color: rgba(255,255,255,0.92);
    text-decoration: none;
    transition: opacity 0.16s, transform 0.12s;
}

.links a:hover {
    opacity: 1;
    transform: translateY(-2px);
}

p {
    margin: 0;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}
</style>