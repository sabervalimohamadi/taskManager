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
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const comments_service_1 = require("./comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
let CommentsController = class CommentsController {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    addComment(taskId, user, dto) {
        return this.commentsService.addComment(taskId, user.userId, dto.content);
    }
    getComments(taskId) {
        return this.commentsService.getComments(taskId);
    }
    deleteComment(commentId, user) {
        return this.commentsService.deleteComment(commentId, user.userId);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)('tasks/:taskId/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a comment to a task' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Comment created' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all comments for a task' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of comments' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId/comments/:commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a comment (author only)' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task ObjectId' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comment deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden — not the comment author' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comment not found' }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "deleteComment", null);
exports.CommentsController = CommentsController = __decorate([
    (0, swagger_1.ApiTags)('comments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map