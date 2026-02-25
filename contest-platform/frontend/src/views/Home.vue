<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ParticleBackground from '@/components/ui/ParticleBackground.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { Trophy, Users, Award, FileText, TrendingUp, ArrowRight, Sparkles, Calendar, ChevronRight } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

interface Contest {
  id: string;
  title: string;
  description?: string;
  slug: string;
  category: string;
  status: string;
  coverImage?: string;
  applicationEnd?: string;
  submissionEnd?: string;
  createdBy: { id: string; username: string; displayName?: string };
  _count: { applications: number; submissions: number };
}

const featuredContests = ref<Contest[]>([]);
const stats = ref({ totalContests: 0, activeContests: 0, totalUsers: 0, totalSubmissions: 0 });
const loading = ref(true);

const categoryIcon: Record<string, string> = {
  game_jam: '🎮', art_contest: '🎨', music_contest: '🎵',
  hackathon: '💻', design: '✏️', other: '📦',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  APPLICATIONS:      { label: 'Başvuru Açık',  color: '#3b82f6' },
  ACTIVE:            { label: 'Aktif',          color: '#8b5cf6' },
  SUBMISSION_CLOSED: { label: 'Gönderim Kapandı', color: '#f59e0b' },
  JUDGING:           { label: 'Değerlendirme',  color: '#ec4899' },
  APPROVED:          { label: 'Onaylandı',      color: '#10b981' },
};

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function deadlineText(contest: Contest): string | null {
  if (['APPLICATIONS'].includes(contest.status) && contest.applicationEnd) {
    return `Başvuru: ${formatDate(contest.applicationEnd)}`;
  }
  if (['ACTIVE', 'SUBMISSION_CLOSED'].includes(contest.status) && contest.submissionEnd) {
    return `Son gönderim: ${formatDate(contest.submissionEnd)}`;
  }
  return null;
}

