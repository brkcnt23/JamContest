import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TIER_KEY } from '../decorators/tier.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTiers = this.reflector.getAllAndOverride<string[]>(TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTiers || requiredTiers.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');

    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    });

    const userTier = sub && sub.status === 'ACTIVE' ? sub.plan.tier : 'FREE';

    if (!requiredTiers.includes(userTier as any)) {
      throw new ForbiddenException('Bu özellik için daha yüksek bir tier gerekiyor');
    }

    return true;
  }
}
