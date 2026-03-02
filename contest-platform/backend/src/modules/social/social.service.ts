import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  async followUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new ConflictException('Cannot follow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: targetUserId },
      },
    });

    if (existing) {
      throw new ConflictException('Already following this user');
    }

    await this.prisma.follow.create({
      data: { followerId: userId, followingId: targetUserId },
    });

    return { message: 'User followed' };
  }

  async unfollowUser(userId: string, targetUserId: string) {
    await this.prisma.follow.deleteMany({
      where: { followerId: userId, followingId: targetUserId },
    });

    return { message: 'User unfollowed' };
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async likeSubmission(userId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const existing = await this.prisma.like.findUnique({
      where: { userId_submissionId: { userId, submissionId } },
    });

    if (existing) {
      throw new ConflictException('Already liked');
    }

    await this.prisma.like.create({
      data: { userId, submissionId },
    });

    return { message: 'Submission liked' };
  }

  async unlikeSubmission(userId: string, submissionId: string) {
    await this.prisma.like.deleteMany({
      where: { userId, submissionId },
    });

    return { message: 'Like removed' };
  }

  async getLikes(submissionId: string) {
    return this.prisma.like.count({ where: { submissionId } });
  }

  async addComment(userId: string, submissionId: string, content: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return this.prisma.comment.create({
      data: { userId, submissionId, content },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getComments(submissionId: string) {
    return this.prisma.comment.findMany({
      where: { submissionId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ConflictException('Cannot delete other user comments');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });

    return { message: 'Comment deleted' };
  }
}
