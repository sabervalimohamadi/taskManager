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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_log_schema_1 = require("../activity-log/schemas/activity-log.schema");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const notifications_gateway_1 = require("../gateway/notifications.gateway");
const queue_service_1 = require("../queue/queue.service");
const task_schema_1 = require("./schemas/task.schema");
let TasksService = class TasksService {
    taskModel;
    activityLogService;
    queueService;
    notificationsGateway;
    constructor(taskModel, activityLogService, queueService, notificationsGateway) {
        this.taskModel = taskModel;
        this.activityLogService = activityLogService;
        this.queueService = queueService;
        this.notificationsGateway = notificationsGateway;
    }
    async create(userId, dto) {
        const task = new this.taskModel({
            ...dto,
            userId: new mongoose_2.Types.ObjectId(userId),
            assignedTo: dto.assignedTo ? new mongoose_2.Types.ObjectId(dto.assignedTo) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        });
        const saved = await task.save();
        await this.activityLogService.log(saved._id.toString(), userId, activity_log_schema_1.ActivityAction.CREATED);
        if (dto.dueDate) {
            await this.queueService.scheduleDeadlineJob(saved);
        }
        return saved;
    }
    async findAll(userId, query) {
        const { status, priority, assignedTo, dueDateFrom, dueDateTo } = query;
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const filter = {
            $or: [
                { userId: new mongoose_2.Types.ObjectId(userId) },
                { assignedTo: new mongoose_2.Types.ObjectId(userId) },
            ],
        };
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        if (assignedTo)
            filter.assignedTo = new mongoose_2.Types.ObjectId(assignedTo);
        if (dueDateFrom || dueDateTo) {
            filter.dueDate = {};
            if (dueDateFrom)
                filter.dueDate.$gte = new Date(dueDateFrom);
            if (dueDateTo)
                filter.dueDate.$lte = new Date(dueDateTo);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.taskModel.find(filter).skip(skip).limit(limit).exec(),
            this.taskModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async findOne(id, userId) {
        const task = await this.taskModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(id),
            $or: [
                { userId: new mongoose_2.Types.ObjectId(userId) },
                { assignedTo: new mongoose_2.Types.ObjectId(userId) },
            ],
        })
            .exec();
        if (!task)
            throw new common_1.NotFoundException(`Task ${id} not found`);
        return task;
    }
    async update(id, userId, dto) {
        const { version, ...updates } = dto;
        const $set = {};
        if (updates.title !== undefined)
            $set.title = updates.title;
        if (updates.description !== undefined)
            $set.description = updates.description;
        if (updates.status !== undefined)
            $set.status = updates.status;
        if (updates.priority !== undefined)
            $set.priority = updates.priority;
        if (updates.dueDate !== undefined)
            $set.dueDate = new Date(updates.dueDate);
        if (updates.assignedTo !== undefined)
            $set.assignedTo = new mongoose_2.Types.ObjectId(updates.assignedTo);
        const oldTask = await this.taskModel
            .findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(id),
            version,
            $or: [
                { userId: new mongoose_2.Types.ObjectId(userId) },
                { assignedTo: new mongoose_2.Types.ObjectId(userId) },
            ],
        }, { $set, $inc: { version: 1 } }, { new: false })
            .exec();
        if (!oldTask) {
            throw new common_1.ConflictException('Task was modified by another request. Please reload and retry.');
        }
        const saved = await this.taskModel.findById(new mongoose_2.Types.ObjectId(id)).exec();
        await this.activityLogService.log(id, userId, activity_log_schema_1.ActivityAction.UPDATED, {
            before: {
                status: oldTask.status,
                assignedTo: oldTask.assignedTo?.toString(),
                dueDate: oldTask.dueDate,
            },
            after: {
                status: saved.status,
                assignedTo: saved.assignedTo?.toString(),
                dueDate: saved.dueDate,
            },
        });
        const assignedToChanged = updates.assignedTo !== undefined && updates.assignedTo !== oldTask.assignedTo?.toString();
        if (assignedToChanged) {
            await this.activityLogService.log(id, userId, activity_log_schema_1.ActivityAction.ASSIGNED, {
                assignedTo: updates.assignedTo,
            });
            this.notificationsGateway.notifyTaskAssigned(updates.assignedTo, saved);
        }
        const statusChanged = updates.status !== undefined && updates.status !== oldTask.status;
        if (statusChanged) {
            await this.activityLogService.log(id, userId, activity_log_schema_1.ActivityAction.STATUS_CHANGED, {
                from: oldTask.status,
                to: saved.status,
            });
        }
        this.notificationsGateway.notifyTaskUpdated(oldTask.userId.toString(), saved);
        const dueDateChanged = updates.dueDate !== undefined &&
            new Date(updates.dueDate).getTime() !== oldTask.dueDate?.getTime();
        if (dueDateChanged) {
            await this.queueService.cancelDeadlineJob(id);
            await this.queueService.scheduleDeadlineJob(saved);
        }
        return saved;
    }
    async remove(id, userId) {
        const task = await this.taskModel.findById(new mongoose_2.Types.ObjectId(id)).exec();
        if (!task)
            throw new common_1.NotFoundException(`Task ${id} not found`);
        if (task.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('Only the task owner can delete this task');
        }
        await task.deleteOne();
    }
    async assignTask(taskId, dto, requestingUserId) {
        const task = await this.taskModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(taskId),
            $or: [
                { userId: new mongoose_2.Types.ObjectId(requestingUserId) },
                { assignedTo: new mongoose_2.Types.ObjectId(requestingUserId) },
            ],
        })
            .exec();
        if (!task)
            throw new common_1.NotFoundException(`Task ${taskId} not found`);
        task.assignedTo = new mongoose_2.Types.ObjectId(dto.assigneeId);
        task.version += 1;
        const saved = await task.save();
        await this.activityLogService.log(taskId, requestingUserId, activity_log_schema_1.ActivityAction.ASSIGNED, {
            assignedTo: dto.assigneeId,
        });
        this.notificationsGateway.notifyTaskAssigned(dto.assigneeId, saved);
        return saved;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        activity_log_service_1.ActivityLogService,
        queue_service_1.QueueService,
        notifications_gateway_1.NotificationsGateway])
], TasksService);
//# sourceMappingURL=tasks.service.js.map