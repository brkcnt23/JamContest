<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from '@/composables/useToast';
import { ChevronDown, Check, X } from 'lucide-vue-next';

interface Application {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  motivation: string;
  reason?: string;
  appliedAt: string;
  reviewedAt?: string;
  type: 'jury' | 'organizer';
}

const { showToast } = useToast();

const juryApps = ref<Application[]>([]);
const organizerApps = ref<Application[]>([]);
const loading = ref(false);
const reviewingId = ref<string | null>(null);

const filterStatus = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
const activeTab = ref<'jury' | 'organizer'>('jury');

const reviewForm = ref({
  approved: false,
  reason: '',
});
const showReviewModal = ref(false);
const currentReviewApp = ref<Application | null>(null);

async function loadApplications() {
  loading.value = true;
  try {
    const [juryRes, organizerRes] = await Promise.all([
      axios.get('/api/applications/admin/jury'),
      axios.get('/api/applications/admin/organizer'),
    ]);

    juryApps.value = juryRes.data.map((app: any) => ({ ...app, type: 'jury' }));
    organizerApps.value = organizerRes.data.map((app: any) => ({ ...app, type: 'organizer' }));
  } catch (error) {
    showToast('Failed to load applications', 'error');
  } finally {
    loading.value = false;
  }
}

function getFilteredApps() {
  const apps = activeTab.value === 'jury' ? juryApps.value : organizerApps.value;
  if (filterStatus.value === 'ALL') return apps;
  return apps.filter(app => app.status === filterStatus.value);
}

function openReviewModal(app: Application) {
  currentReviewApp.value = app;
  reviewForm.value = { approved: false, reason: '' };
  showReviewModal.value = true;
}

