import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  private async isPro(userId: string): Promise<boolean> {
    const proBadge = await this.prisma.badge.findUnique({ where: { type: 'PRO' } });
    if (!proBadge) return false;
    const ub = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: proBadge.id } },
    });
    return !!ub;
  }

  private async isMutualFollow(userA: string, userB: string): Promise<boolean> {
    const [ab, ba] = await Promise.all([
      this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userA, followingId: userB } } }),
      this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userB, followingId: userA } } }),
    ]);
    return !!ab && !!ba;
  }

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
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return conversations.map(cp => ({
      conversationId: cp.conversation.id,
      updatedAt: cp.conversation.updatedAt,
      lastMessage: cp.conversation.messages[0] || null,
      otherParticipant: cp.conversation.participants[0]?.user || null,
    }));
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) throw new BadRequestException('Kendi kendinize mesaj gönderemezsiniz');

    // Mesajlaşma izni: mutual follow VEYA pro
    const [mutual, pro] = await Promise.all([
      this.isMutualFollow(userId, otherUserId),
      this.isPro(userId),
    ]);

    if (!mutual && !pro) {
      // Admin/SuperAdmin her zaman mesaj atabilir
      const sender = await this.prisma.user.findUnique({ where: { id: userId }, select: { globalRole: true } });
      if (!sender || !['ADMIN', 'SUPER_ADMIN'].includes(sender.globalRole)) {
        throw new ForbiddenException('Mesaj atabilmek için karşılıklı takip etmeniz gerekiyor. Pro üyelik ile herkese mesaj atabilirsiniz.');
      }
    }

    // Mevcut konuşmayı bul
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: { participants: true },
    });

    if (existing && existing.participants.length === 2) {
      return { conversationId: existing.id };
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
    });

    return { conversationId: conversation.id };
  }

  async getMessages(userId: string, conversationId: string, take = 50, skip = 0) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new ForbiddenException('Bu sohbete erişim yetkiniz yok');

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return messages.reverse();
  }

  async sendMessage(userId: string, conversationId: string, body: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new ForbiddenException('Bu sohbete mesaj gönderme yetkiniz yok');

    const message = await this.prisma.message.create({
      data: { conversationId, senderId: userId, body },
      include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });

    await this.prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return message;
  }

  async editMessage(userId: string, messageId: string, body: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Mesaj bulunamadı');
    if (message.senderId !== userId) throw new ForbiddenException('Sadece kendi mesajlarınızı düzenleyebilirsiniz');
    if (message.deletedAt) throw new BadRequestException('Silinen mesajlar düzenlenemez');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { body, editedAt: new Date() },
      include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Mesaj bulunamadı');
    if (message.senderId !== userId) throw new ForbiddenException('Sadece kendi mesajlarınızı silebilirsiniz');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
      include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });
  }

  async markAsRead(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new ForbiddenException('Erişim yok');

    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  async getConversationParticipants(conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { participants: { select: { userId: true } } },
    });
    return conv?.participants ?? [];
  }

  async getUnreadCount(userId: string) {
    const participations = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });

    let total = 0;
    await Promise.all(
      participations.map(async p => {
        const count = await this.prisma.message.count({
          where: {
            conversationId: p.conversationId,
            senderId: { not: userId },
            createdAt: { gt: p.lastReadAt },
          },
        });
        total += count;
      }),
    );

    return { count: total };
  }
}
