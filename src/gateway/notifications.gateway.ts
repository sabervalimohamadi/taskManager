import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { UsersService } from '../users/users.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSocketMap = new Map<string, string>();

  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly usersService: UsersService,
  ) {}

  handleConnection(client: Socket): void {
    try {
      this.wsJwtGuard.validateClient(client);
      const userId = client.data.userId as string;
      this.userSocketMap.set(userId, client.id);
      client.join(userId);
      this.logger.log(`User ${userId} connected (socket ${client.id})`);
    } catch {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
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
      this.logger.log(`User ${disconnectedUserId} disconnected`);
    }
  }

  async notifyTaskAssigned(userId: string, task: any): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (user?.notificationPreferences?.taskAssigned !== false) {
      this.server.to(userId).emit('task-assigned', task);
    }
  }

  async notifyTaskUpdated(userId: string, task: any): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (user?.notificationPreferences?.taskUpdated !== false) {
      this.server.to(userId).emit('task-updated', task);
    }
  }

  async notifyDeadlineReminder(userId: string, task: any): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (user?.notificationPreferences?.deadlineReminders !== false) {
      this.server.to(userId).emit('deadline-reminder', task);
    }
  }
}
