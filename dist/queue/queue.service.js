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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let QueueService = QueueService_1 = class QueueService {
    deadlineQueue;
    logger = new common_1.Logger(QueueService_1.name);
    constructor(deadlineQueue) {
        this.deadlineQueue = deadlineQueue;
    }
    async scheduleDeadlineJob(task) {
        const delay = task.dueDate.getTime() - Date.now() - 30 * 60 * 1000;
        if (delay <= 0) {
            this.logger.warn(`Skipping deadline job for task ${task._id}: due date is past or within 30 min`);
            return;
        }
        await this.deadlineQueue.add({ taskId: task._id.toString() }, {
            jobId: `deadline-${task._id}`,
            delay,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            removeOnFail: false,
        });
    }
    async cancelDeadlineJob(taskId) {
        const job = await this.deadlineQueue.getJob(`deadline-${taskId}`);
        if (job) {
            await job.remove();
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('task-deadlines')),
    __metadata("design:paramtypes", [Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map