<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/stores/theme';
import { showToast } from '@/composables/useToast';
import { Eye, EyeOff, Mail, Lock, User, Trophy, Users, Award, Sparkles } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const { theme } = useTheme();

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errors = ref<Record<string, string>>({});

const validateForm = () => {
  errors.value = {};
  
  if (!form.value.username) {
    errors.value.username = 'Username is required';
  } else if (form.value.username.length < 3) {
    errors.value.username = 'Username must be at least 3 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.value.username)) {
    errors.value.username = 'Username can only contain letters, numbers, and underscores';
  }
  
  if (!form.value.email) {
    errors.value.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Invalid email format';
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required';
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  }
  
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password';
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleRegister = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    await authStore.register(
      form.value.username,
      form.value.email,
      form.value.password
    );
    
    showToast('Account created successfully!', 'success');
    router.push('/');
  } catch (error: any) {
    showToast(error.response?.data?.message || 'Registration failed', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <!-- Animated Background -->
    <div class="auth-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="auth-container">
      <!-- Left: Form -->
      <div class="auth-left">
        <!-- Logo -->
        <div class="auth-logo">
          <img 
            v-if="theme === 'dark'"
            src="/images/jamcontest_logo_white_for_dark.png" 
            alt="JamContest" 
            class="logo-img" 
          />
          <img 
            v-else
            src="/images/logo-JC.png" 
            alt="JamContest" 
            class="logo-img" 
          />
        </div>

        <!-- Form Card -->
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Create Account</h1>
            <p class="auth-subtitle">Join JamContest and start competing</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <!-- Username -->
            <div class="form-group">
              <label class="form-label">Username</label>
              <div class="input-wrapper">
                <User class="input-icon" />
                <input
                  v-model="form.username"
                  type="text"
                  class="form-input"
                  :class="{ 'input-error': errors.username }"
                  placeholder="Choose a username"
                  autocomplete="username"
                />
              </div>
              <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="input-wrapper">
                <Mail class="input-icon" />
                <input
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  :class="{ 'input-error': errors.email }"
                  placeholder="your@email.com"
                  autocomplete="email"
                />
              </div>
              <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <Lock class="input-icon" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'input-error': errors.password }"
                  placeholder="Create a password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="password-toggle"
                >
                  <EyeOff v-if="showPassword" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <div class="input-wrapper">
                <Lock class="input-icon" />
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'input-error': errors.confirmPassword }"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="password-toggle"
                >
                  <EyeOff v-if="showConfirmPassword" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading">Creating account...</span>
              <span v-else>Create Account</span>
            </button>

            <!-- Login Link -->
            <div class="auth-footer">
              <p class="footer-text">
                Already have an account?
                <router-link to="/login" class="footer-link">Sign in</router-link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Right: Hero -->
      <div class="auth-right">
        <div class="hero-content">
          <div class="hero-badge">
            <Sparkles class="w-4 h-4" />
            <span>Join the Creative Revolution</span>
          </div>

          <h2 class="hero-title">
            Compete. Create. <span class="hero-gradient">Conquer.</span>
          </h2>

          <p class="hero-description">
            Join thousands of artists in creative challenges. Showcase your talent, 
            win prizes, and build your portfolio.
          </p>

          <!-- Features -->
          <div class="hero-features">
            <div class="feature-item">
              <div class="feature-icon">
                <Trophy class="w-6 h-6" />
              </div>
              <div>
                <h3 class="feature-title">Win Prizes</h3>
                <p class="feature-text">Compete for amazing rewards</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <Users class="w-6 h-6" />
              </div>
              <div>
                <h3 class="feature-title">Build Community</h3>
                <p class="feature-text">Connect with fellow artists</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                <Award class="w-6 h-6" />
              </div>
              <div>
                <h3 class="feature-title">Grow Portfolio</h3>
                <p class="feature-text">Showcase your best work</p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat-card">
              <p class="stat-number">127+</p>
              <p class="stat-label">Active Contests</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">1,840+</p>
              <p class="stat-label">Creative Artists</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">342+</p>
              <p class="stat-label">Awards Given</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tüm stiller Login.vue ile aynı - kopyala */
.auth-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    hsl(var(--background)) 0%, 
    hsl(var(--muted)) 100%
  );
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
  top: -15%;
  left: -10%;
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

.auth-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 1400px;
  min-height: 100vh;
}

.auth-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  max-width: 600px;
}

.auth-logo {
  margin-bottom: 3rem;
}

.logo-img {
  height: 64px;
  width: auto;
  object-fit: contain;
  transform: scale(1.5);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: hsl(var(--background));
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid hsl(var(--border));
  backdrop-filter: blur(10px);
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: hsl(var(--muted-foreground));
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 12px;
  border: 2px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: hsl(var(--brand));
  box-shadow: 0 0 0 4px hsl(var(--brand) / 0.1);
}

.form-input.input-error {
  border-color: hsl(var(--accent-coral));
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: hsl(var(--foreground));
}

.error-message {
  font-size: 0.875rem;
  color: hsl(var(--accent-coral));
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  background: hsl(var(--brand));
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: hsl(271 91% 55%);
  transform: translateY(-1px);
  box-shadow: 0 8px 16px -4px hsl(var(--brand) / 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
}

.footer-text {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

.footer-link {
  color: hsl(var(--brand));
  font-weight: 600;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
}

.hero-content {
  max-width: 600px;
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
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: hsl(var(--foreground));
}

.hero-gradient {
  background: linear-gradient(
    135deg,
    hsl(var(--accent-purple)),
    hsl(var(--accent-coral))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.25rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  margin-bottom: 3rem;
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--brand) / 0.1);
  border-radius: 12px;
  color: hsl(var(--brand));
  flex-shrink: 0;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.25rem;
}

.feature-text {
  font-size: 0.95rem;
  color: hsl(var(--muted-foreground));
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat-card {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

@media (max-width: 1024px) {
  .auth-right {
    display: none;
  }

  .auth-left {
    max-width: 100%;
  }

  .auth-container {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .auth-left {
    padding: 2rem 1rem;
  }

  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-title {
    font-size: 1.75rem;
  }

  .logo-img {
    transform: scale(1.3);
  }
}
</style>