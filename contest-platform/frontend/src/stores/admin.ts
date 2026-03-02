import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface Applicant {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

interface Application {
  id: string;
  userId: string;
  user: Applicant;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  motivation: string;
  reason?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export const useAdminStore = defineStore('admin', () => {
  const juryApplications = ref<Application[]>([]);
  const organizerApplications = ref<Application[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const pendingJuryCount = computed(() =>
    juryApplications.value.filter(app => app.status === 'PENDING').length
  );

  const pendingOrganizerCount = computed(() =>
    organizerApplications.value.filter(app => app.status === 'PENDING').length
  );

  // Actions
  async function fetchJuryApplications(status?: string) {
    loading.value = true;
    error.value = null;
    try {
      const url = '/api/applications/admin/jury' + (status ? `?status=${status}` : '');
      const { data } = await axios.get<Application[]>(url);
      juryApplications.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch jury applications';
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrganizerApplications(status?: string) {
    loading.value = true;
    error.value = null;
    try {
      const url = '/api/applications/admin/organizer' + (status ? `?status=${status}` : '');
      const { data } = await axios.get<Application[]>(url);
      organizerApplications.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch organizer applications';
    } finally {
      loading.value = false;
    }
  }

  async function reviewApplication(
    type: 'jury' | 'organizer',
    applicationId: string,
    approved: boolean,
    reason?: string
  ) {
    try {
      const { data } = await axios.patch(
        `/api/applications/admin/${type}/${applicationId}`,
        { approved, reason }
      );

      // Update local state
      const apps = type === 'jury' ? juryApplications : organizerApplications;
      const idx = apps.value.findIndex(app => app.id === applicationId);
      if (idx !== -1) {
        apps.value[idx] = {
          ...apps.value[idx],
          status: approved ? 'APPROVED' : 'REJECTED',
          reason: reason || apps.value[idx].reason,
          reviewedAt: new Date().toISOString(),
        };
      }

      return data;
    } catch (err: any) {
      throw err;
    }
  }

  return {
    // State
    juryApplications,
    organizerApplications,
    loading,
    error,

    // Getters
    pendingJuryCount,
    pendingOrganizerCount,

    // Actions
    fetchJuryApplications,
    fetchOrganizerApplications,
    reviewApplication,
  };
});
