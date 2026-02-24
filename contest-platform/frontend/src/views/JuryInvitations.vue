<template>
  <div class="jury-invitations-container">
    <div class="page-header">
      <h1>Jüri Davetleri</h1>
      <p>Sizin için gönderilen yarışma davetlerini yönetin ve kabul edin</p>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Davetler yükleniyor...</p>
    </div>

    <div v-else-if="invitations.length === 0" class="empty-state">
      <p>Henüz jüri daveti almadınız</p>
    </div>

    <div v-else class="invitations-list">
      <div v-for="invitation in invitations" :key="invitation.id" class="invitation-card">
        <div class="invitation-header">
          <div class="contest-info">
            <h3>{{ invitation.contest.title }}</h3>
            <p class="organizer">
              <span class="label">Organizatör:</span>
              <span>{{ invitation.inviter.displayName || invitation.inviter.username }}</span>
            </p>
          </div>
          <div class="invitation-date">
            <small>{{ formatDate(invitation.createdAt) }}</small>
          </div>
        </div>

        <p class="contest-description" v-if="invitation.contest.description">
          {{ truncateText(invitation.contest.description, 150) }}
        </p>

        <div class="invitation-actions">
          <button 
            @click="acceptInvitation(invitation.id)"
            :disabled="acceptingId === invitation.id"
            class="btn-accept"
          >
            <span v-if="acceptingId === invitation.id">Kabul ediliyor...</span>
            <span v-else>✓ Kabul Et</span>
          </button>
          <button 
            @click="rejectInvitation(invitation.id)"
            :disabled="rejectingId === invitation.id"
            class="btn-reject"
          >
            <span v-if="rejectingId === invitation.id">Red ediliyor...</span>
            <span v-else>✕ Red Et</span>
          </button>
          <router-link 
            :to="`/contests/${invitation.contest.slug}`"
            class="btn-view"
          >
            Yarışmayı Gör
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from '@/composables/useToast';

interface Invitation {
  id: string;
  contestId: string;
  userId: string;
  invitedBy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  contest: {
    id: string;
    title: string;
    slug: string;
    description: string;
  };
  inviter: {
    id: string;
    username: string;
    displayName?: string;
  };
}

const invitations = ref<Invitation[]>([]);
const loading = ref(true);
const acceptingId = ref<string | null>(null);
const rejectingId = ref<string | null>(null);
const { showToast } = useToast();

onMounted(async () => {
  await loadInvitations();
});

async function loadInvitations() {
  try {
    loading.value = true;
    const { data } = await axios.get('/api/contests/jury-invitations/my');
    invitations.value = data;
  } catch (error) {
    console.error('Failed to load invitations:', error);
    showToast('Davetler yüklenirken hata oluştu', 'error');
  } finally {
    loading.value = false;
  }
}

async function acceptInvitation(invitationId: string) {
  try {
    acceptingId.value = invitationId;
    await axios.put(`/api/contests/jury-invitations/${invitationId}/accept`);
    invitations.value = invitations.value.filter(i => i.id !== invitationId);
    showToast('Davet kabul edildi!', 'success');
  } catch (error: any) {
    console.error('Failed to accept invitation:', error);
    showToast(error.response?.data?.message || 'Davet kabul edilemedi', 'error');
  } finally {
    acceptingId.value = null;
  }
}

async function rejectInvitation(invitationId: string) {
  try {
    rejectingId.value = invitationId;
    await axios.put(`/api/contests/jury-invitations/${invitationId}/reject`);
    invitations.value = invitations.value.filter(i => i.id !== invitationId);
    showToast('Davet reddedildi', 'success');
  } catch (error: any) {
    console.error('Failed to reject invitation:', error);
    showToast(error.response?.data?.message || 'Davet reddedilemedi', 'error');
  } finally {
    rejectingId.value = null;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(text: string, length: number): string {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
}
</script>

<style scoped>
.jury-invitations-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--foreground);
}

.page-header p {
  color: var(--muted-foreground);
  font-size: 1.05rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--card);
  border-radius: var(--radius);
  color: var(--muted-foreground);
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.invitation-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.invitation-card:hover {
  border-color: hsl(var(--brand));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.invitation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.contest-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.5rem;
}

.organizer {
  font-size: 0.95rem;
  color: var(--muted-foreground);
}

.organizer .label {
  font-weight: 500;
  margin-right: 0.25rem;
}

.invitation-date {
  white-space: nowrap;
  color: var(--muted-foreground);
  font-size: 0.85rem;
}

.contest-description {
  color: var(--muted-foreground);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 1rem 0;
  padding: 1rem;
  background: var(--muted);
  border-radius: calc(var(--radius) / 2);
}

.invitation-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.btn-accept,
.btn-reject,
.btn-view {
  padding: 0.75rem 1.5rem;
  border-radius: calc(var(--radius) / 2);
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-accept {
  background: hsl(var(--brand));
  color: white;
}

.btn-accept:hover:not(:disabled) {
  background: hsl(var(--brand) / 0.9);
  transform: translateY(-2px);
}

.btn-accept:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reject {
  background: var(--destructive);
  color: var(--destructive-foreground);
}

.btn-reject:hover:not(:disabled) {
  background: hsl(from var(--destructive) h s calc(l - 5%));
  transform: translateY(-2px);
}

.btn-reject:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-view {
  background: var(--secondary);
  color: var(--secondary-foreground);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-view:hover {
  background: hsl(from var(--secondary) h s calc(l - 5%));
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .jury-invitations-container {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .invitation-header {
    flex-direction: column;
  }

  .invitation-actions {
    flex-direction: column;
  }

  .btn-accept,
  .btn-reject,
  .btn-view {
    width: 100%;
  }
}
</style>
