<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Trophy, Users, Award, TrendingUp, ArrowRight, Sparkles } from 'lucide-vue-next';

const router = useRouter();

interface Contest {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  participantCount?: number;
  status: string;
}

const featuredContests = ref<Contest[]>([]);
const stats = ref({
  totalContests: 0,
  activeArtists: 0,
  awardsGiven: 0,
  submissions: 0,
});

onMounted(async () => {
  // Mock data - replace with API calls
  featuredContests.value = [
    {
      id: '1',
      title: 'Fantasy Character Design',
      description: 'Create an original fantasy character with unique magical abilities',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      participantCount: 45,
      status: 'ACTIVE',
    },
    {
      id: '2',
      title: 'Cyberpunk Environment',
      description: 'Design a futuristic cityscape with neon lights and advanced technology',
      imageUrl: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519',
      startDate: '2024-02-05',
      endDate: '2024-03-05',
      participantCount: 38,
      status: 'ACTIVE',
    },
    {
      id: '3',
      title: 'Minimalist Logo Challenge',
      description: 'Create a clean, impactful logo using only 3 colors',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
      startDate: '2024-02-10',
      endDate: '2024-03-10',
      participantCount: 62,
      status: 'ACTIVE',
    },
  ];

  stats.value = {
    totalContests: 127,
    activeArtists: 1840,
    awardsGiven: 342,
    submissions: 5420,
  };
});

const navigateToContests = () => {
  router.push('/contests');
};
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <Sparkles class="w-4 h-4" />
          <span>Join the Creative Revolution</span>
        </div>

        <h1 class="hero-title">
          Compete. Create. <span class="hero-title-gradient">Conquer.</span>
        </h1>

        <p class="hero-description">
          Join thousands of artists in creative challenges. Showcase your talent,
          win prizes, and build your portfolio with JamContest.
        </p>

        <div class="hero-actions">
          <button @click="navigateToContests" class="btn-primary">
            Browse Contests
            <ArrowRight class="w-5 h-5" />
          </button>
          <button @click="$router.push('/register')" class="btn-secondary">
            Get Started Free
          </button>
        </div>

        <!-- Stats Row -->
        <div class="hero-stats">
          <div class="stat-item">
            <Trophy class="stat-icon" />
            <div class="stat-content">
              <p class="stat-number">{{ stats.totalContests }}+</p>
              <p class="stat-label">Active Contests</p>
            </div>
          </div>
          <div class="stat-item">
            <Users class="stat-icon" />
            <div class="stat-content">
              <p class="stat-number">{{ stats.activeArtists.toLocaleString() }}+</p>
              <p class="stat-label">Creative Artists</p>
            </div>
          </div>
          <div class="stat-item">
            <Award class="stat-icon" />
            <div class="stat-content">
              <p class="stat-number">{{ stats.awardsGiven }}+</p>
              <p class="stat-label">Awards Given</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Contests -->
    <section class="contests-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Featured Contests</h2>
          <p class="section-subtitle">Join the most popular creative challenges</p>
        </div>
        <button @click="navigateToContests" class="view-all-btn">
          View All
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <div class="contests-grid">
        <div
          v-for="contest in featuredContests"
          :key="contest.id"
          class="contest-card"
          @click="$router.push(`/contests/${contest.id}`)"
        >
          <div class="contest-image">
            <img :src="contest.imageUrl" :alt="contest.title" />
            <div class="contest-badge">
              <TrendingUp class="w-4 h-4" />
              <span>Trending</span>
            </div>
          </div>

          <div class="contest-body">
            <h3 class="contest-title">{{ contest.title }}</h3>
            <p class="contest-description">{{ contest.description }}</p>

            <div class="contest-meta">
              <div class="meta-item">
                <Users class="w-4 h-4" />
                <span>{{ contest.participantCount }} joined</span>
              </div>
              <div class="meta-item">
                <Trophy class="w-4 h-4" />
                <span>Active</span>
              </div>
            </div>

            <button class="contest-btn">
              Join Contest
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <h2 class="section-title">How It Works</h2>
      <p class="section-subtitle">Start your creative journey in 3 simple steps</p>

      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3 class="step-title">Choose a Contest</h3>
          <p class="step-description">
            Browse through various creative challenges across different categories
          </p>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <h3 class="step-title">Create & Submit</h3>
          <p class="step-description">
            Unleash your creativity and submit your best work before the deadline
          </p>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <h3 class="step-title">Win Prizes</h3>
          <p class="step-description">
            Get judged by professionals and win amazing prizes and recognition
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: hsl(var(--background));
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: float 25s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: hsl(var(--accent-purple));
  top: -10%;
  left: -5%;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: hsl(var(--accent-coral));
  bottom: -10%;
  right: -5%;
  animation-delay: 8s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: hsl(var(--accent-teal));
  top: 40%;
  right: 20%;
  animation-delay: 16s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -50px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: hsl(var(--muted));
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 2rem;
  border: 1px solid hsl(var(--border));
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: hsl(var(--foreground));
}

.hero-title-gradient {
  background: linear-gradient(
    135deg,
    hsl(var(--accent-purple)),
    hsl(var(--accent-coral)),
    hsl(var(--accent-teal))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  color: hsl(var(--muted-foreground));
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: hsl(var(--brand));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: hsl(var(--brand-dark));
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px hsl(var(--brand) / 0.3);
}

.btn-secondary {
  padding: 1rem 2rem;
  background: transparent;
  color: hsl(var(--foreground));
  border: 2px solid hsl(var(--border));
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: hsl(var(--muted));
  border-color: hsl(var(--foreground));
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  padding: 0.75rem;
  background: hsl(var(--muted));
  border-radius: 12px;
  color: hsl(var(--brand));
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

/* Contests Section */
.contests-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: hsl(var(--brand));
  border: 2px solid hsl(var(--brand));
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: hsl(var(--brand));
  color: white;
}

.contests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.contest-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contest-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.2);
  border-color: hsl(var(--brand));
}

.contest-image {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.contest-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.contest-card:hover .contest-image img {
  transform: scale(1.05);
}

.contest-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--brand));
}

.contest-body {
  padding: 1.5rem;
}

.contest-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.75rem;
}

.contest-description {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.contest-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.contest-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: hsl(var(--brand));
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contest-btn:hover {
  background: hsl(var(--brand-dark));
}

/* How It Works */
.how-it-works {
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem;
  text-align: center;
  background: hsl(var(--muted));
  border-radius: 24px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.step-card {
  padding: 2rem;
  background: hsl(var(--background));
  border-radius: 16px;
  border: 1px solid hsl(var(--border));
}

.step-number {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  background: hsl(var(--brand));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: hsl(var(--foreground));
}

.step-description {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
}

/* Mobile */
@media (max-width: 768px) {
  .hero-section {
    min-height: auto;
    padding: 4rem 1rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .contests-grid {
    grid-template-columns: 1fr;
  }
}
</style>