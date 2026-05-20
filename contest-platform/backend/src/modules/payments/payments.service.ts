import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Mock checkout — her zaman başarılı döner
  async checkout(userId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Plan bulunamadı');

    const existingSub = await this.prisma.userSubscription.findUnique({ where: { userId } });

    // Transaction kaydı
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        amount: plan.price,
        currency: 'TRY',
        status: 'COMPLETED',
        method: 'MOCK',
        description: `${plan.name} planına abonelik`,
        completedAt: new Date(),
      },
    });

    // Aboneliği oluştur veya güncelle
    const expiresAt = plan.price === 0 ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (existingSub) {
      await this.prisma.userSubscription.update({
        where: { userId },
        data: {
          planId,
          status: 'ACTIVE',
          startedAt: new Date(),
          expiresAt,
          cancelledAt: null,
          autoRenew: plan.price > 0,
        },
      });
    } else {
      await this.prisma.userSubscription.create({
        data: {
          userId,
          planId,
          status: 'ACTIVE',
          startedAt: new Date(),
          expiresAt,
          autoRenew: plan.price > 0,
        },
      });
    }

    // Transaction'a subscriptionId'yi ekle
    const updatedSub = await this.prisma.userSubscription.findUnique({ where: { userId } });
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { subscriptionId: updatedSub!.id },
    });

    return {
      success: true,
      transaction,
      subscription: updatedSub,
    };
  }

  async getHistory(userId: string, take = 20, skip = 0) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { subscription: { include: { plan: true } } },
    });
  }
}
