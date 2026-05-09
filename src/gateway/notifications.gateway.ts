import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSocketMap = new Map<string, string>();

  handleConnection(client: Socket): void {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }
    this.userSocketMap.set(userId, client.id);
    client.join(userId);
    this.logger.log(`[Gateway] User ${userId} connected`);
  }

  handleDisconnect(client: Socket): void {
    let disconnectedUserId: string | undefined;
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      this.userSocketMap.delete(disconnectedUserId);
      this.logger.log(`[Gateway] User ${disconnectedUserId} disconnected`);
    }
  }

  notifyTaskAssigned(userId: string, task: any): void {
    this.server.to(userId).emit('task-assigned', task);
  }

  notifyTaskUpdated(userId: string, task: any): void {
    this.server.to(userId).emit('task-updated', task);
  }

  notifyDeadlineReminder(userId: string, task: any): void {
    this.server.to(userId).emit('deadline-reminder', task);
  }
}
