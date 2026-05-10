import { Controller, Get, Inject, Param, UseGuards, forwardRef } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { TasksService } from '../tasks/tasks.service';
import { ActivityLogService } from './activity-log.service';

@ApiTags('activity-log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ActivityLogController {
  constructor(
    private readonly activityLogService: ActivityLogService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  @Get('tasks/:taskId/activity')
  @ApiOperation({ summary: 'Get activity log for a task' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiResponse({
    status: 200,
    description: 'Activity log entries for the task',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found or access denied' })
  async getLogsForTask(
    @Param('taskId', ParseMongoIdPipe) taskId: string,
    @CurrentUser() user: { userId: string },
  ) {
    await this.tasksService.assertUserCanAccessTask(taskId, user.userId);
    return this.activityLogService.getLogsForTask(taskId);
  }
}
