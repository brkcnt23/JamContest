import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JuryAssignmentGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const juryId = request.user?.id;
    const contestId = request.params?.contestId || request.body?.contestId;

    const assignment = await this.prisma.juryAssignment.findUnique({
      where: {
        juryId_contestId: { juryId, contestId },
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Not assigned as jury');
    }

    return true;
  }
}
