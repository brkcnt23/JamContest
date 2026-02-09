<template>
    <div class="home">
        <section class="hero">
            <div class="container">
                <h1>Welcome to Contest Platform</h1>
                <p>Showcase your talent, compete with the best, and win amazing prizes</p>
                <div class="cta-buttons" v-if="!authStore.isAuthenticated">
                    <router-link to="/register" class="btn-large btn-primary">Get Started</router-link>
                    <router-link to="/contests" class="btn-large btn-secondary">Browse Contests</router-link>
                </div>
            </div>
        </section>

        <section class="contests-section">
            <div class="container">
                <h2>Active Contests</h2>
                <div v-if="loading" class="loading">Loading contests...</div>
                <div v-else-if="contests.length === 0" class="empty">
                    <p>No active contests at the moment. Check back soon!</p>
                </div>
                <div v-else class="contest-grid">
                    <div v-for="contest in contests" :key="contest.id" class="contest-card">
                        <div class="contest-status">{{ contest.status }}</div>
                        <h3>{{ contest.title }}</h3>
                        <p class="contest-desc">{{ contest.description }}</p>
                        <div class="contest-dates">
                            <span>Applications: {{ formatDate(contest.applicationStart) }} - {{
                                formatDate(contest.applicationEnd) }}</span>
                        </div>
                        <router-link :to="`/contests/${contest.slug}`" class="btn-view">View Details</router-link>
                    </div>
                </div>
            </div>
        </section>

        <section class="mission-statement">
            <div class="container">
                <div class="mission-box">
                    <h2>Our Mission</h2>
                    <p class="lead">
                        This platform operates on a <strong>volunteer basis</strong> and is <strong>completely
                            non-profit</strong>.
                        Our goal is simple: help developers and artists come together, form teams, and ship real
                        products.
                    </p>
                    <p>
                        Every contest features <strong>transparent judging</strong> by publicly listed jury members.
                        No hidden scores, no black boxes—just honest feedback from experienced professionals.
                    </p>
                    <p>
                        Winners don't just get trophies. They get <strong>real value</strong>: mentorship, guidance on
                        taking
                        their product to market, and support throughout the development process. We're here to turn your
                        ideas
                        into something people can actually use.
                    </p>
                    <p class="motto">
                        <em>No corporate BS. No fake communities. Just people building real things together.</em>
                    </p>
                </div>
            </div>
        </section>

        <section class="features">
            <div class="container">
                <h2>Why Join Us?</h2>
                <div class="features-grid">
                    <div class="feature">
                        <div class="icon">🏆</div>
                        <h3>Compete & Win</h3>
                        <p>Participate in exciting contests and win amazing prizes</p>
                    </div>
                    <div class="feature">
                        <div class="icon">👥</div>
                        <h3>Build Portfolio</h3>
                        <p>Showcase your work and build a professional portfolio</p>
                    </div>
                    <div class="feature">
                        <div class="icon">⚖️</div>
                        <h3>Fair Judging</h3>
                        <p>Expert jury panel ensures fair and transparent evaluation</p>
                    </div>
                    <div class="feature">
                        <div class="icon">📈</div>
                        <h3>Grow Skills</h3>
                        <p>Learn from feedback and improve your craft</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
const contests = ref([]);
const loading = ref(true);

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fetchContests = async () => {
    try {
        // Şimdilik boş - backend endpoint henüz yok
        contests.value = [];
    } catch (error) {
        console.error('Failed to fetch contests:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchContests();
});
</script>

<style scoped>
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 100px 0;
    text-align: center;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 700;
}

.hero p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-large {
    padding: 14px 32px;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s;
}

.btn-primary {
    background: white;
    color: #667eea;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.btn-secondary:hover {
    background: white;
    color: #667eea;
}

.contests-section {
    padding: 60px 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #2c3e50;
}

.loading,
.empty {
    text-align: center;
    padding: 40px;
    color: #7f8c8d;
}

.contest-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}

.contest-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
}

.contest-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.contest-status {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #3498db;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.contest-card h3 {
    margin-bottom: 0.5rem;
    color: #2c3e50;
    font-size: 1.25rem;
}

.contest-desc {
    color: #7f8c8d;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.contest-dates {
    font-size: 0.875rem;
    color: #95a5a6;
    margin-bottom: 1rem;
}

.btn-view {
    display: inline-block;
    padding: 8px 16px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background 0.2s;
}

.btn-view:hover {
    background: #2980b9;
}

.features {
    background: white;
    padding: 60px 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature {
    text-align: center;
    padding: 20px;
}

.icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.feature p {
    color: #7f8c8d;
    line-height: 1.6;
}
.mission-statement {
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mission-box {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.mission-box h2 {
  color: white;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.mission-box p {
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  opacity: 0.95;
}

.mission-box .lead {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.mission-box strong {
  font-weight: 700;
  color: #ffd700;
}

.motto {
  font-size: 1.3rem;
  font-style: italic;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(255,255,255,0.3);
  opacity: 1 !important;
}
@media (max-width: 768px) {
    .hero h1 {
        font-size: 2rem;
    }

    .cta-buttons {
        flex-direction: column;
    }

    .contest-grid,
    .features-grid {
        grid-template-columns: 1fr;
    }
}
</style>