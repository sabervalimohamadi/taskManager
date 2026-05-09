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
exports.ReportsService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("../tasks/schemas/task.schema");
const user_schema_1 = require("../users/schemas/user.schema");
let ReportsService = class ReportsService {
    taskModel;
    userModel;
    cacheManager;
    constructor(taskModel, userModel, cacheManager) {
        this.taskModel = taskModel;
        this.userModel = userModel;
        this.cacheManager = cacheManager;
    }
    async getCompletedTasksPerUser() {
        const cacheKey = 'report:completed-per-user';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const result = await this.taskModel.aggregate([
            { $match: { status: task_schema_1.TaskStatus.DONE } },
            { $group: { _id: '$userId', completedCount: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: 0,
                    user: {
                        id: '$_id',
                        name: '$userInfo.name',
                        email: '$userInfo.email',
                    },
                    completedCount: 1,
                },
            },
        ]);
        await this.cacheManager.set(cacheKey, result, 60000);
        return result;
    }
    async getTasksCompletedOverTime(from, to) {
        return this.taskModel.aggregate([
            {
                $match: {
                    status: task_schema_1.TaskStatus.DONE,
                    createdAt: { $gte: from, $lte: to },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: '$_id', count: 1 } },
        ]);
    }
    async getOverdueTasks() {
        const cacheKey = 'report:overdue';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const result = await this.taskModel
            .find({
            dueDate: { $lt: new Date() },
            status: { $ne: task_schema_1.TaskStatus.DONE },
        })
            .populate('userId', 'name email')
            .populate('assignedTo', 'name email')
            .exec();
        await this.cacheManager.set(cacheKey, result, 30000);
        return result;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model, Object])
], ReportsService);
//# sourceMappingURL=reports.service.js.map