onMounted(async () => {
  try {
    const [contestsRes, statsRes] = await Promise.allSettled([
      axios.get('/api/contests'),
      axios.get('/api/social/stats'),
    ]);

    if (contestsRes.status === 'fulfilled') {
      const all: Contest[] = contestsRes.value.data;
      // featured = active/applications contests, max 6
      featuredContests.value = all
        .filter(c => ['APPLICATIONS', 'ACTIVE', 'JUDGING', 'SUBMISSION_CLOSED'].includes(c.status))
        .slice(0, 6);
    }

    if (statsRes.status === 'fulfilled') {
      const d = statsRes.value.data;
      stats.value = {
        totalContests:    d.totalContests    ?? 0,
        activeContests:   d.activeContests   ?? 0,
        totalUsers:       d.totalUsers       ?? 0,
        totalSubmissions: d.totalSubmissions ?? 0,
      };
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="home-page">
    <ParticleBackground />

    <!-- ── HERO ── -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="gradient-orb orb-1" />
        <div class="gradient-orb orb-2" />
        <div class="gradient-orb orb-3" />
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <Sparkles class="w-4 h-4" />
          <span>Yaratıcılığını yarışmaya taşı</span>
        </div>

        <h1 class="hero-title">
          Yarış. Yarat. <span class="hero-title-gradient">Kazan.</span>
        </h1>

        <p class="hero-description">
          JamContest'te sanatçılar, geliştiriciler ve tasarımcılar
          birbirinin en iyi işini görür, jüriler değerlendirir, kazananlar parlar.
        </p>

        <div class="hero-actions">
          <button @click="router.push('/contests')" class="btn-primary">
            Yarışmalara Göz At <ArrowRight class="w-5 h-5" />
          </button>
          <button
            v-if="!authStore.isAuthenticated"
            @click="router.push('/register')"
            class="btn-secondary"
          >
            Ücretsiz Kayıt Ol
          </button>
          <button v-else @click="router.push('/social')" class="btn-secondary">
            Feed'e Git
          </button>
        </div>

        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat-item">
            <Trophy class="stat-icon" />
            <div>
              <p class="stat-number">{{ stats.totalContests }}</p>
              <p class="stat-label">Toplam Yarışma</p>
            </div>
          </div>
          <div class="stat-item">
            <TrendingUp class="stat-icon" />
            <div>
              <p class="stat-number">{{ stats.activeContests }}</p>
              <p class="stat-label">Aktif Yarışma</p>
            </div>
          </div>
          <div class="stat-item">
            <Users class="stat-icon" />
            <div>
              <p class="stat-number">{{ stats.totalUsers.toLocaleString() }}</p>
              <p class="stat-label">Sanatçı</p>
            </div>
          </div>
          <div class="stat-item">
            <FileText class="stat-icon" />
            <div>
              <p class="stat-number">{{ stats.totalSubmissions.toLocaleString() }}</p>
              <p class="stat-label">Gönderim</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FEATURED CONTESTS ── -->
    <section class="contests-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Aktif Yarışmalar</h2>
          <p class="section-subtitle">Şu an katılabileceğiniz yaratıcı meydan okumalar</p>
        </div>
        <button @click="router.push('/contests')" class="view-all-btn">
          Tümünü Gör <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="contests-grid">
        <div v-for="i in 6" :key="i" class="contest-card skeleton" />
      </div>

      <!-- Empty -->
      <div v-else-if="featuredContests.length === 0" class="no-contests">
        <Trophy class="w-12 h-12" />
        <p>Henüz aktif yarışma yok</p>
        <button @click="router.push('/contests')" class="btn-primary btn-sm">Tüm Yarışmalar</button>
      </div>

      <!-- Grid -->
      <div v-else class="contests-grid">
        <div
          v-for="contest in featuredContests"
          :key="contest.id"
          class="contest-card"
          @click="router.push(`/contests/${contest.slug}`)"
        >
          <!-- Cover -->
          <div
            class="contest-image"
            :style="contest.coverImage ? `background-image:url(${contest.coverImage})` : ''"
          >
            <div class="contest-image-overlay" />
            <div class="contest-badges">
              <span class="cat-badge">{{ categoryIcon[contest.category] ?? '📦' }}</span>
              <span
                class="status-badge"
                :style="{ background: (statusConfig[contest.status]?.color ?? '#6b7280') + '33', color: statusConfig[contest.status]?.color ?? '#6b7280' }"
              >{{ statusConfig[contest.status]?.label ?? contest.status }}</span>
            </div>
          </div>

          <!-- Body -->
          <div class="contest-body">
            <h3 class="contest-title">{{ contest.title }}</h3>
            <p v-if="contest.description" class="contest-description">
              {{ contest.description.substring(0, 100) }}{{ contest.description.length > 100 ? '…' : '' }}
            </p>

            <div class="contest-meta">
              <span class="meta-item">
                <Users class="w-3.5 h-3.5" /> {{ contest._count.applications }} başvuru
              </span>
              <span class="meta-item">
                <Award class="w-3.5 h-3.5" /> {{ contest._count.submissions }} eser
              </span>
            </div>

            <div class="contest-footer">
              <span class="organizer">{{ contest.createdBy.displayName || contest.createdBy.username }}</span>
              <span v-if="deadlineText(contest)" class="deadline">
                <Calendar class="w-3 h-3" /> {{ deadlineText(contest) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ── -->
    <section class="how-section">
      <h2 class="section-title center">Nasıl Çalışır?</h2>
      <p class="section-subtitle center">3 adımda yaratıcı yolculuğuna başla</p>

      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3 class="step-title">Yarışma Seç</h3>
          <p class="step-desc">Farklı kategorilerdeki yaratıcı meydan okumaları incele ve ilgini çekeni seç.</p>
        </div>
        <div class="step-divider"><ChevronRight class="w-6 h-6" /></div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h3 class="step-title">Eserini Gönder</h3>
          <p class="step-desc">Yaratıcılığını ortaya koy ve son teslim tarihinden önce eserini gönder.</p>
        </div>
        <div class="step-divider"><ChevronRight class="w-6 h-6" /></div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h3 class="step-title">Ödül Kazan</h3>
          <p class="step-desc">Profesyoneller tarafından değerlendiril, ödüller ve tanınırlık kazan.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; background: hsl(var(--background)); }

/* ── HERO ── */
.hero-section {
  position: relative; min-height: 90vh;
  display: flex; align-items: center; justify-content: center;
  padding: 2rem; overflow: hidden;
}

.hero-background { position: absolute; inset: 0; z-index: 0; }
.gradient-orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; animation: float 25s infinite ease-in-out; }
.orb-1 { width: 600px; height: 600px; background: hsl(var(--accent-purple)); top: -10%; left: -5%; }
.orb-2 { width: 500px; height: 500px; background: hsl(var(--accent-coral)); bottom: -10%; right: -5%; animation-delay: 8s; }
.orb-3 { width: 400px; height: 400px; background: hsl(var(--accent-teal)); top: 40%; right: 20%; animation-delay: 16s; }
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -50px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}

.hero-content { position: relative; z-index: 1; max-width: 900px; text-align: center; }

.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; background: hsl(var(--muted)); border-radius: 9999px;
  font-size: 0.875rem; font-weight: 500; color: hsl(var(--foreground));
  margin-bottom: 2rem; border: 1px solid hsl(var(--border));
}

.hero-title { font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; color: hsl(var(--foreground)); }
.hero-title-gradient {
  background: linear-gradient(135deg, hsl(var(--accent-purple)), hsl(var(--accent-coral)), hsl(var(--accent-teal)));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.hero-description { font-size: clamp(1rem, 2vw, 1.2rem); color: hsl(var(--muted-foreground)); margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6; }

.hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 4rem; }

.btn-primary {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.875rem 1.75rem; background: hsl(var(--brand)); color: white;
  border: none; border-radius: 12px; font-size: 1rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease;
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 10px 25px -5px hsl(var(--brand) / 0.3); }
.btn-primary.btn-sm { padding: 0.5rem 1.1rem; font-size: 0.875rem; }

.btn-secondary {
  padding: 0.875rem 1.75rem; background: transparent; color: hsl(var(--foreground));
  border: 2px solid hsl(var(--border)); border-radius: 12px; font-size: 1rem;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-secondary:hover { background: hsl(var(--muted)); border-color: hsl(var(--foreground)); }

.hero-stats { display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; }
.stat-item { display: flex; align-items: center; gap: 0.75rem; }
.stat-icon { width: 40px; height: 40px; padding: 0.6rem; background: hsl(var(--muted)); border-radius: 12px; color: hsl(var(--brand)); }
.stat-number { font-size: 1.75rem; font-weight: 700; color: hsl(var(--foreground)); line-height: 1; margin-bottom: 0.2rem; }
.stat-label { font-size: 0.8rem; color: hsl(var(--muted-foreground)); }

/* ── CONTESTS ── */
.contests-section { max-width: 1300px; margin: 0 auto; padding: 5rem 2rem; }

.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; gap: 1rem; flex-wrap: wrap; }
.section-title { font-size: 2rem; font-weight: 700; color: hsl(var(--foreground)); margin-bottom: 0.4rem; }
.section-title.center { text-align: center; margin-bottom: 0.5rem; }
.section-subtitle { font-size: 1rem; color: hsl(var(--muted-foreground)); margin: 0; }
.section-subtitle.center { text-align: center; margin-bottom: 3rem; }

.view-all-btn {
  display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.25rem;
  background: transparent; color: hsl(var(--brand)); border: 2px solid hsl(var(--brand));
  border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
}
.view-all-btn:hover { background: hsl(var(--brand)); color: white; }

.no-contests { text-align: center; padding: 4rem 2rem; color: hsl(var(--muted-foreground)); display: flex; flex-direction: column; align-items: center; gap: 1rem; }

.contests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }

/* Skeleton */
.skeleton { height: 280px; background: hsl(var(--muted)); border-radius: 16px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.contest-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.25s ease; }
.contest-card:hover { transform: translateY(-6px); box-shadow: 0 20px 30px -10px hsl(var(--brand) / 0.15); border-color: hsl(var(--brand) / 0.5); }

.contest-image { height: 140px; background: hsl(var(--muted)); background-size: cover; background-position: center; position: relative; }
.contest-image-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)); }
.contest-badges { position: absolute; top: 0.75rem; left: 0.75rem; right: 0.75rem; z-index: 1; display: flex; justify-content: space-between; align-items: center; }
.cat-badge { font-size: 1.25rem; }
.status-badge { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 9999px; }

