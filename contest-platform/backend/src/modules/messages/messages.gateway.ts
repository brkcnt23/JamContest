import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/messages' })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private userSockets = new Map<string, string>(); // userId → socketId

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string;
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      client.data.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) this.userSockets.delete(client.data.userId);
  }

  @SubscribeMessage('join_conversation')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() convId: string) {
    client.join(`conv:${convId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() convId: string) {
    client.leave(`conv:${convId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; body: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.body?.trim()) return;

    try {
      const msg = await this.messagesService.sendMessage(userId, payload.conversationId, payload.body);
      // broadcast to everyone in the room (including sender)
      this.server.to(`conv:${payload.conversationId}`).emit('new_message', msg);
      // notify other participant's socket if online but not in room
      const conv = await this.messagesService.getConversationParticipants(payload.conversationId);
      const otherUserId = conv.find((p: any) => p.userId !== userId)?.userId;
      if (otherUserId) {
        const otherSocketId = this.userSockets.get(otherUserId);
        if (otherSocketId) {
          this.server.to(otherSocketId).emit('conversation_updated', { conversationId: payload.conversationId });
        }
      }
    } catch { /* silent */ }
  }

  // Called externally when needed
  emitToConversation(convId: string, event: string, data: any) {
    this.server.to(`conv:${convId}`).emit(event, data);
  }
}
