import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActivityLogService } from './activity-log.service';

@ApiTags('activity-log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get('tasks/:taskId/activity')
  @ApiOperation({ summary: 'Get activity log for a task' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiResponse({ status: 200, description: 'Activity log entries for the task' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getLogsForTask(@Param('taskId') taskId: string) {
    return this.activityLogService.getLogsForTask(taskId);
  }
}