.contest-body { padding: 1rem; }
.contest-title { font-size: 0.95rem; font-weight: 700; color: hsl(var(--foreground)); margin-bottom: 0.35rem; }
.contest-description { font-size: 0.8rem; color: hsl(var(--muted-foreground)); line-height: 1.5; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.contest-meta { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
.meta-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
.contest-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid hsl(var(--border)); }
.organizer { font-size: 0.75rem; font-weight: 500; color: hsl(var(--muted-foreground)); }
.deadline { display: flex; align-items: center; gap: 0.25rem; font-size: 0.7rem; color: hsl(var(--muted-foreground)); }

/* ── HOW IT WORKS ── */
.how-section { max-width: 900px; margin: 0 auto; padding: 5rem 2rem 6rem; }
.steps-grid { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
.step-divider { color: hsl(var(--border)); flex-shrink: 0; }
.step-card { flex: 1; min-width: 200px; max-width: 240px; text-align: center; padding: 2rem 1.5rem; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 16px; }
.step-number { width: 48px; height: 48px; border-radius: 50%; background: hsl(var(--brand)); color: white; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
.step-title { font-size: 1rem; font-weight: 700; color: hsl(var(--foreground)); margin-bottom: 0.5rem; }
.step-desc { font-size: 0.825rem; color: hsl(var(--muted-foreground)); line-height: 1.6; }

@media (max-width: 640px) {
  .hero-stats { gap: 1.5rem; }
  .step-divider { display: none; }
  .steps-grid { gap: 1rem; }
}
</style>