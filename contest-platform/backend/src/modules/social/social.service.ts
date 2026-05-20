import {
  Injectable, BadRequestException, ForbiddenException,
  NotFoundException, HttpException, HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const AUTO_BAN_THRESHOLD = -100; // net score bu değere düşerse 1 gün ban

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  private todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private async getDailyPostLimit(userId: string): Promise<number> {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub || sub.status !== 'ACTIVE') return 1; // Free default

    // -1 means unlimited
    if (sub.plan.dailyPostLimit === -1) return Infinity;
    return sub.plan.dailyPostLimit;
  }

  private async isBanned(userId: string): Promise<PostBanInfo | null> {
    const ban = await this.prisma.postBan.findFirst({
      where: { userId, bannedUntil: { gt: new Date() } },
      orderBy: { bannedUntil: 'desc' },
    });
    return ban as PostBanInfo | null;
  }

  private async checkAndTriggerAutoBan(postId: string) {
    const post = await this.prisma.socialPost.findUnique({
      where: { id: postId },
      include: { votes: true },
    });
    if (!post || post.deletedAt) return;

    const ups   = post.votes.filter(v => v.type === 'UP').length;
    const downs = post.votes.filter(v => v.type === 'DOWN').length;
    const net   = ups - downs;

    if (net <= AUTO_BAN_THRESHOLD) {
      const bannedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await this.prisma.postBan.create({
        data: {
          userId: post.userId,
          reason: `Post "${post.id}" net score ${net} — otomatik 1 günlük ban`,
          bannedUntil,
        },
      });
      // Postu gizle
      await this.prisma.socialPost.update({
        where: { id: postId },
        data: { deletedAt: new Date() },
      });
    }
  }

  private netScore(post: any): number {
    const ups   = post.votes?.filter((v: any) => v.type === 'UP').length  ?? 0;
    const downs = post.votes?.filter((v: any) => v.type === 'DOWN').length ?? 0;
    return ups - downs;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST CAN CHECK
  // ──────────────────────────────────────────────────────────────────────────

  async canPost(userId: string): Promise<{ allowed: boolean; remaining: number; bannedUntil?: Date; tier?: string }> {
    const ban = await this.isBanned(userId);
    if (ban) return { allowed: false, remaining: 0, bannedUntil: ban.bannedUntil };

    const limit = await this.getDailyPostLimit(userId);
    const { start, end } = this.todayRange();

    const todayCount = await this.prisma.socialPost.count({
      where: { userId, createdAt: { gte: start, lte: end }, deletedAt: null },
    });

    if (limit === Infinity) return { allowed: true, remaining: -1 };

    const remaining = Math.max(0, limit - todayCount);
    return { allowed: remaining > 0, remaining, tier: limit > 1 ? 'PREMIUM' : 'FREE' };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CREATE POST
  // ──────────────────────────────────────────────────────────────────────────

  async createPost(userId: string, content: string, imageUrl?: string) {
    if (!content?.trim()) throw new BadRequestException('İçerik boş olamaz');
    if (content.length > 2000) throw new BadRequestException('İçerik en fazla 2000 karakter olabilir');

    const { allowed, bannedUntil, remaining } = await this.canPost(userId);

    if (!allowed) {
      if (bannedUntil) {
        throw new ForbiddenException(`Post ban aktif. Bitiş: ${bannedUntil.toISOString()}`);
      }
      throw new HttpException('Günlük post limitine ulaştınız', HttpStatus.TOO_MANY_REQUESTS);
    }

    return this.prisma.socialPost.create({
      data: { userId, content: content.trim(), imageUrl: imageUrl || null },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        votes: true,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE POST
  // ──────────────────────────────────────────────────────────────────────────

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.socialPost.findUnique({ where: { id: postId } });
    if (!post || post.deletedAt) throw new NotFoundException('Post bulunamadı');
    if (post.userId !== userId) throw new ForbiddenException('Sadece kendi postlarını silebilirsin');

    return this.prisma.socialPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FEED
  // ──────────────────────────────────────────────────────────────────────────

  async getFeed(tab: 'today' | 'past' = 'today', take = 20, skip = 0) {
    const { start } = this.todayRange();

    const where = tab === 'today'
      ? { createdAt: { gte: start }, deletedAt: null }
      : { createdAt: { lt: start }, deletedAt: null };

    const posts = await this.prisma.socialPost.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true,
          badges: { include: { badge: true }, take: 5 } } },
        votes: { select: { type: true, userId: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    // Today tab: sort by net score (ups - downs) desc
    const mapped = posts.map(p => ({
      ...p,
      upvotes:   p.votes.filter(v => v.type === 'UP').length,
      downvotes: p.votes.filter(v => v.type === 'DOWN').length,
      netScore:  p.votes.filter(v => v.type === 'UP').length - p.votes.filter(v => v.type === 'DOWN').length,
      commentCount: (p as any)._count?.comments ?? 0,
    }));

    if (tab === 'today') {
      mapped.sort((a, b) => b.netScore - a.netScore || b.createdAt.getTime() - a.createdAt.getTime());
    }

    return mapped;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VOTES
  // ──────────────────────────────────────────────────────────────────────────

  async vote(userId: string, postId: string, type: 'UP' | 'DOWN') {
    const post = await this.prisma.socialPost.findUnique({ where: { id: postId } });
    if (!post || post.deletedAt) throw new NotFoundException('Post bulunamadı');
    if (post.userId === userId) throw new BadRequestException('Kendi postuna oy veremezsin');

    // Mevcut oyu güncelle ya da yeni oluştur
    const existing = await this.prisma.postVote.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let result;
    if (existing) {
      if (existing.type === type) throw new BadRequestException('Zaten bu oyu verdiniz');
      result = await this.prisma.postVote.update({
        where: { userId_postId: { userId, postId } },
        data: { type },
      });
    } else {
      result = await this.prisma.postVote.create({ data: { userId, postId, type } });
    }

    // Down threshold kontrolü
    await this.checkAndTriggerAutoBan(postId);

    return result;
  }

  async unvote(userId: string, postId: string) {
    const vote = await this.prisma.postVote.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!vote) throw new NotFoundException('Oy bulunamadı');

    return this.prisma.postVote.delete({
      where: { userId_postId: { userId, postId } },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MONTHLY SCOREBOARD
  // ──────────────────────────────────────────────────────────────────────────

  async getMonthlyScoreboard(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);

    // JuryScore tablosundan o ay oluşturulan skorları topla
    const scores = await this.prisma.juryScore.groupBy({
      by: ['submissionId'],
      where: {
        createdAt: { gte: start, lt: end },
        archivedAt: null,
      },
      _avg: { score: true },
      _count: { score: true },
    });

    if (!scores.length) return { year, month, leaders: [] };

    // submission → user map
    const submissions = await this.prisma.submission.findMany({
      where: { id: { in: scores.map(s => s.submissionId) } },
      include: {
        user: {
          select: {
            id: true, username: true, displayName: true, avatar: true,
            badges: { include: { badge: true } },
          },
        },
        contest: { select: { id: true, title: true, slug: true } },
      },
    });

    // Kullanıcı bazında toplam puan
    const userScoreMap = new Map<string, { user: any; totalScore: number; contestCount: number }>();

    for (const score of scores) {
      const sub = submissions.find(s => s.id === score.submissionId);
      if (!sub) continue;

      const uid = sub.userId;
      const existing = userScoreMap.get(uid);
      const avg = score._avg.score ?? 0;

      if (existing) {
        existing.totalScore += avg;
        existing.contestCount += 1;
      } else {
        userScoreMap.set(uid, { user: sub.user, totalScore: avg, contestCount: 1 });
      }
    }

    const leaders = Array.from(userScoreMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map((e, i) => ({ rank: i + 1, ...e, totalScore: Math.round(e.totalScore * 100) / 100 }));

    return { year, month, leaders };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMISSION LIKES (geriye uyumluluk)
  // ──────────────────────────────────────────────────────────────────────────

  async like(userId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new NotFoundException('Submission not found');

    try {
      return await this.prisma.like.create({ data: { userId, submissionId } });
    } catch (error: any) {
      if (error.code === 'P2002') throw new BadRequestException('Already liked');
      throw error;
    }
  }

  async unlike(userId: string, submissionId: string) {
    const like = await this.prisma.like.findUnique({
      where: { userId_submissionId: { userId, submissionId } },
    });
    if (!like) throw new NotFoundException('Like not found');
    return this.prisma.like.delete({ where: { userId_submissionId: { userId, submissionId } } });
  }

  async getLikeCount(submissionId: string) {
    return this.prisma.like.count({ where: { submissionId } });
  }

  async isLikedByUser(userId: string, submissionId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: { userId_submissionId: { userId, submissionId } },
    });
    return !!like;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COMMENTS
  // ──────────────────────────────────────────────────────────────────────────

  async getComments(submissionId: string) {
    return this.prisma.comment.findMany({
      where: { submissionId },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(userId: string, submissionId: string, content: string) {
    if (!content?.trim()) throw new BadRequestException('Content cannot be empty');
    if (content.length > 5000) throw new BadRequestException('Too long');

    const submission = await this.prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new NotFoundException('Submission not found');

    return this.prisma.comment.create({
      data: { userId, submissionId, content: content.trim() },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('Not your comment');
    return this.prisma.comment.delete({ where: { id: commentId } });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST COMMENTS
  // ──────────────────────────────────────────────────────────────────────────

  async getPostComments(postId: string) {
    return this.prisma.postComment.findMany({
      where: { postId },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addPostComment(userId: string, postId: string, content: string) {
    if (!content?.trim()) throw new BadRequestException('Yorum boş olamaz');
    if (content.length > 1000) throw new BadRequestException('Yorum en fazla 1000 karakter olabilir');

    const post = await this.prisma.socialPost.findUnique({ where: { id: postId } });
    if (!post || post.deletedAt) throw new NotFoundException('Post bulunamadı');

    return this.prisma.postComment.create({
      data: { userId, postId, content: content.trim() },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });
  }

  async deletePostComment(userId: string, commentId: string) {
    const comment = await this.prisma.postComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Yorum bulunamadı');
    if (comment.userId !== userId) throw new ForbiddenException('Sadece kendi yorumunu silebilirsin');
    return this.prisma.postComment.delete({ where: { id: commentId } });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FOLLOWS
  // ──────────────────────────────────────────────────────────────────────────

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Kendinizi takip edemezsiniz');
    const user = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!user) throw new NotFoundException('User not found');

    try {
      return await this.prisma.follow.create({ data: { followerId, followingId } });
    } catch (e: any) {
      if (e.code === 'P2002') throw new BadRequestException('Already following');
      throw e;
    }
  }

  async unfollow(followerId: string, followingId: string) {
    const f = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!f) throw new NotFoundException('Follow not found');
    return this.prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId } } });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const f = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!f;
  }

  async isMutualFollow(userA: string, userB: string): Promise<boolean> {
    const [ab, ba] = await Promise.all([
      this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userA, followingId: userB } } }),
      this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userB, followingId: userA } } }),
    ]);
    return !!ab && !!ba;
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });
  }

  async getFollowerCount(userId: string) {
    return this.prisma.follow.count({ where: { followingId: userId } });
  }

  async getFollowingCount(userId: string) {
    return this.prisma.follow.count({ where: { followerId: userId } });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STATS
  // ──────────────────────────────────────────────────────────────────────────

  async getStats() {
    const [totalContests, activeContests, totalUsers, totalSubmissions] = await Promise.all([
      this.prisma.contest.count(),
      this.prisma.contest.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.submission.count(),
    ]);
    return { totalContests, activeContests, totalUsers, totalSubmissions };
  }
}

// Helper type
interface PostBanInfo {
  id: string;
  userId: string;
  reason: string;
  bannedUntil: Date;
  createdAt: Date;
}
