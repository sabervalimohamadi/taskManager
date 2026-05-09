import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly usersService;
    server: Server;
    private readonly logger;
    private readonly userSocketMap;
    constructor(usersService: UsersService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    notifyTaskAssigned(userId: string, task: any): Promise<void>;
    notifyTaskUpdated(userId: string, task: any): Promise<void>;
    notifyDeadlineReminder(userId: string, task: any): Promise<void>;
}
