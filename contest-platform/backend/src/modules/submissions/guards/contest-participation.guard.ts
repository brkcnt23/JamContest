// guards/contest-participation.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContestParticipationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const contestId = request.params.contestId || request.body.contestId;

    if (!contestId) throw new ForbiddenException('Contest ID required');

    const application = await this.prisma.contestApplication.findUnique({
      where: {
        userId_contestId: { userId, contestId },
      },
    });

    if (!application || application.status !== 'APPROVED') {
      throw new ForbiddenException('Not approved for this contest');
    }

    return true;
  }
}

