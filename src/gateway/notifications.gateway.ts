import { Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { NotificationPreferences } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

const DEFAULT_PREFS: NotificationPreferences = {
  deadlineReminders: true,
  taskAssigned: true,
  taskUpdated: true,
};

const PREFS_TTL_MS = 300_000;
const WS_MAX_CONN_PER_MIN = 20;
const WS_CONN_WINDOW_MS = 60_000;

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const ip = client.handshake.address;
    if (await this.isConnectionRateLimited(ip)) {
      client.emit('error', { message: 'Too many connections' });
      client.disconnect(true);
      return;
    }

    try {
      this.wsJwtGuard.validateClient(client);
      const userId = client.data.userId as string;
      client.join(userId);
      this.logger.log(`User ${userId} connected (socket ${client.id})`);
    } catch {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  private async isConnectionRateLimited(ip: string): Promise<boolean> {
    const key = `ws-conn-rate:${ip}`;
    const count = (await this.cacheManager.get<number>(key)) ?? 0;
    if (count >= WS_MAX_CONN_PER_MIN) return true;
    await this.cacheManager.set(key, count + 1, WS_CONN_WINDOW_MS);
    return false;
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.logger.log(`User ${userId} disconnected (socket ${client.id})`);
    }
  }

  async notifyTaskAssigned(userId: string, task: any): Promise<void> {
    const prefs = await this.getPrefs(userId);
    if (prefs.taskAssigned !== false) {
      this.server.to(userId).emit('task-assigned', task);
    }
  }

  async notifyTaskUpdated(userId: string, task: any): Promise<void> {
    const prefs = await this.getPrefs(userId);
    if (prefs.taskUpdated !== false) {
      this.server.to(userId).emit('task-updated', task);
    }
  }

  async notifyDeadlineReminder(userId: string, task: any): Promise<void> {
    const prefs = await this.getPrefs(userId);
    if (prefs.deadlineReminders !== false) {
      this.server.to(userId).emit('deadline-reminder', task);
    }
  }

  private async getPrefs(userId: string): Promise<NotificationPreferences> {
    const key = `prefs:${userId}`;
    const cached = await this.cacheManager.get<NotificationPreferences>(key);
    if (cached) return cached;

    const user = await this.usersService.findById(userId);
    const prefs = user?.notificationPreferences ?? DEFAULT_PREFS;
    await this.cacheManager.set(key, prefs, PREFS_TTL_MS);
    return prefs;
  }
}
