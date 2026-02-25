import { Controller, Get, Put, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(@Req() req: any) {
    return this.notificationsService.getMyNotifications(req.user.id);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Put('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllRead(@Req() req: any) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  async markRead(@Req() req: any, @Param('id') notificationId: string) {
    return this.notificationsService.markRead(req.user.id, notificationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Param('id') notificationId: string) {
    return this.notificationsService.delete(req.user.id, notificationId);
  }
}
