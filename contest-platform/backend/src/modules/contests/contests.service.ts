// contests/contests.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ContestsService {
  constructor(private prisma: PrismaService) {}

  // Admin creates contest
  async createContest(adminId: string, dto: CreateContestDto) {
    this.validateTimeline(dto);

    return this.prisma.contest.create({
      data: {
        ...dto,
        status: 'DRAFT',
      },
    });
  }

  // Auto-transition contest states
  @Cron(CronExpression.EVERY_MINUTE)
  async updateContestStates() {
    const now = new Date();

    // DRAFT -> APPLICATIONS (when applicationStart reached)
    await this.prisma.contest.updateMany({
      where: {
        status: 'DRAFT',
        applicationStart: { lte: now },
      },
      data: { status: 'APPLICATIONS' },
    });

    // APPLICATIONS -> ACTIVE (when topicRevealAt reached)
    await this.prisma.contest.updateMany({
      where: {
        status: 'APPLICATIONS',
        topicRevealAt: { lte: now },
      },
      data: { status: 'ACTIVE' },
    });

    // ACTIVE -> SUBMISSION_CLOSED (when submissionEnd reached)
    await this.prisma.contest.updateMany({
      where: {
        status: 'ACTIVE',
        submissionEnd: { lte: now },
      },
      data: { status: 'SUBMISSION_CLOSED' },
    });

    // JUDGING -> COMPLETED (when all jury scores submitted or judgingEnd reached)
    const judgingContests = await this.prisma.contest.findMany({
      where: {
        status: 'JUDGING',
        OR: [
          { judgingEnd: { lte: now } },
        ],
      },
      include: {
        submissions: {
          include: {
            scores: true,
          },
        },
        juryAssignments: true,
      },
    });

    for (const contest of judgingContests) {
      const allScored = contest.submissions.every((sub) => {
        return sub.scores.length === contest.juryAssignments.length;
      });

      if (allScored || (contest.judgingEnd && contest.judgingEnd <= now)) {
        await this.calculateRankings(contest.id);
        await this.prisma.contest.update({
          where: { id: contest.id },
          data: { status: 'COMPLETED' },
        });
      }
    }
  }

  // User applies to contest
  async applyToContest(userId: string, contestId: string, message?: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (contest.status !== 'APPLICATIONS') {
      throw new BadRequestException('Applications not open');
    }

    const now = new Date();
    if (now < contest.applicationStart || now > contest.applicationEnd) {
      throw new BadRequestException('Application period ended');
    }

    return this.prisma.contestApplication.create({
      data: {
        userId,
        contestId,
        message,
        status: contest.requiresApproval ? 'PENDING' : 'APPROVED',
      },
    });
  }

  // Check if user can submit
  async canUserSubmit(userId: string, contestId: string): Promise<boolean> {
    const [contest, application] = await Promise.all([
      this.prisma.contest.findUnique({ where: { id: contestId } }),
      this.prisma.contestApplication.findUnique({
        where: {
          userId_contestId: { userId, contestId },
        },
      }),
    ]);

    if (!contest || contest.status !== 'ACTIVE') return false;
    if (!application || application.status !== 'APPROVED') return false;

    const now = new Date();
    return now >= contest.topicRevealAt && now <= contest.submissionEnd;
  }

  private validateTimeline(dto: CreateContestDto) {
    const { applicationStart, applicationEnd, topicRevealAt, submissionEnd } = dto;

    if (applicationStart >= applicationEnd) {
      throw new BadRequestException('Invalid application timeline');
    }
    if (applicationEnd > topicRevealAt) {
      throw new BadRequestException('Topic reveal must be after applications');
    }
    if (topicRevealAt >= submissionEnd) {
      throw new BadRequestException('Submission end must be after topic reveal');
    }
  }

  private async calculateRankings(contestId: string) {
    // Bu fonksiyon aşağıda detaylı yazılacak
  }
}