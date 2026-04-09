import { Controller, Get, Post, Delete, UseGuards, Body, Param, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialService } from './social.service';

@Controller('api/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ==================== FEED ====================

  @Get('feed')
  async getFeed(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('category') category?: string,
  ) {
    // Public endpoint - no auth needed
    // But we'll use empty userId for guest users
    return await this.socialService.getFeed(
      'guest',
      Math.min(Number(take) || 20, 50),
      Math.max(Number(skip) || 0, 0),
      category,
    );
  }

  // ==================== LIKES ====================

  @Post('submissions/:submissionId/like')
  @UseGuards(JwtAuthGuard)
  async likeSubmission(
    @Param('submissionId') submissionId: string,
    @Request() req: any,
  ) {
    return await this.socialService.like(req.user.id, submissionId);
  }

  @Delete('submissions/:submissionId/like')
  @UseGuards(JwtAuthGuard)
  async unlikeSubmission(
    @Param('submissionId') submissionId: string,
    @Request() req: any,
  ) {
    return await this.socialService.unlike(req.user.id, submissionId);
  }

  @Get('submissions/:submissionId/likes')
  async getLikeCount(@Param('submissionId') submissionId: string) {
    return await this.socialService.getLikeCount(submissionId);
  }

  @Get('submissions/:submissionId/is-liked')
  @UseGuards(JwtAuthGuard)
  async isLiked(
    @Param('submissionId') submissionId: string,
    @Request() req: any,
  ) {
    const isLiked = await this.socialService.isLikedByUser(req.user.id, submissionId);
    return { isLiked };
  }

  // ==================== COMMENTS ====================

  @Get('submissions/:submissionId/comments')
  async getComments(@Param('submissionId') submissionId: string) {
    return await this.socialService.getComments(submissionId);
  }

  @Post('submissions/:submissionId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('submissionId') submissionId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return await this.socialService.addComment(req.user.id, submissionId, content);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return await this.socialService.deleteComment(req.user.id, commentId);
  }

  // ==================== FOLLOWS ====================

  @Post('users/:userId/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return await this.socialService.follow(req.user.id, userId);
  }

  @Delete('users/:userId/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return await this.socialService.unfollow(req.user.id, userId);
  }

  @Get('users/:userId/is-following')
  @UseGuards(JwtAuthGuard)
  async isFollowing(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    const isFollowing = await this.socialService.isFollowing(req.user.id, userId);
    return { isFollowing };
  }

  @Get('users/:userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    return await this.socialService.getFollowers(userId);
  }

  @Get('users/:userId/following')
  async getFollowing(@Param('userId') userId: string) {
    return await this.socialService.getFollowing(userId);
  }

  @Get('users/:userId/follower-count')
  async getFollowerCount(@Param('userId') userId: string) {
    const count = await this.socialService.getFollowerCount(userId);
    return { count };
  }

  @Get('users/:userId/following-count')
  async getFollowingCount(@Param('userId') userId: string) {
    const count = await this.socialService.getFollowingCount(userId);
    return { count };
  }

  // ==================== STATS ====================

  @Get('stats')
  async getStats() {
    // Legacy endpoint
    return {
      totalContests: 0,
      activeContests: 0,
      totalUsers: 0,
      totalSubmissions: 0,
    };
  }
}
