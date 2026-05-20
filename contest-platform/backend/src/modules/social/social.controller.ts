import { Controller, Get, Post, Delete, Put, UseGuards, Body, Param, Query, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { SocialService } from './social.service';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ==================== FEED ====================

  @Get('feed')
  async getFeed(
    @Query('tab') tab: 'today' | 'past' = 'today',
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.socialService.getFeed(
      tab,
      Math.min(Number(take) || 20, 50),
      Math.max(Number(skip) || 0, 0),
    );
  }

  // ==================== POSTS ====================

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() body: { content: string; imageUrl?: string },
    @Request() req: any,
  ) {
    return this.socialService.createPost(req.user.id, body.content, body.imageUrl);
  }

  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('postId') postId: string, @Request() req: any) {
    return this.socialService.deletePost(req.user.id, postId);
  }

  @Get('posts/can-post')
  @UseGuards(JwtAuthGuard)
  async canPost(@Request() req: any) {
    return this.socialService.canPost(req.user.id);
  }

  // ==================== POST COMMENTS ====================

  @Get('posts/:postId/comments')
  async getPostComments(@Param('postId') postId: string) {
    return this.socialService.getPostComments(postId);
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  async addPostComment(
    @Param('postId') postId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.socialService.addPostComment(req.user.id, postId, content);
  }

  @Delete('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deletePostComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.socialService.deletePostComment(req.user.id, commentId);
  }

  // ==================== VOTES ====================

  @Post('posts/:postId/vote')
  @UseGuards(JwtAuthGuard)
  async vote(
    @Param('postId') postId: string,
    @Body('type') type: 'UP' | 'DOWN',
    @Request() req: any,
  ) {
    return this.socialService.vote(req.user.id, postId, type);
  }

  @Delete('posts/:postId/vote')
  @UseGuards(JwtAuthGuard)
  async unvote(@Param('postId') postId: string, @Request() req: any) {
    return this.socialService.unvote(req.user.id, postId);
  }

  // ==================== SCOREBOARD ====================

  @Get('scoreboard/monthly')
  async getMonthlyScoreboard(@Query('year') year?: string, @Query('month') month?: string) {
    const now = new Date();
    return this.socialService.getMonthlyScoreboard(
      Number(year) || now.getFullYear(),
      Number(month) || now.getMonth() + 1,
    );
  }

  // ==================== SUBMISSION LIKES (eski) ====================

  @Post('submissions/:submissionId/like')
  @UseGuards(JwtAuthGuard)
  async likeSubmission(@Param('submissionId') submissionId: string, @Request() req: any) {
    return this.socialService.like(req.user.id, submissionId);
  }

  @Delete('submissions/:submissionId/like')
  @UseGuards(JwtAuthGuard)
  async unlikeSubmission(@Param('submissionId') submissionId: string, @Request() req: any) {
    return this.socialService.unlike(req.user.id, submissionId);
  }

  @Get('submissions/:submissionId/likes')
  async getLikeCount(@Param('submissionId') submissionId: string) {
    return this.socialService.getLikeCount(submissionId);
  }

  // ==================== COMMENTS ====================

  @Get('submissions/:submissionId/comments')
  async getComments(@Param('submissionId') submissionId: string) {
    return this.socialService.getComments(submissionId);
  }

  @Post('submissions/:submissionId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('submissionId') submissionId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.socialService.addComment(req.user.id, submissionId, content);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Request() req: any) {
    return this.socialService.deleteComment(req.user.id, commentId);
  }

  // ==================== FOLLOWS ====================

  @Post('users/:userId/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(@Param('userId') userId: string, @Request() req: any) {
    return this.socialService.follow(req.user.id, userId);
  }

  @Delete('users/:userId/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Param('userId') userId: string, @Request() req: any) {
    return this.socialService.unfollow(req.user.id, userId);
  }

  @Get('users/:userId/is-following')
  @UseGuards(JwtAuthGuard)
  async isFollowing(@Param('userId') userId: string, @Request() req: any) {
    const isFollowing = await this.socialService.isFollowing(req.user.id, userId);
    return { isFollowing };
  }

  @Get('users/:userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    return this.socialService.getFollowers(userId);
  }

  @Get('users/:userId/following')
  async getFollowing(@Param('userId') userId: string) {
    return this.socialService.getFollowing(userId);
  }

  // ==================== STATS ====================

  @Get('stats')
  async getStats() {
    return this.socialService.getStats();
  }
}
