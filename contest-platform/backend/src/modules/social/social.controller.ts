import { Controller, Get, Query, Post, Delete, Body, Param, UseGuards, Req, HttpCode } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social')
export class SocialController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialService: SocialService,
  ) {}

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

  // Follow/Unfollow
  @Post('follow/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async follow(@Param('userId') targetUserId: string, @Req() req: any) {
    return this.socialService.followUser(req.user.id, targetUserId);
  }

  @Delete('follow/:userId')
  @UseGuards(JwtAuthGuard)
  async unfollow(@Param('userId') targetUserId: string, @Req() req: any) {
    return this.socialService.unfollowUser(req.user.id, targetUserId);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.socialService.getFollowers(userId);
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.socialService.getFollowing(userId);
  }

  // Likes
  @Post('submissions/:submissionId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async like(@Param('submissionId') submissionId: string, @Req() req: any) {
    return this.socialService.likeSubmission(req.user.id, submissionId);
  }

  @Delete('submissions/:submissionId/like')
  @UseGuards(JwtAuthGuard)
  async unlike(@Param('submissionId') submissionId: string, @Req() req: any) {
    return this.socialService.unlikeSubmission(req.user.id, submissionId);
  }

  @Get('submissions/:submissionId/likes')
  async getLikeCount(@Param('submissionId') submissionId: string) {
    const count = await this.socialService.getLikes(submissionId);
    return { count };
  }

  // Comments
  @Post('submissions/:submissionId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async addComment(
    @Param('submissionId') submissionId: string,
    @Body() body: { content: string },
    @Req() req: any,
  ) {
    return this.socialService.addComment(req.user.id, submissionId, body.content);
  }

  @Get('submissions/:submissionId/comments')
  async getComments(@Param('submissionId') submissionId: string) {
    return this.socialService.getComments(submissionId);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    return this.socialService.deleteComment(commentId, req.user.id);
  }
}
