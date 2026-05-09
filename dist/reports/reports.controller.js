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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getCompletedTasksPerUser() {
        return this.reportsService.getCompletedTasksPerUser();
    }
    getTasksCompletedOverTime(from, to) {
        return this.reportsService.getTasksCompletedOverTime(new Date(from), new Date(to));
    }
    getOverdueTasks() {
        return this.reportsService.getOverdueTasks();
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('completed-per-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Get completed task count grouped by user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Completed tasks aggregated per user' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCompletedTasksPerUser", null);
__decorate([
    (0, common_1.Get)('completed-over-time'),
    (0, swagger_1.ApiOperation)({ summary: 'Get completed tasks grouped by day within a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true, example: '2026-01-01', description: 'Start date (ISO 8601)' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true, example: '2026-12-31', description: 'End date (ISO 8601)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Completed tasks grouped by day' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid date range' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTasksCompletedOverTime", null);
__decorate([
    (0, common_1.Get)('overdue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all overdue tasks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of overdue tasks' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getOverdueTasks", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map