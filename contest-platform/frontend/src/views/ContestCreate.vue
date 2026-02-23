<template>
  <div class="contest-create">
    <div class="page-header">
      <h1 class="page-title">Yeni Yarışma Oluştur</h1>
      <p class="page-subtitle">Yarışmanız admin onayından sonra yayınlanacaktır</p>
    </div>

    <!-- Stepper -->
    <div class="stepper">
      <div v-for="(s, i) in steps" :key="i" :class="['step', step === i && 'step--active', step > i && 'step--done']" @click="step = i">
        <div class="step-number">{{ step > i ? '✓' : i + 1 }}</div>
        <span class="step-label">{{ s }}</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form-container">

      <!-- STEP 0: Temel Bilgiler -->
      <div v-show="step === 0" class="form-section">
        <h2 class="section-title">Temel Bilgiler</h2>

        <div class="form-group">
          <label class="form-label">Yarışma Adı *</label>
          <input v-model="form.title" type="text" class="form-input" placeholder="Örn: Pixel Art Challenge 2026" required />
        </div>

        <div class="form-group">
          <label class="form-label">Kategori *</label>
          <div class="category-grid">
            <button v-for="cat in categories" :key="cat.value" type="button"
              :class="['category-card', form.category === cat.value && 'category-card--selected']"
              @click="form.category = cat.value">
              <span class="category-icon">{{ cat.icon }}</span>
              <span class="category-name">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Açıklama *</label>
          <textarea v-model="form.description" class="form-textarea" rows="5" placeholder="Yarışma hakkında detaylı bilgi..." required></textarea>
          <span class="form-hint">{{ form.description.length }}/2000 karakter</span>
        </div>

        <div class="form-group">
          <label class="form-label">Kapak Görseli (URL)</label>
          <input v-model="form.coverImage" type="url" class="form-input" placeholder="https://example.com/cover.jpg" />
          <div v-if="form.coverImage" class="cover-preview">
            <img :src="form.coverImage" alt="Cover" @error="(e: Event) => (e.target as HTMLImageElement).style.display='none'" />
          </div>
        </div>
      </div>

      <!-- STEP 1: Tarihler -->
      <div v-show="step === 1" class="form-section">
        <h2 class="section-title">Tarih Planlaması</h2>
        <p class="section-desc">Yarışmanın tüm aşamaları için tarihleri belirleyin</p>

        <div class="timeline-visual">
          <div class="timeline-phase" v-for="phase in timelinePhases" :key="phase.key">
            <div :class="['timeline-dot', phase.color]"></div>
            <div class="timeline-info">
              <span class="timeline-label">{{ phase.label }}</span>
              <span class="timeline-date">{{ phase.start ? formatDateShort(phase.start) : '—' }} → {{ phase.end ? formatDateShort(phase.end) : '—' }}</span>
            </div>
          </div>
        </div>

        <div class="date-grid">
          <div class="form-group">
            <label class="form-label">Başvuru Başlangıç *</label>
            <input v-model="form.applicationStart" type="datetime-local" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Başvuru Bitiş *</label>
            <input v-model="form.applicationEnd" type="datetime-local" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Konu Açıklanma *</label>
            <input v-model="form.topicRevealAt" type="datetime-local" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Gönderim Başlangıç *</label>
            <input v-model="form.submissionStart" type="datetime-local" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Gönderim Bitiş *</label>
            <input v-model="form.submissionEnd" type="datetime-local" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Oylama Başlangıç</label>
            <input v-model="form.judgingStart" type="datetime-local" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Oylama Bitiş</label>
            <input v-model="form.judgingEnd" type="datetime-local" class="form-input" />
          </div>
        </div>
      </div>

      <!-- STEP 2: Kurallar & Ödüller -->
      <div v-show="step === 2" class="form-section">
        <h2 class="section-title">Kurallar & Ödüller</h2>

        <div class="form-group">
          <label class="form-label">Konu / Tema</label>
          <input v-model="form.topic" type="text" class="form-input" placeholder="Örn: 'Retro Gelecek' veya sonra açıklanacak" />
          <span class="form-hint">Boş bırakırsanız konu açıklanma tarihinde yayınlanır</span>
        </div>

        <div class="form-group">
          <label class="form-label">Kurallar *</label>
          <textarea v-model="form.rules" class="form-textarea" rows="6" placeholder="Yarışma kurallarını yazın...&#10;- Her katılımcı en fazla 1 eser gönderebilir&#10;- Orijinal çalışma olmalıdır&#10;- AI kullanımı yasaktır" required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Ödüller *</label>
          <textarea v-model="form.prizes" class="form-textarea" rows="4" placeholder="🥇 1. - $500 + Premium Badge&#10;🥈 2. - $250&#10;🥉 3. - $100" required></textarea>
        </div>
      </div>

      <!-- STEP 3: Ayarlar -->
      <div v-show="step === 3" class="form-section">
        <h2 class="section-title">Yarışma Ayarları</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Maks. Katılımcı</label>
            <input v-model.number="form.maxParticipants" type="number" class="form-input" placeholder="Sınırsız" min="2" />
            <span class="form-hint">Boş = sınırsız</span>
          </div>
          <div class="form-group">
            <label class="form-label">Katılımcı Onay Modu</label>
            <div class="toggle-group">
              <button type="button" :class="['toggle-btn', form.approvalMode === 'MANUAL' && 'toggle-btn--active']"
                @click="form.approvalMode = 'MANUAL'">
                Manuel Onay
              </button>
              <button type="button" :class="['toggle-btn', form.approvalMode === 'AUTO' && 'toggle-btn--active']"
                @click="form.approvalMode = 'AUTO'">
                Otomatik Kabul
              </button>
            </div>
            <span class="form-hint">{{ form.approvalMode === 'MANUAL' ? 'Başvurular organizatör tarafından onaylanır' : 'Başvurular otomatik kabul edilir' }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Kabul Edilen Gönderim Türleri</label>
          <div class="format-grid">
            <label v-for="fmt in formatOptions" :key="fmt.value" class="format-check">
              <input type="checkbox" :value="fmt.value" v-model="form.allowedFormats" />
              <span>{{ fmt.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- STEP 4: Özet -->
      <div v-show="step === 4" class="form-section">
        <h2 class="section-title">Yarışma Özeti</h2>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">Yarışma Adı</span>
            <span class="summary-value">{{ form.title || '—' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Kategori</span>
            <span class="summary-value">{{ categories.find(c => c.value === form.category)?.label || '—' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Başvuru</span>
            <span class="summary-value">{{ formatDateShort(form.applicationStart) }} → {{ formatDateShort(form.applicationEnd) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Gönderim</span>
            <span class="summary-value">{{ formatDateShort(form.submissionStart) }} → {{ formatDateShort(form.submissionEnd) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Oylama</span>
            <span class="summary-value">{{ formatDateShort(form.judgingStart) }} → {{ formatDateShort(form.judgingEnd) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Katılımcı Onay</span>
            <span class="summary-value">{{ form.approvalMode === 'MANUAL' ? 'Manuel' : 'Otomatik' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Maks. Katılımcı</span>
            <span class="summary-value">{{ form.maxParticipants || 'Sınırsız' }}</span>
          </div>
        </div>

        <div class="submit-notice">
          <p>Yarışmanız oluşturulduktan sonra admin onayına gönderilecektir. Onaylandığında başvurular başlayacaktır.</p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="form-nav">
        <button v-if="step > 0" type="button" class="btn btn--secondary" @click="step--">
          ← Geri
        </button>
        <div class="nav-spacer"></div>
        <button v-if="step < steps.length - 1" type="button" class="btn btn--primary" @click="nextStep">
          İleri →
        </button>
        <button v-if="step === steps.length - 1" type="submit" class="btn btn--submit" :disabled="submitting">
          {{ submitting ? 'Gönderiliyor...' : '🚀 Yarışmayı Oluştur' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { showToast } from '@/composables/useToast';

const router = useRouter();
const step = ref(0);
const submitting = ref(false);
const steps = ['Temel Bilgiler', 'Tarihler', 'Kurallar & Ödüller', 'Ayarlar', 'Özet & Gönder'];

const categories = [
  { value: 'game_jam', label: 'Game Jam', icon: '🎮' },
  { value: 'art_contest', label: 'Art Contest', icon: '🎨' },
  { value: 'music_contest', label: 'Müzik', icon: '🎵' },
  { value: 'hackathon', label: 'Hackathon', icon: '💻' },
  { value: 'design', label: 'Tasarım', icon: '✏️' },
  { value: 'other', label: 'Diğer', icon: '📦' },
];

const formatOptions = [
  { value: 'image', label: '🖼️ Görsel (PNG, JPG)' },
  { value: 'video', label: '🎬 Video (MP4)' },
  { value: 'audio', label: '🎵 Ses (MP3, WAV)' },
  { value: 'document', label: '📄 Doküman (PDF)' },
  { value: 'archive', label: '📦 Arşiv (ZIP, RAR)' },
  { value: 'link', label: '🔗 Link (Drive, Web)' },
];

const form = ref({
  title: '',
  description: '',
  category: 'art_contest',
  coverImage: '',
  applicationStart: '',
  applicationEnd: '',
  topicRevealAt: '',
  submissionStart: '',
  submissionEnd: '',
  judgingStart: '',
  judgingEnd: '',
  topic: '',
  rules: '',
  prizes: '',
  maxParticipants: null as number | null,
  approvalMode: 'MANUAL',
  allowedFormats: ['image', 'link'] as string[],
});

// Timeline visual
const timelinePhases = computed(() => [
  { key: 'app', label: 'Başvuru', start: form.value.applicationStart, end: form.value.applicationEnd, color: 'dot-blue' },
  { key: 'reveal', label: 'Konu Açıklanma', start: form.value.topicRevealAt, end: form.value.topicRevealAt, color: 'dot-yellow' },
  { key: 'sub', label: 'Gönderim', start: form.value.submissionStart, end: form.value.submissionEnd, color: 'dot-green' },
  { key: 'judge', label: 'Oylama', start: form.value.judgingStart, end: form.value.judgingEnd, color: 'dot-purple' },
]);

function nextStep() {
  if (step.value === 0 && (!form.value.title || !form.value.description)) {
    showToast('Yarışma adı ve açıklama zorunludur', 'error');
    return;
  }
  if (step.value === 1 && (!form.value.applicationStart || !form.value.applicationEnd || !form.value.submissionEnd)) {
    showToast('Başvuru ve gönderim tarihleri zorunludur', 'error');
    return;
  }
  if (step.value === 2 && (!form.value.rules || !form.value.prizes)) {
    showToast('Kurallar ve ödüller zorunludur', 'error');
    return;
  }
  step.value++;
}

async function handleSubmit() {
  submitting.value = true;
  try {
    const payload: any = {
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      coverImage: form.value.coverImage || undefined,
      applicationStart: new Date(form.value.applicationStart).toISOString(),
      applicationEnd: new Date(form.value.applicationEnd).toISOString(),
      topicRevealAt: form.value.topicRevealAt ? new Date(form.value.topicRevealAt).toISOString() : undefined,
      submissionStart: form.value.submissionStart ? new Date(form.value.submissionStart).toISOString() : undefined,
      submissionEnd: new Date(form.value.submissionEnd).toISOString(),
      judgingStart: form.value.judgingStart ? new Date(form.value.judgingStart).toISOString() : undefined,
      judgingEnd: form.value.judgingEnd ? new Date(form.value.judgingEnd).toISOString() : undefined,
      topic: form.value.topic || undefined,
      rules: form.value.rules,
      prizes: form.value.prizes,
      maxParticipants: form.value.maxParticipants || undefined,
      approvalMode: form.value.approvalMode,
      allowedFormats: form.value.allowedFormats,
    };

    const { data } = await axios.post('/api/contests', payload);
    showToast('Yarışma oluşturuldu! Admin onayı bekleniyor.', 'success');
    router.push(`/contests/${data.slug}`);
  } catch (e: any) {
    showToast(e.response?.data?.message || 'Yarışma oluşturulamadı', 'error');
  } finally {
    submitting.value = false;
  }
}

function formatDateShort(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.contest-create { max-width: 800px; margin: 0 auto; }

.page-header { margin-bottom: 2rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); }
.page-subtitle { color: hsl(var(--muted-foreground)); margin-top: 0.25rem; }

/* Stepper */
.stepper { display: flex; gap: 0.5rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem; }

.step {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; border-radius: 9999px;
  font-size: 0.8rem; font-weight: 500; cursor: pointer;
  background: hsl(var(--muted)); color: hsl(var(--muted-foreground));
  white-space: nowrap; transition: all 0.2s;
}

.step:hover { background: hsl(var(--border)); }
.step--active { background: hsl(var(--brand)); color: white; }
.step--done { background: #d1fae5; color: #065f46; }

.step-number {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700;
  background: rgba(255,255,255,0.2);
}

.step--active .step-number { background: rgba(255,255,255,0.3); }
.step--done .step-number { background: #059669; color: white; }

/* Form */
.form-container {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 16px; padding: 2rem;
}

.form-section { min-height: 300px; }

.section-title { font-size: 1.2rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.5rem; }
.section-desc { color: hsl(var(--muted-foreground)); font-size: 0.85rem; margin-bottom: 1.5rem; }

.form-group { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.4rem; }
.form-hint { font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-top: 0.25rem; display: block; }

.form-input, .form-textarea {
  width: 100%; padding: 0.65rem 0.85rem;
  border: 1px solid hsl(var(--border)); border-radius: 8px;
  background: hsl(var(--background)); color: hsl(var(--foreground));
  font-size: 0.9rem; transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none; border-color: hsl(var(--brand));
  box-shadow: 0 0 0 3px hsl(var(--brand) / 0.1);
}

.form-textarea { resize: vertical; font-family: inherit; }

/* Category grid */
.category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

.category-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.35rem; padding: 0.75rem; border: 2px solid hsl(var(--border));
  border-radius: 12px; background: hsl(var(--background));
  cursor: pointer; transition: all 0.2s;
}

.category-card:hover { border-color: hsl(var(--brand)); }
.category-card--selected { border-color: hsl(var(--brand)); background: hsl(var(--brand) / 0.05); }
.category-icon { font-size: 1.5rem; }
.category-name { font-size: 0.8rem; font-weight: 500; color: hsl(var(--foreground)); }

/* Cover preview */
.cover-preview { margin-top: 0.5rem; border-radius: 8px; overflow: hidden; max-height: 200px; }
.cover-preview img { width: 100%; height: 200px; object-fit: cover; }

/* Date grid */
.date-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

/* Timeline visual */
.timeline-visual {
  display: flex; gap: 1rem; margin-bottom: 1.5rem;
  padding: 1rem; background: hsl(var(--muted)); border-radius: 12px;
  overflow-x: auto;
}

.timeline-phase { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; }
.timeline-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot-blue { background: #3b82f6; }
.dot-yellow { background: #f59e0b; }
.dot-green { background: #10b981; }
.dot-purple { background: hsl(var(--brand)); }

.timeline-info { min-width: 0; }
.timeline-label { display: block; font-size: 0.75rem; font-weight: 600; color: hsl(var(--foreground)); }
.timeline-date { display: block; font-size: 0.65rem; color: hsl(var(--muted-foreground)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Form row */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

/* Toggle group */
.toggle-group { display: flex; gap: 0.25rem; background: hsl(var(--muted)); border-radius: 8px; padding: 0.25rem; }

.toggle-btn {
  flex: 1; padding: 0.5rem; border: none; border-radius: 6px;
  background: transparent; color: hsl(var(--muted-foreground));
  font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
}

.toggle-btn--active { background: hsl(var(--background)); color: hsl(var(--foreground)); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

/* Format grid */
.format-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

.format-check {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; border: 1px solid hsl(var(--border));
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
  font-size: 0.85rem; color: hsl(var(--foreground));
}

.format-check:hover { border-color: hsl(var(--brand)); }
.format-check input[type="checkbox"] { accent-color: hsl(var(--brand)); }

/* Summary */
.summary-card {
  border: 1px solid hsl(var(--border)); border-radius: 12px;
  overflow: hidden; margin-bottom: 1.5rem;
}

.summary-row {
  display: flex; justify-content: space-between; padding: 0.75rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
}

.summary-row:last-child { border-bottom: none; }
.summary-row:nth-child(even) { background: hsl(var(--muted) / 0.5); }
.summary-label { font-size: 0.85rem; color: hsl(var(--muted-foreground)); }
.summary-value { font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); }

.submit-notice {
  padding: 1rem; background: hsl(var(--brand) / 0.05);
  border: 1px solid hsl(var(--brand) / 0.2); border-radius: 8px;
  color: hsl(var(--foreground)); font-size: 0.85rem;
}

/* Navigation */
.form-nav {
  display: flex; align-items: center; margin-top: 2rem;
  padding-top: 1.5rem; border-top: 1px solid hsl(var(--border));
}

.nav-spacer { flex: 1; }

.btn {
  padding: 0.65rem 1.5rem; border: none; border-radius: 8px;
  font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}

.btn--primary { background: hsl(var(--brand)); color: white; }
.btn--primary:hover { opacity: 0.9; }
.btn--secondary { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.btn--secondary:hover { background: hsl(var(--border)); }
.btn--submit { background: #059669; color: white; font-size: 0.95rem; }
.btn--submit:hover { background: #047857; }
.btn--submit:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
  .category-grid { grid-template-columns: repeat(2, 1fr); }
  .date-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .format-grid { grid-template-columns: 1fr; }
  .stepper { gap: 0.25rem; }
  .step-label { display: none; }
}
</style>