async function submitReview() {
  if (!currentReviewApp.value) return;

  if (!reviewForm.value.approved && !reviewForm.value.reason.trim()) {
    showToast('Please provide a rejection reason', 'error');
    return;
  }

  reviewingId.value = currentReviewApp.value.id;
  try {
    const endpoint = `/api/applications/admin/${currentReviewApp.value.type}/${currentReviewApp.value.id}`;
    await axios.patch(endpoint, {
      approved: reviewForm.value.approved,
      reason: reviewForm.value.reason,
    });

    showToast(
      reviewForm.value.approved ? 'Application approved!' : 'Application rejected',
      'success'
    );

    showReviewModal.value = false;
    await loadApplications();
  } catch (error: any) {
    showToast(error.response?.data?.message || 'Review failed', 'error');
  } finally {
    reviewingId.value = null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return '#f59e0b';
    case 'APPROVED':
      return '#10b981';
    case 'REJECTED':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

onMounted(() => {
  loadApplications();
});
</script>

<template>
  <div class="admin-applications">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Application Management</h1>
      <p class="page-subtitle">Review jury and organizer applications</p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        @click="activeTab = 'jury'"
        :class="['tab', activeTab === 'jury' && 'tab--active']"
      >
        Jury Applications
      </button>
      <button
        @click="activeTab = 'organizer'"
        :class="['tab', activeTab === 'organizer' && 'tab--active']"
      >
        Organizer Applications
      </button>
    </div>

    <!-- Filter -->
    <div class="filter-bar">
      <select v-model="filterStatus" class="filter-select">
        <option value="ALL">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      Loading applications...
    </div>

    <!-- Table -->
    <div v-else class="applications-table">
      <div v-if="getFilteredApps().length === 0" class="empty-state">
        No {{ activeTab }} applications found.
      </div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in getFilteredApps()" :key="app.id" class="app-row">
              <td>
                <div class="user-cell">
                  <div>
                    <div class="user-name">{{ app.user.displayName }}</div>
                    <div class="user-email">{{ app.user.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ formatDate(app.appliedAt) }}</td>
              <td>
                <span
                  class="status-badge"
                  :style="{ backgroundColor: getStatusColor(app.status) }"
                >
                  {{ app.status }}
                </span>
              </td>
              <td>
                <button
                  @click="openReviewModal(app)"
                  :disabled="app.status !== 'PENDING'"
                  class="btn-review"
                >
                  {{ app.status === 'PENDING' ? 'Review' : 'Reviewed' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal && currentReviewApp" class="modal-overlay" @click.self="showReviewModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Review Application</h2>
          <button @click="showReviewModal = false" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <!-- User Info -->
          <div class="review-section">
            <h3>Applicant</h3>
            <p><strong>{{ currentReviewApp.user.displayName }}</strong></p>
            <p class="text-muted">{{ currentReviewApp.user.email }}</p>
          </div>

          <!-- Motivation -->
          <div class="review-section">
            <h3>Motivation</h3>
            <div class="motivation-box">
              {{ currentReviewApp.motivation }}
            </div>
          </div>

          <!-- Decision -->
          <div class="review-section">
            <h3>Decision</h3>
            <div class="decision-buttons">
              <button
                @click="reviewForm.approved = true"
                :class="['decision-btn', reviewForm.approved && 'decision-btn--approve']"
              >
                <Check class="w-4 h-4" />
                Approve
              </button>
              <button
                @click="reviewForm.approved = false"
                :class="['decision-btn', !reviewForm.approved && 'decision-btn--reject']"
              >
                <X class="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>

          <!-- Reason (if rejecting) -->
          <div v-if="!reviewForm.approved" class="review-section">
            <label class="label">Rejection Reason</label>
            <textarea
              v-model="reviewForm.reason"
              placeholder="Explain why this application was rejected..."
              rows="4"
              class="textarea"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showReviewModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button
            @click="submitReview"
            :disabled="reviewingId === currentReviewApp.id"
            class="btn btn-primary"
          >
            {{ reviewingId === currentReviewApp.id ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-applications {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin: 0;
}

.page-subtitle {
  color: hsl(var(--muted-foreground));
  margin-top: 0.5rem;
  font-size: 14px;
}

.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.tab {
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: hsl(var(--foreground));
}

.tab--active {
  color: hsl(var(--brand));
  border-bottom-color: hsl(var(--brand));
}

.filter-bar {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 14px;
  cursor: pointer;
}

.loading-state,
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
}

.applications-table {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: hsl(var(--muted) / 0.5);
}

th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  border-bottom: 1px solid hsl(var(--border));
}

.app-row {
  border-bottom: 1px solid hsl(var(--border));
  transition: background 0.15s;
}

.app-row:hover {
  background: hsl(var(--muted) / 0.3);
}

td {
  padding: 14px 16px;
  font-size: 14px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  color: hsl(var(--foreground));
}

.user-email {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.btn-review {
  padding: 6px 14px;
  background: hsl(var(--brand));
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-review:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-review:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
}

.modal-content {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-section h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
}

.review-section p {
  margin: 0;
  color: hsl(var(--foreground));
}

.text-muted {
  color: hsl(var(--muted-foreground)) !important;
}

.motivation-box {
  padding: 12px;
  background: hsl(var(--muted) / 0.3);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 14px;
  color: hsl(var(--foreground));
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.decision-buttons {
  display: flex;
  gap: 12px;
}

.decision-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid hsl(var(--border));
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.decision-btn:hover {
  border-color: hsl(var(--brand));
  color: hsl(var(--brand));
}

.decision-btn--approve {
  border-color: #10b981;
  background: hsl(120 84% 60% / 0.1);
  color: #10b981;
}

.decision-btn--reject {
  border-color: #ef4444;
  background: hsl(0 84% 60% / 0.1);
  color: #ef4444;
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.textarea {
  padding: 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--muted) / 0.3);
  color: hsl(var(--foreground));
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.textarea:focus {
  outline: none;
  border-color: hsl(var(--brand));
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.3);
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: hsl(var(--brand));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover {
  background: hsl(var(--muted) / 0.8);
}

@media (max-width: 768px) {
  .admin-applications {
    padding: 1rem;
  }

  table {
    font-size: 13px;
  }

  th,
  td {
    padding: 10px 12px;
  }
}
</style>
