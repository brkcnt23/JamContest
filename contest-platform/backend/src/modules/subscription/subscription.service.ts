import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async getStatus(userId: string) {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub) {
      // Default: FREE plan
      const freePlan = await this.prisma.subscriptionPlan.findUnique({
        where: { tier: 'FREE' },
      });
      return {
        tier: 'FREE',
        status: 'ACTIVE',
        plan: freePlan,
        isPremium: false,
      };
    }

    return {
      ...sub,
      isPremium: sub.plan.tier !== 'FREE',
    };
  }

  async cancel(userId: string) {
    const sub = await this.prisma.userSubscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('Aktif abonelik bulunamadı');
    if (sub.status !== 'ACTIVE') throw new BadRequestException('Abonelik zaten aktif değil');

    return this.prisma.userSubscription.update({
      where: { userId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), autoRenew: false },
      include: { plan: true },
    });
  }

  async getDailyPostLimit(userId: string): Promise<number> {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub || sub.status !== 'ACTIVE') return 1; // Free default

    return sub.plan.dailyPostLimit;
  }

  async getJobListingLimit(userId: string): Promise<number> {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub || sub.status !== 'ACTIVE') return 0;
    return sub.plan.jobListingLimit;
  }

  async getProjectListingLimit(userId: string): Promise<number> {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub || sub.status !== 'ACTIVE') return 0;
    return sub.plan.projectListingLimit;
  }
}
