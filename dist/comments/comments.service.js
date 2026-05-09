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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("../tasks/schemas/task.schema");
const comment_schema_1 = require("./schemas/comment.schema");
let CommentsService = class CommentsService {
    commentModel;
    taskModel;
    constructor(commentModel, taskModel) {
        this.commentModel = commentModel;
        this.taskModel = taskModel;
    }
    async addComment(taskId, userId, content) {
        const task = await this.taskModel.findById(taskId).exec();
        if (!task)
            throw new common_1.NotFoundException(`Task ${taskId} not found`);
        const comment = new this.commentModel({
            content,
            taskId: new mongoose_2.Types.ObjectId(taskId),
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        return comment.save();
    }
    async getComments(taskId) {
        return this.commentModel
            .find({ taskId: new mongoose_2.Types.ObjectId(taskId) })
            .sort({ createdAt: 1 })
            .populate('userId', 'name')
            .exec();
    }
    async deleteComment(commentId, userId) {
        const comment = await this.commentModel.findById(commentId).exec();
        if (!comment)
            throw new common_1.NotFoundException(`Comment ${commentId} not found`);
        if (comment.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('Only the comment author can delete this comment');
        }
        await comment.deleteOne();
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __param(1, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CommentsService);
//# sourceMappingURL=comments.service.js.map