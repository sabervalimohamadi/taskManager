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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const parse_mongo_id_pipe_1 = require("../common/pipes/parse-mongo-id.pipe");
const assign_task_dto_1 = require("./dto/assign-task.dto");
const create_task_dto_1 = require("./dto/create-task.dto");
const query_task_dto_1 = require("./dto/query-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const task_schema_1 = require("./schemas/task.schema");
const tasks_service_1 = require("./tasks.service");
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    findAll(user, query) {
        return this.tasksService.findAll(user.userId, query);
    }
    create(user, dto) {
        return this.tasksService.create(user.userId, dto);
    }
    findOne(id, user) {
        return this.tasksService.findOne(id, user.userId);
    }
    update(id, user, dto) {
        return this.tasksService.update(id, user.userId, dto);
    }
    remove(id, user) {
        return this.tasksService.remove(id, user.userId);
    }
    assignTask(taskId, dto, user) {
        return this.tasksService.assignTask(taskId, dto, user.userId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List tasks owned by or assigned to the current user' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: task_schema_1.TaskStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'priority', enum: task_schema_1.TaskPriority, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'assignedTo', required: false, description: 'Filter by assigned user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'dueDateFrom', required: false, description: 'ISO 8601 lower bound' }),
    (0, swagger_1.ApiQuery)({ name: 'dueDateTo', required: false, description: 'ISO 8601 upper bound' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10, max 100)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated task list' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_task_dto_1.QueryTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new task' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Task created' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single task by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, common_1.Param)('id', parse_mongo_id_pipe_1.ParseMongoIdPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a task (requires current version for optimistic locking)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Optimistic lock conflict' }),
    __param(0, (0, common_1.Param)('id', parse_mongo_id_pipe_1.ParseMongoIdPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a task (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Task deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the task owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, common_1.Param)('id', parse_mongo_id_pipe_1.ParseMongoIdPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a task to another user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Task ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Task assigned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    __param(0, (0, common_1.Param)('id', parse_mongo_id_pipe_1.ParseMongoIdPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_task_dto_1.AssignTaskDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "assignTask", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map