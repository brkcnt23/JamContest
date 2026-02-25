import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  async getMyConversations(@Req() req: any) {
    return this.messagesService.getMyConversations(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    return this.messagesService.getUnreadCount(req.user.id);
  }

  @Post('conversations')
  async getOrCreateConversation(@Req() req: any, @Body() body: { otherUserId: string }) {
    return this.messagesService.getOrCreateConversation(req.user.id, body.otherUserId);
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const takeNum = take ? parseInt(take) : 50;
    const skipNum = skip ? parseInt(skip) : 0;
    return this.messagesService.getMessages(req.user.id, conversationId, takeNum, skipNum);
  }

  @Post('conversations/:conversationId/messages')
  async sendMessage(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Body() body: { body: string },
  ) {
    return this.messagesService.sendMessage(req.user.id, conversationId, body.body);
  }

  @Put('messages/:messageId')
  async editMessage(
    @Req() req: any,
    @Param('messageId') messageId: string,
    @Body() body: { body: string },
  ) {
    return this.messagesService.editMessage(req.user.id, messageId, body.body);
  }

  @Delete('messages/:messageId')
  async deleteMessage(
    @Req() req: any,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.deleteMessage(req.user.id, messageId);
  }

  @Put('conversations/:conversationId/read')
  async markAsRead(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.markAsRead(req.user.id, conversationId);
  }
}
