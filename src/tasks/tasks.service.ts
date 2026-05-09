import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ActivityAction,
} from '../activity-log/schemas/activity-log.schema';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';
import { QueueService } from '../queue/queue.service';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly activityLogService: ActivityLogService,
    private readonly queueService: QueueService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    const task = new this.taskModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      assignedTo: dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    const saved = await task.save();

    await this.activityLogService.log(saved._id.toString(), userId, ActivityAction.CREATED);

    if (dto.dueDate) {
      await this.queueService.scheduleDeadlineJob(saved);
    }

    return saved;
  }

  async findAll(
    userId: string,
    query: QueryTaskDto,
  ): Promise<{ data: TaskDocument[]; total: number; page: number; limit: number }> {
    const { status, priority, assignedTo, dueDateFrom, dueDateTo } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filter: Record<string, any> = {
      $or: [
        { userId: new Types.ObjectId(userId) },
        { assignedTo: new Types.ObjectId(userId) },
      ],
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = new Types.ObjectId(assignedTo);
    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.taskModel.find(filter).skip(skip).limit(limit).exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({
        _id: new Types.ObjectId(id),
        $or: [
          { userId: new Types.ObjectId(userId) },
          { assignedTo: new Types.ObjectId(userId) },
        ],
      })
      .exec();

    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({
        _id: new Types.ObjectId(id),
        $or: [
          { userId: new Types.ObjectId(userId) },
          { assignedTo: new Types.ObjectId(userId) },
        ],
      })
      .exec();

    if (!task) throw new NotFoundException(`Task ${id} not found`);
    if (task.version !== dto.version) {
      throw new ConflictException(
        `Optimistic lock conflict: expected version ${task.version}, got ${dto.version}`,
      );
    }

    const beforeStatus = task.status;
    const beforeAssignedTo = task.assignedTo?.toString();
    const beforeDueDate = task.dueDate;

    const { version: _v, ...updates } = dto;
    Object.assign(task, {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.priority !== undefined && { priority: updates.priority }),
      ...(updates.dueDate !== undefined && { dueDate: new Date(updates.dueDate) }),
      ...(updates.assignedTo !== undefined && {
        assignedTo: new Types.ObjectId(updates.assignedTo),
      }),
    });
    task.version += 1;

    const saved = await task.save();

    await this.activityLogService.log(id, userId, ActivityAction.UPDATED, {
      before: { status: beforeStatus, assignedTo: beforeAssignedTo, dueDate: beforeDueDate },
      after: {
        status: saved.status,
        assignedTo: saved.assignedTo?.toString(),
        dueDate: saved.dueDate,
      },
    });

    const assignedToChanged =
      updates.assignedTo !== undefined && updates.assignedTo !== beforeAssignedTo;
    if (assignedToChanged) {
      await this.activityLogService.log(id, userId, ActivityAction.ASSIGNED, {
        assignedTo: updates.assignedTo,
      });
      this.notificationsGateway.notifyTaskAssigned(updates.assignedTo!, saved);
    }

    const statusChanged = updates.status !== undefined && updates.status !== beforeStatus;
    if (statusChanged) {
      await this.activityLogService.log(id, userId, ActivityAction.STATUS_CHANGED, {
        from: beforeStatus,
        to: saved.status,
      });
    }

    this.notificationsGateway.notifyTaskUpdated(task.userId.toString(), saved);

    const dueDateChanged =
      updates.dueDate !== undefined &&
      new Date(updates.dueDate).getTime() !== beforeDueDate?.getTime();
    if (dueDateChanged) {
      await this.queueService.cancelDeadlineJob(id);
      await this.queueService.scheduleDeadlineJob(saved);
    }

    return saved;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.taskModel.findById(new Types.ObjectId(id)).exec();
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    if (task.userId.toString() !== userId) {
      throw new ForbiddenException('Only the task owner can delete this task');
    }
    await task.deleteOne();
  }

  async assignTask(
    taskId: string,
    dto: AssignTaskDto,
    requestingUserId: string,
  ): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({
        _id: new Types.ObjectId(taskId),
        $or: [
          { userId: new Types.ObjectId(requestingUserId) },
          { assignedTo: new Types.ObjectId(requestingUserId) },
        ],
      })
      .exec();

    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    task.assignedTo = new Types.ObjectId(dto.assigneeId);
    task.version += 1;
    const saved = await task.save();

    await this.activityLogService.log(taskId, requestingUserId, ActivityAction.ASSIGNED, {
      assignedTo: dto.assigneeId,
    });
    this.notificationsGateway.notifyTaskAssigned(dto.assigneeId, saved);

    return saved;
  }
}
