import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== LIKES ====================

  async like(userId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    try {
      return await this.prisma.like.create({
        data: {
          userId,
          submissionId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('You have already liked this submission');
      }
      throw error;
    }
  }

  async unlike(userId: string, submissionId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_submissionId: {
          userId,
          submissionId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    return await this.prisma.like.delete({
      where: {
        userId_submissionId: {
          userId,
          submissionId,
        },
      },
    });
  }

  async getLikeCount(submissionId: string) {
    return await this.prisma.like.count({
      where: { submissionId },
    });
  }

  async isLikedByUser(userId: string, submissionId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_submissionId: {
          userId,
          submissionId,
        },
      },
    });
    return !!like;
  }

  // ==================== COMMENTS ====================

  async getComments(submissionId: string) {
    return await this.prisma.comment.findMany({
      where: { submissionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async addComment(userId: string, submissionId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    if (content.length > 5000) {
      throw new BadRequestException('Comment is too long (max 5000 characters)');
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return await this.prisma.comment.create({
      data: {
        userId,
        submissionId,
        content: content.trim(),
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
      },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return await this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async getCommentCount(submissionId: string): Promise<number> {
    return await this.prisma.comment.count({
      where: { submissionId },
    });
  }

  // ==================== FOLLOWS ====================

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const followedUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!followedUser) {
      throw new NotFoundException('User not found');
    }

    try {
      return await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('You are already following this user');
      }
      throw error;
    }
  }

  async unfollow(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    return await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return !!follow;
  }

  async getFollowerCount(userId: string): Promise<number> {
    return await this.prisma.follow.count({
      where: { followingId: userId },
    });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return await this.prisma.follow.count({
      where: { followerId: userId },
    });
  }

  async getFollowers(userId: string) {
    return await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getFollowing(userId: string) {
    return await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
  }

  // ==================== FEED ====================

  async getFeed(userId: string, take: number = 20, skip: number = 0, category?: string) {
    const takeClamped = Math.min(Math.max(take, 1), 50);
    const skipClamped = Math.max(skip, 0);

    return await this.prisma.submission.findMany({
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
            coverImage: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            scores: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: takeClamped,
      skip: skipClamped,
    });
  }
}
