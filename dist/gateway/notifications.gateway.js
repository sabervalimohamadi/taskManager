"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    userSocketMap = new Map();
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (!userId) {
            client.disconnect();
            return;
        }
        this.userSocketMap.set(userId, client.id);
        client.join(userId);
        this.logger.log(`[Gateway] User ${userId} connected`);
    }
    handleDisconnect(client) {
        let disconnectedUserId;
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
    notifyTaskAssigned(userId, task) {
        this.server.to(userId).emit('task-assigned', task);
    }
    notifyTaskUpdated(userId, task) {
        this.server.to(userId).emit('task-updated', task);
    }
    notifyDeadlineReminder(userId, task) {
        this.server.to(userId).emit('deadline-reminder', task);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } })
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map