import { SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from '@prisma/client';

export const TIER_KEY = 'minTier';
export const Tier = (...tiers: SubscriptionTier[]) => SetMetadata(TIER_KEY, tiers);
