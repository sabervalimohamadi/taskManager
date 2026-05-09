import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('completed-per-user')
  @ApiOperation({ summary: 'Get completed task count grouped by user' })
  @ApiResponse({ status: 200, description: 'Completed tasks aggregated per user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCompletedTasksPerUser() {
    return this.reportsService.getCompletedTasksPerUser();
  }

  @Get('completed-over-time')
  @ApiOperation({ summary: 'Get completed tasks grouped by day within a date range' })
  @ApiQuery({ name: 'from', required: true, example: '2026-01-01', description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'to', required: true, example: '2026-12-31', description: 'End date (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Completed tasks grouped by day' })
  @ApiResponse({ status: 400, description: 'Invalid date range' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTasksCompletedOverTime(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getTasksCompletedOverTime(
      new Date(from),
      new Date(to),
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get all overdue tasks' })
  @ApiResponse({ status: 200, description: 'List of overdue tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getOverdueTasks() {
    return this.reportsService.getOverdueTasks();
  }
}
