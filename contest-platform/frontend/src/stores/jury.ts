import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface Jury Member {
  id: string;
  displayName: string;
  email: string;
}

interface JuryReview {
  id: string;
  submissionId: string;
  juryId: string;
  score: number;
  comment?: string;
  status: 'DRAFT' | 'SUBMITTED';
  submission: {
    id: string;
    title: string;
    user: Jury Member;
    contest: {
      id: string;
      title: string;
    };
  };
}

export const useJuryStore = defineStore('jury', () => {
  const works = ref<JuryReview[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const draftCount = computed(() =>
    works.value.filter((w) => w.status === 'DRAFT').length
  );

  const submittedCount = computed(() =>
    works.value.filter((w) => w.status === 'SUBMITTED').length
  );

  // Actions
  async function fetchAssignedWorks() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<JuryReview[]>('/api/jury/works');
      works.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch works';
    } finally {
      loading.value = false;
    }
  }

  async function getWorkDetails(workId: string) {
    try {
      const { data } = await axios.get<JuryReview>(`/api/jury/works/${workId}`);
      return data;
    } catch (err: any) {
      throw err;
    }
  }

  async function submitReview(
    workId: string,
    score: number,
    comment?: string
  ) {
    try {
      const { data } = await axios.post(`/api/jury/works/${workId}/submit-review`, {
        score,
        comment,
      });

      // Update local state
      const idx = works.value.findIndex((w) => w.submissionId === workId);
      if (idx !== -1) {
        works.value[idx] = {
          ...works.value[idx],
          score,
          comment,
          status: 'SUBMITTED',
        };
      }

      return data;
    } catch (err: any) {
      throw err;
    }
  }

  async function getAggregatedScores(submissionId: string) {
    try {
      const { data } = await axios.get(
        `/api/jury/submissions/${submissionId}/scores`
      );
      return data;
    } catch (err: any) {
      throw err;
    }
  }

  return {
    // State
    works,
    loading,
    error,

    // Getters
    draftCount,
    submittedCount,

    // Actions
    fetchAssignedWorks,
    getWorkDetails,
    submitReview,
    getAggregatedScores,
  };
});
