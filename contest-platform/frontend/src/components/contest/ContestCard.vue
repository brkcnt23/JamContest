<template>
  <div class="contest-card">
    <!-- Cover Image -->
    <div v-if="contest.coverImage" class="contest-cover">
      <img :src="contest.coverImage" :alt="contest.title" />
    </div>
    <div v-else class="contest-cover-empty">
      <Trophy :size="32" />
    </div>

    <div class="contest-content">
      <!-- Title -->
      <router-link :to="`/contests/${contest.slug}`" class="contest-title-link">
        <h3 class="contest-title">{{ contest.title }}</h3>
      </router-link>

      <!-- Description -->
      <p v-if="contest.description" class="contest-description">
        {{ truncateText(contest.description, 100) }}
      </p>

      <!-- Stats -->
      <div class="contest-stats">
        <div class="stat">
          <Users :size="14" />
          <span>{{ contest._count?.applications || 0 }} başvuru</span>
        </div>
        <div class="stat">
          <FileText :size="14" />
          <span>{{ contest._count?.submissions || 0 }} gönderim</span>
        </div>
      </div>

      <!-- Status Badge -->
      <div class="contest-footer">
        <span :class="['status-badge', `status-badge--${contest.status?.toLowerCase()}`]">
          {{ formatStatus(contest.status) }}
        </span>

        <!-- Share Buttons -->
        <div class="share-buttons">
          <button 
            @click="copyLink"
            :title="linkCopied ? 'Kopyalandı!' : 'Linki kopyala'"
            :class="['share-btn', linkCopied && 'share-btn--copied']"
          >
            <Share2 :size="16" />
          </button>
          <a 
            :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(contestLink)}&text=${encodeURIComponent('Yarışmaya katıl: ' + contest.title)}`"
            target="_blank"
            rel="noopener noreferrer"
            class="share-btn"
            title="Twitter'da paylaş"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9 0 11-4s1-6.75 0-9c1.21 1.02 2 2.475 2 4.09"></path>
            </svg>
          </a>
          <a 
            href="#"
            @click.prevent="shareViaEmail"
            class="share-btn"
            title="E-mail ile paylaş"
          >
            <Mail :size="16" />
          </a>
        </div>
      </div>

      <!-- View Button -->
      <router-link :to="`/contests/${contest.slug}`" class="view-button">
        Detayları Gör →
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from '@/composables/useToast';
import { Trophy, Users, FileText, Share2, Mail } from 'lucide-vue-next';

interface ContestCardProps {
  contest: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    coverImage?: string;
    status: string;
    _count?: {
      applications: number;
      submissions: number;
    };
  };
}

defineProps<ContestCardProps>();
const { showToast } = useToast();
const linkCopied = ref(false);

const contestLink = computed(() => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/contests/${contest.slug}`;
  }
  return '';
});

function truncateText(text: string, length: number): string {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: '📝 Taslak',
    PENDING_APPROVAL: '⏳ Onay Beklemede',
    APPROVED: '✅ Onaylandı',
    APPLICATIONS: '📋 Başvurular Açık',
    ACTIVE: '🎯 Aktif',
    SUBMISSION_CLOSED: '📦 Gönderim Kapandı',
    JUDGING: '⚖️ Oylama Aşaması',
    FINALIZED: '🏆 Tamamlandı',
    COMPLETED: '✨ Bitmiş',
    CANCELLED: '❌ İptal Edilmiş',
    REJECTED: '🚫 Reddedildi',
  };
  return statusMap[status] || status;
}

function copyLink() {
  navigator.clipboard.writeText(contestLink.value);
  linkCopied.value = true;
  showToast('Link kopyalandı!', 'success');
  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
}

function shareViaEmail() {
  const subject = encodeURIComponent(`Yarışmaya Katıl: ${contest.title}`);
  const body = encodeURIComponent(`Bugün katıl: ${contestLink.value}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

const { contest } = defineProps<ContestCardProps>();
const { computed } = require('vue');
</script>

<style scoped>
.contest-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.contest-card:hover {
  border-color: hsl(var(--brand));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.contest-cover {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand) / 0.7) 100%);
}

.contest-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contest-cover-empty {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand) / 0.7) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0.6;
}

.contest-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contest-title-link {
  text-decoration: none;
  color: inherit;
}

.contest-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: hsl(var(--foreground));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.contest-title:hover {
  color: hsl(var(--brand));
}

.contest-description {
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground));
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.contest-stats {
  display: flex;
  gap: 1rem;
  margin: 0.75rem 0;
  padding: 0.75rem 0;
  border-top: 1px solid hsl(var(--border));
  border-bottom: 1px solid hsl(var(--border));
  flex: 1;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
}

.stat svg {
  color: hsl(var(--brand));
}

.contest-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
  margin: 0.75rem 0;
}

.status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge--draft {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.status-badge--pending_approval {
  background: #fef3c7;
  color: #92400e;
}

.status-badge--approved,
.status-badge--active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge--finalized,
.status-badge--completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge--cancelled,
.status-badge--rejected {
  background: #fee2e2;
  color: #991b1b;
}

.share-buttons {
  display: flex;
  gap: 0.4rem;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.share-btn:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border-color: hsl(var(--brand));
}

.share-btn--copied {
  background: #d1fae5;
  color: #065f46;
  border-color: #d1fae5;
}

.view-button {
  display: block;
  text-align: center;
  padding: 0.75rem;
  background: hsl(var(--brand));
  color: white;
  border-radius: calc(var(--radius) / 2);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: auto;
}

.view-button:hover {
  background: hsl(var(--brand) / 0.9);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .contest-cover {
    height: 120px;
  }

  .contest-content {
    padding: 0.75rem;
  }

  .contest-title {
    font-size: 1rem;
  }

  .share-buttons {
    gap: 0.3rem;
  }

  .share-btn {
    width: 28px;
    height: 28px;
  }
}
</style>
