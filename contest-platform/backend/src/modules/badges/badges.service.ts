import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.badge.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async create(data: { type: string; name: string; description: string; icon?: string; color?: string }, adminId: string) {
    const existing = await this.prisma.badge.findUnique({ where: { type: data.type } });
    if (existing) throw new BadRequestException('Bu badge tipi zaten var');

    return this.prisma.badge.create({
      data: { ...data, createdBy: adminId },
    });
  }

  async delete(badgeId: string) {
    const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new NotFoundException('Badge bulunamadı');
    return this.prisma.badge.delete({ where: { id: badgeId } });
  }

  async assignToUser(badgeId: string, userId: string, metadata?: any) {
    try {
      return await this.prisma.userBadge.create({
        data: { userId, badgeId, metadata: metadata || undefined },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new BadRequestException('Bu badge zaten verilmiş');
      throw e;
    }
  }

  async revokeFromUser(badgeId: string, userId: string) {
    const ub = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (!ub) throw new NotFoundException('Kullanıcıda bu badge yok');
    return this.prisma.userBadge.delete({ where: { userId_badgeId: { userId, badgeId } } });
  }

  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }
}
