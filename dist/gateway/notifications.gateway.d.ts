import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private readonly userSocketMap;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    notifyTaskAssigned(userId: string, task: any): void;
    notifyTaskUpdated(userId: string, task: any): void;
    notifyDeadlineReminder(userId: string, task: any): void;
}
