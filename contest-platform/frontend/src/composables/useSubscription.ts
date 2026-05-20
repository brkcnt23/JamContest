import { ref, computed } from 'vue';
import axios from 'axios';

interface SubscriptionStatus {
  tier: string;
  status: string;
  plan: {
    id: string;
    name: string;
    tier: string;
    price: number;
    dailyPostLimit: number;
    projectListingLimit: number;
    jobListingLimit: number;
    featuredProfile: boolean;
    badgeType: string | null;
  } | null;
  isPremium: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price: number;
  dailyPostLimit: number;
  projectListingLimit: number;
  jobListingLimit: number;
  featuredProfile: boolean;
  badgeType: string | null;
}

const status = ref<SubscriptionStatus | null>(null);
const plans = ref<SubscriptionPlan[]>([]);
const loading = ref(false);

export function useSubscription() {
  const isPremium = computed(() => status.value?.isPremium ?? false);
  const currentTier = computed(() => status.value?.tier ?? 'FREE');
  const dailyPostLimit = computed(() => status.value?.plan?.dailyPostLimit ?? 1);

  async function fetchStatus() {
    try {
      const { data } = await axios.get('/api/subscription/status');
      status.value = data;
      return data;
    } catch {
      status.value = null;
      return null;
    }
  }

  async function fetchPlans() {
    try {
      const { data } = await axios.get('/api/subscription/plans');
      plans.value = data;
      return data;
    } catch {
      plans.value = [];
      return [];
    }
  }

  async function subscribe(planId: string) {
    loading.value = true;
    try {
      const { data } = await axios.post('/api/payments/checkout', { planId });
      await fetchStatus();
      return data;
    } catch (e: any) {
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function cancel() {
    loading.value = true;
    try {
      const { data } = await axios.post('/api/subscription/cancel');
      await fetchStatus();
      return data;
    } catch (e: any) {
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function canPost(): Promise<{ allowed: boolean; remaining: number; bannedUntil?: string }> {
    try {
      const { data } = await axios.get('/api/social/posts/can-post');
      return data;
    } catch {
      return { allowed: false, remaining: 0 };
    }
  }

  return {
    status,
    plans,
    loading,
    isPremium,
    currentTier,
    dailyPostLimit,
    fetchStatus,
    fetchPlans,
    subscribe,
    cancel,
    canPost,
  };
}
