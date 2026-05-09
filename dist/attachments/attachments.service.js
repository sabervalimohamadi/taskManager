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
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("../tasks/schemas/task.schema");
const attachment_schema_1 = require("./schemas/attachment.schema");
let AttachmentsService = class AttachmentsService {
    attachmentModel;
    taskModel;
    constructor(attachmentModel, taskModel) {
        this.attachmentModel = attachmentModel;
        this.taskModel = taskModel;
    }
    async addAttachment(taskId, userId, dto) {
        const task = await this.taskModel.findById(taskId).exec();
        if (!task)
            throw new common_1.NotFoundException(`Task ${taskId} not found`);
        const attachment = new this.attachmentModel({
            ...dto,
            taskId: new mongoose_2.Types.ObjectId(taskId),
            uploadedBy: new mongoose_2.Types.ObjectId(userId),
        });
        return attachment.save();
    }
    async getAttachments(taskId) {
        return this.attachmentModel
            .find({ taskId: new mongoose_2.Types.ObjectId(taskId) })
            .exec();
    }
    async deleteAttachment(attachmentId, userId) {
        const attachment = await this.attachmentModel.findById(attachmentId).exec();
        if (!attachment) {
            throw new common_1.NotFoundException(`Attachment ${attachmentId} not found`);
        }
        if (attachment.uploadedBy.toString() !== userId) {
            throw new common_1.ForbiddenException('Only the uploader can delete this attachment');
        }
        await attachment.deleteOne();
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attachment_schema_1.Attachment.name)),
    __param(1, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map