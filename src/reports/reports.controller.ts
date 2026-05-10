import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DateRangeDto } from './dto/date-range.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('completed-per-user')
  @ApiOperation({ summary: 'Get completed task count for the current user' })
  @ApiResponse({ status: 200, description: 'Completed task count for current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCompletedTasksPerUser(@CurrentUser() user: { userId: string }) {
    return this.reportsService.getCompletedTasksPerUser(user.userId);
  }

  @Get('completed-over-time')
  @ApiOperation({ summary: 'Get completed tasks grouped by day within a date range' })
  @ApiResponse({ status: 200, description: 'Completed tasks grouped by day' })
  @ApiResponse({ status: 400, description: 'Invalid or out-of-range dates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTasksCompletedOverTime(
    @Query() dto: DateRangeDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.reportsService.getTasksCompletedOverTime(
      user.userId,
      new Date(dto.from),
      new Date(dto.to),
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks for the current user' })
  @ApiResponse({ status: 200, description: 'List of overdue tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getOverdueTasks(@CurrentUser() user: { userId: string }) {
    return this.reportsService.getOverdueTasks(user.userId);
  }
}
