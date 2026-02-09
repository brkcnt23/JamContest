<template>
  <div class="page">
    <div class="container">
      <h1>Contact Us</h1>
      
      <div class="contact-grid">
        <div class="contact-info">
          <h2>Get in Touch</h2>
          <p>
            Have questions, suggestions, or want to report an issue? We'd love to hear from you.
          </p>
          
          <div class="info-block">
            <h3>📧 Email</h3>
            <p><a href="mailto:contact@contestplatform.com">contact@contestplatform.com</a></p>
          </div>

          <div class="info-block">
            <h3>🐛 Report Bugs</h3>
            <p><a href="mailto:bugs@contestplatform.com">bugs@contestplatform.com</a></p>
          </div>

          <div class="info-block">
            <h3>💼 Partnerships</h3>
            <p><a href="mailto:partnerships@contestplatform.com">partnerships@contestplatform.com</a></p>
          </div>

          <div class="info-block">
            <h3>⚖️ Legal Issues</h3>
            <p><a href="mailto:legal@contestplatform.com">legal@contestplatform.com</a></p>
          </div>
        </div>

        <div class="contact-form-box">
          <h2>Send a Message</h2>
          <form @submit.prevent="handleSubmit" class="contact-form">
            <div class="form-group">
              <label>Name</label>
              <input v-model="form.name" type="text" required />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" required />
            </div>

            <div class="form-group">
              <label>Subject</label>
              <input v-model="form.subject" type="text" required />
            </div>

            <div class="form-group">
              <label>Message</label>
              <textarea v-model="form.message" rows="6" required></textarea>
            </div>

            <button type="submit" :disabled="loading">
              {{ loading ? 'Sending...' : 'Send Message' }}
            </button>

            <p v-if="success" class="success">Message sent! We'll get back to you soon.</p>
            <p v-if="error" class="error">{{ error }}</p>
          </form>
        </div>
      </div>

      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div class="faq-item">
            <h3>How do I participate in a contest?</h3>
            <p>Browse active contests, click "Apply," and submit your application before the deadline.</p>
          </div>
          <div class="faq-item">
            <h3>Is there a fee to join?</h3>
            <p>No. This platform is completely free and non-profit.</p>
          </div>
          <div class="faq-item">
            <h3>Who judges the contests?</h3>
            <p>All jury members are publicly listed on each contest page. We believe in transparency.</p>
          </div>
          <div class="faq-item">
            <h3>What are the prizes?</h3>
            <p>Winners receive mentorship, product guidance, and support bringing their projects to market.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
});

const loading = ref(false);
const success = ref(false);
const error = ref('');

const handleSubmit = async () => {
  loading.value = true;
  success.value = false;
  error.value = '';

  // Simulated - replace with actual API call
  setTimeout(() => {
    success.value = true;
    loading.value = false;
    form.value = { name: '', email: '', subject: '', message: '' };
  }, 1000);
};
</script>

<style scoped>
.page {
  padding: 60px 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 3rem;
  text-align: center;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.contact-info, .contact-form-box {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  font-size: 1.75rem;
  color: #667eea;
  margin-bottom: 1.5rem;
}

.info-block {
  margin-bottom: 1.5rem;
}

h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.info-block p {
  color: #555;
}

.info-block a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.info-block a:hover {
  text-decoration: underline;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

input, textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
}

button {
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #5568d3;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  color: #27ae60;
  font-weight: 500;
  text-align: center;
}

.error {
  color: #e74c3c;
  text-align: center;
}

.faq-section {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.faq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.faq-item h3 {
  color: #667eea;
  margin-bottom: 0.5rem;
}

.faq-item p {
  color: #555;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .contact-grid, .faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>