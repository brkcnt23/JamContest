import { Controller, Get, Post, Delete, UseGuards, Body, Param, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { BadgesService } from './badges.service';

@Controller('admin/badges')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  async findAll() {
    return this.badgesService.findAll();
  }

  @Post()
  async create(
    @Body() body: { type: string; name: string; description: string; icon?: string; color?: string },
    @Request() req: any,
  ) {
    return this.badgesService.create(body, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.badgesService.delete(id);
  }

  @Post('assign')
  async assign(@Body() body: { badgeId: string; userId: string; metadata?: any }) {
    return this.badgesService.assignToUser(body.badgeId, body.userId, body.metadata);
  }

  @Delete(':badgeId/revoke/:userId')
  async revoke(@Param('badgeId') badgeId: string, @Param('userId') userId: string) {
    return this.badgesService.revokeFromUser(badgeId, userId);
  }

  @Get('user/:userId')
  async getUserBadges(@Param('userId') userId: string) {
    return this.badgesService.getUserBadges(userId);
  }
}
