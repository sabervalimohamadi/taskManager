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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notifications_gateway_1 = require("../gateway/notifications.gateway");
const task_schema_1 = require("../tasks/schemas/task.schema");
let QueueProcessor = QueueProcessor_1 = class QueueProcessor {
    taskModel;
    notificationsGateway;
    logger = new common_1.Logger(QueueProcessor_1.name);
    constructor(taskModel, notificationsGateway) {
        this.taskModel = taskModel;
        this.notificationsGateway = notificationsGateway;
    }
    async handleDeadlineReminder(job) {
        const { taskId } = job.data;
        const task = await this.taskModel
            .findById(taskId)
            .populate('userId')
            .populate('assignedTo')
            .exec();
        if (!task) {
            this.logger.warn(`Task ${taskId} not found for deadline reminder`);
            return;
        }
        const ownerId = task.userId._id.toString();
        const payload = { taskId, title: task.title, dueDate: task.dueDate };
        this.notificationsGateway.notifyDeadlineReminder(ownerId, payload);
        if (task.assignedTo) {
            const assigneeId = task.assignedTo._id.toString();
            if (assigneeId !== ownerId) {
                this.notificationsGateway.notifyDeadlineReminder(assigneeId, payload);
            }
        }
    }
    onFailed(job, error) {
        this.logger.error({
            jobId: job.id,
            taskId: job.data.taskId,
            attempt: job.attemptsMade,
            error: error.message,
        });
    }
    onCompleted(job) {
        this.logger.log({ jobId: job.id, taskId: job.data.taskId });
    }
};
exports.QueueProcessor = QueueProcessor;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QueueProcessor.prototype, "handleDeadlineReminder", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], QueueProcessor.prototype, "onFailed", null);
__decorate([
    (0, bull_1.OnQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QueueProcessor.prototype, "onCompleted", null);
exports.QueueProcessor = QueueProcessor = QueueProcessor_1 = __decorate([
    (0, bull_1.Processor)('task-deadlines'),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], QueueProcessor);
//# sourceMappingURL=queue.processor.js.map