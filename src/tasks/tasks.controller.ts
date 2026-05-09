import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority, TaskStatus } from './schemas/task.schema';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks owned by or assigned to the current user' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'Filter by assigned user ID' })
  @ApiQuery({ name: 'dueDateFrom', required: false, description: 'ISO 8601 lower bound' })
  @ApiQuery({ name: 'dueDateTo', required: false, description: 'ISO 8601 upper bound' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10, max 100)' })
  @ApiResponse({ status: 200, description: 'Paginated task list' })
  findAll(@CurrentUser() user: { userId: string }, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll(user.userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({ name: 'id', description: 'Task ObjectId' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseMongoIdPipe) id: string, @CurrentUser() user: { userId: string }) {
    return this.tasksService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (requires current version for optimistic locking)' })
  @ApiParam({ name: 'id', description: 'Task ObjectId' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 409, description: 'Optimistic lock conflict' })
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task (owner only)' })
  @ApiParam({ name: 'id', description: 'Task ObjectId' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  @ApiResponse({ status: 403, description: 'Not the task owner' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id', ParseMongoIdPipe) id: string, @CurrentUser() user: { userId: string }) {
    return this.tasksService.remove(id, user.userId);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign a task to another user' })
  @ApiParam({ name: 'id', description: 'Task ObjectId' })
  @ApiResponse({ status: 201, description: 'Task assigned' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  assignTask(
    @Param('id', ParseMongoIdPipe) taskId: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.assignTask(taskId, dto, user.userId);
  }
}
