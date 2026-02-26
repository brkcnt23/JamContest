import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('social')
export class SocialController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('feed')
  async getFeed(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('category') category?: string,
  ) {
    const takeParsed = Math.min(Number(take) || 20, 50);
    const skipParsed = Number(skip) || 0;

    return this.prisma.submission.findMany({
      where: {
        contest: {
          status: {
            in: [
              'ACTIVE',
              'SUBMISSION_CLOSED',
              'JUDGING',
              'FINALIZED',
              'COMPLETED',
            ],
          },
          ...(category ? { category } : {}),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        contest: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            status: true,
          },
        },
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
          },
          take: 1,
        },
        _count: {
          select: {
            scores: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: takeParsed,
      skip: skipParsed,
    });
  }

  @Get('stats')
  async getStats() {
    const [totalContests, activeContests, totalUsers, totalSubmissions] =
      await Promise.all([
        this.prisma.contest.count({
          where: {
            status: {
              notIn: ['DRAFT', 'REJECTED'],
            },
          },
        }),
        this.prisma.contest.count({
          where: {
            status: {
              in: ['APPLICATIONS', 'ACTIVE', 'SUBMISSION_CLOSED', 'JUDGING'],
            },
          },
        }),
        this.prisma.user.count(),
        this.prisma.submission.count({}),
      ]);

    return {
      totalContests,
      activeContests,
      totalUsers,
      totalSubmissions,
    };
  }
}
