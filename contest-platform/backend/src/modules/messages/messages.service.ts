import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getMyConversations(userId: string) {
    const conversations = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { id: true, body: true, createdAt: true, senderId: true },
            },
            participants: {
              where: { userId: { not: userId } },
              include: {
                user: {
                  select: { id: true, username: true, displayName: true, avatar: true },
                },
              },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return conversations.map((cp) => ({
      conversationId: cp.conversation.id,
      updatedAt: cp.conversation.updatedAt,
      lastMessage: cp.conversation.messages[0] || null,
      otherParticipant: cp.conversation.participants[0]?.user || null,
    }));
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestException('Kendi kendinize mesaj gönderemezsiniz');
    }

    // Find existing conversation
    const existing = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: [userId, otherUserId] },
          },
        },
      },
      include: { participants: true },
    });

    if (existing && existing.participants.length === 2) {
      return { conversationId: existing.id };
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: otherUserId },
          ],
        },
      },
    });

    return { conversationId: conversation.id };
  }

  async getMessages(userId: string, conversationId: string, take = 50, skip = 0) {
    // Verify user is participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Bu sohbete erişim yetkiniz yok');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return messages.reverse();
  }

  async sendMessage(userId: string, conversationId: string, body: string) {
    // Verify user is participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Bu sohbete mesaj gönderme yetkiniz yok');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        body,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    // Update conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async editMessage(userId: string, messageId: string, body: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Mesaj bulunamadı');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Sadece kendi mesajlarınızı düzenleyebilirsiniz');
    }

    if (message.deletedAt) {
      throw new BadRequestException('Silinen mesajlar düzenlenemez');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        body,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Mesaj bulunamadı');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Sadece kendi mesajlarınızı silebilirsiniz');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });
  }

  async markAsRead(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Bu sohbete erişim yetkiniz yok');
    }

    return this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            messages: {
              where: {
                senderId: { not: userId },
                createdAt: { gt: new Date((await this.prisma.conversationParticipant.findUnique({
                  where: { conversationId_userId: { conversationId: '', userId } },
                }))?.lastReadAt || new Date(0)) },
              },
              select: { id: true },
            },
          },
        },
      },
    });

    // This approach is inefficient. Let's use a simpler method:
    const conversationIds = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    let totalUnread = 0;
    for (const cp of conversationIds) {
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: cp.conversationId, userId } },
      });

      const unreadCount = await this.prisma.message.count({
        where: {
          conversationId: cp.conversationId,
          senderId: { not: userId },
          createdAt: { gt: participant?.lastReadAt || new Date(0) },
        },
      });

      totalUnread += unreadCount;
    }

    return { count: totalUnread };
  }
}
