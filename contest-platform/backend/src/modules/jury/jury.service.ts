import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitReviewDto } from './dto/jury-review.dto';

@Injectable()
export class JuryService {
  constructor(private prisma: PrismaService) {}

  async getAssignedWorks(juryId: string, contestId?: string) {
    const where: any = {
      jury: {
        // JuryMembers relation - check if jury is assigned to this contest
        id: juryId,
      },
    };

    const reviews = await this.prisma.juryReview.findMany({
      where: {
        juryId,
      },
      include: {
        submission: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
              },
            },
            contest: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (contestId) {
      return reviews.filter((r) => r.submission.contestId === contestId);
    }

    return reviews;
  }

  async getWorkToReview(workId: string, juryId: string) {
    const review = await this.prisma.juryReview.findFirst({
      where: {
        submissionId: workId,
        juryId,
      },
      include: {
        submission: {
          include: {
            user: true,
            contest: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Work not assigned to you');
    }

    return review;
  }

  async submitReview(workId: string, juryId: string, dto: SubmitReviewDto) {
    const review = await this.prisma.juryReview.findFirst({
      where: { submissionId: workId, juryId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.juryReview.update({
      where: { id: review.id },
      data: {
        score: dto.score,
        comment: dto.comment,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        submission: {
          include: {
            user: true,
            contest: true,
          },
        },
      },
    });

    return updated;
  }

  async getAggregatedScores(submissionId: string) {
    const reviews = await this.prisma.juryReview.findMany({
      where: { submissionId, status: 'SUBMITTED' },
    });

    if (reviews.length === 0) {
      return null;
    }

    const totalScore = reviews.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / reviews.length;

    return {
      averageScore: Math.round(averageScore),
      totalReviews: reviews.length,
      scores: reviews.map((r) => r.score),
    };
  }

  async assignJuryToSubmission(submissionId: string, juryId: string) {
    const existing = await this.prisma.juryReview.findUnique({
      where: { submissionId_juryId: { submissionId, juryId } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.juryReview.create({
      data: {
        submissionId,
        juryId,
        status: 'DRAFT',
      },
    });
  }
}
