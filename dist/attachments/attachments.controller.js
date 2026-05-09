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
exports.AttachmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const attachments_service_1 = require("./attachments.service");
const create_attachment_dto_1 = require("./dto/create-attachment.dto");
let AttachmentsController = class AttachmentsController {
    attachmentsService;
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    addAttachment(taskId, user, dto) {
        return this.attachmentsService.addAttachment(taskId, user.userId, dto);
    }
    getAttachments(taskId) {
        return this.attachmentsService.getAttachments(taskId);
    }
    deleteAttachment(attachmentId, user) {
        return this.attachmentsService.deleteAttachment(attachmentId, user.userId);
    }
};
exports.AttachmentsController = AttachmentsController;
__decorate([
    (0, common_1.Post)('tasks/:taskId/attachments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add an attachment record to a task' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Attachment metadata saved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_attachment_dto_1.CreateAttachmentDto]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/attachments'),
    (0, swagger_1.ApiOperation)({ summary: 'List attachments for a task' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of attachment records' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "getAttachments", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId/attachments/:attachmentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an attachment record (uploader only)' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ObjectId' }),
    (0, swagger_1.ApiParam)({ name: 'attachmentId', description: 'Attachment ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attachment deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden — not the uploader' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attachment not found' }),
    __param(0, (0, common_1.Param)('attachmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "deleteAttachment", null);
exports.AttachmentsController = AttachmentsController = __decorate([
    (0, swagger_1.ApiTags)('attachments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], AttachmentsController);
//# sourceMappingURL=attachments.controller.js.map