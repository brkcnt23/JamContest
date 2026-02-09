// jury/jury.service.ts
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JuryService {
  constructor(private prisma: PrismaService) {}

  // Jury assigns score to submission
  async scoreSubmission(
    juryId: string,
    submissionId: string,
    score: number,
    comment?: string,
  ) {
    // Validate jury assignment
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        contest: {
          include: {
            juryAssignments: true,
          },
        },
      },
    });

    if (!submission) throw new BadRequestException('Submission not found');

    const isAssigned = submission.contest.juryAssignments.some(
      (j) => j.juryId === juryId,
    );
    if (!isAssigned) throw new ForbiddenException('Not assigned to this contest');

    // Validate score range
    if (score < 0 || score > 100) {
      throw new BadRequestException('Score must be between 0-100');
    }

    // Upsert score
    const juryScore = await this.prisma.juryScore.upsert({
      where: {
        juryId_submissionId: {
          juryId,
          submissionId,
        },
      },
      create: {
        juryId,
        submissionId,
        score,
        comment,
      },
      update: {
        score,
        comment,
        updatedAt: new Date(),
      },
    });

    // Recalculate submission's final score
    await this.recalculateSubmissionScore(submissionId);

    return juryScore;
  }

  // Get submissions for jury (without other jury scores)
  async getJurySubmissions(juryId: string, contestId: string) {
    // Verify assignment
    const assignment = await this.prisma.juryAssignment.findUnique({
      where: {
        juryId_contestId: { juryId, contestId },
      },
    });

    if (!assignment) throw new ForbiddenException('Not assigned to this contest');

    // Get submissions with only this jury's score
    const submissions = await this.prisma.submission.findMany({
      where: { contestId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        files: true,
        scores: {
          where: { juryId }, // ONLY this jury's score
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return submissions;
  }

  private async recalculateSubmissionScore(submissionId: string) {
    const scores = await this.prisma.juryScore.findMany({
      where: { submissionId },
      select: { score: true },
    });

    if (scores.length === 0) {
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { finalScore: null, rank: null },
      });
      return;
    }

    const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { finalScore: avg },
    });

    // Recalculate ranks for entire contest
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: { contestId: true },
    });

    await this.calculateContestRankings(submission.contestId);
  }

  private async calculateContestRankings(contestId: string) {
    const submissions = await this.prisma.submission.findMany({
      where: {
        contestId,
        finalScore: { not: null },
      },
      orderBy: { finalScore: 'desc' },
    });

    // Update ranks
    const updates = submissions.map((sub, index) =>
      this.prisma.submission.update({
        where: { id: sub.id },
        data: { rank: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);
  }
}