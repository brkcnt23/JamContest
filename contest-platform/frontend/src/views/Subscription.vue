<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">{{ $t('subscription.title') }}</h1>
      <p class="text-[hsl(var(--muted-foreground))]">{{ $t('subscription.subtitle') }}</p>
    </div>

    <div v-if="loading" class="text-center py-12 text-[hsl(var(--muted-foreground))]">
      {{ $t('common.loading') }}
    </div>

    <!-- Current Plan -->
    <div v-if="status && !loading" class="mb-10 p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span class="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{{ $t('subscription.currentPlan') }}</span>
          <div class="flex items-center gap-3 mt-1">
            <span class="text-2xl font-bold" :class="status.isPremium ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--foreground))]'">
              {{ status.plan?.name || $t('subscription.free') }}
            </span>
            <span v-if="status.isPremium" class="px-2 py-0.5 text-xs font-semibold rounded-full bg-[hsl(var(--brand))]/20 text-[hsl(var(--brand))]">
              PREMIUM
            </span>
          </div>
        </div>
        <div v-if="status.isPremium" class="text-right">
          <span class="text-sm text-[hsl(var(--muted-foreground))] block">{{ $t('subscription.status') }}</span>
          <span class="text-green-400 font-medium">{{ status.status === 'ACTIVE' ? $t('subscription.active') : status.status }}</span>
          <button
            v-if="status.status === 'ACTIVE'"
            class="ml-4 px-4 py-2 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            @click="handleCancel"
          >
            {{ $t('subscription.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Plans Grid -->
    <div v-if="plans.length && !loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="plan in visiblePlans"
        :key="plan.id"
        class="p-6 rounded-xl border transition-all"
        :class="[
          plan.tier === currentTier
            ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/10 ring-1 ring-[hsl(var(--brand))]/30'
            : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-[hsl(var(--border))]/80',
          plan.tier === 'PRO' ? 'md:scale-105' : ''
        ]"
      >
        <div v-if="plan.badgeType" class="text-xs font-bold text-[hsl(var(--brand))] uppercase tracking-wider mb-3">
          {{ plan.badgeType }}
        </div>
        <h3 class="text-xl font-bold text-[hsl(var(--foreground))] mb-1">{{ plan.name }}</h3>
        <div class="text-3xl font-bold text-[hsl(var(--foreground))] mt-4 mb-1">
          {{ plan.price === 0 ? $t('subscription.free_price') : `₺${plan.price}` }}
        </div>
        <p class="text-sm text-[hsl(var(--muted-foreground))] mb-6">/ {{ $t('subscription.month') }}</p>

        <ul class="space-y-2.5 mb-6 text-sm text-[hsl(var(--foreground))]">
          <li class="flex items-center gap-2">
            <span class="text-green-400">&#10003;</span>
            <span>{{ plan.dailyPostLimit === -1 ? $t('subscription.unlimited') : plan.dailyPostLimit }} {{ $t('subscription.posts_per_day') }}</span>
          </li>
          <li v-if="plan.jobListingLimit > 0" class="flex items-center gap-2">
            <span class="text-green-400">&#10003;</span>
            <span>{{ plan.jobListingLimit === -1 ? $t('subscription.unlimited') : plan.jobListingLimit }} {{ $t('subscription.job_listings') }}</span>
          </li>
          <li v-if="plan.projectListingLimit > 0" class="flex items-center gap-2">
            <span class="text-green-400">&#10003;</span>
            <span>{{ plan.projectListingLimit === -1 ? $t('subscription.unlimited') : plan.projectListingLimit }} {{ $t('subscription.project_listings') }}</span>
          </li>
          <li v-if="plan.featuredProfile" class="flex items-center gap-2">
            <span class="text-yellow-400">&#9733;</span>
            <span>{{ $t('subscription.featured_profile') }}</span>
          </li>
        </ul>

        <button
          v-if="plan.tier !== currentTier && plan.price > 0"
          class="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
          :class="plan.tier === 'PRO' ? 'bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/80' : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))]'"
          @click="handleSubscribe(plan.id)"
        >
          {{ $t('subscription.upgrade') }}
        </button>
        <button
          v-else-if="plan.tier === currentTier"
          class="w-full py-2.5 rounded-lg font-semibold text-sm bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-default"
          disabled
        >
          {{ $t('subscription.current') }}
        </button>
        <button
          v-else-if="plan.price === 0"
          class="w-full py-2.5 rounded-lg font-semibold text-sm bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-default"
          disabled
        >
          {{ $t('subscription.default') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSubscription } from '@/composables/useSubscription';
import { showToast } from '@/composables/useToast';

const { status, plans, loading, currentTier, fetchStatus, fetchPlans, subscribe, cancel } = useSubscription();

const visiblePlans = computed(() => {
  return plans.value.filter((p: any) => !p.tier.startsWith('RECRUITER_'));
});

onMounted(async () => {
  await Promise.all([fetchStatus(), fetchPlans()]);
});

async function handleSubscribe(planId: string) {
  try {
    await subscribe(planId);
    showToast('Abonelik başarıyla aktif edildi!', 'success');
  } catch {
    showToast('Bir hata oluştu', 'error');
  }
}

async function handleCancel() {
  if (!confirm('Aboneliğinizi iptal etmek istediğinize emin misiniz?')) return;
  try {
    await cancel();
    showToast('Abonelik iptal edildi', 'success');
  } catch {
    showToast('Bir hata oluştu', 'error');
  }
}
</script>
