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
    const { version, ...updates } = dto;

    const $set: Record<string, any> = {};
    if (updates.title !== undefined) $set.title = updates.title;
    if (updates.description !== undefined) $set.description = updates.description;
    if (updates.status !== undefined) $set.status = updates.status;
    if (updates.priority !== undefined) $set.priority = updates.priority;
    if (updates.dueDate !== undefined) $set.dueDate = new Date(updates.dueDate);
    if (updates.assignedTo !== undefined) $set.assignedTo = new Types.ObjectId(updates.assignedTo);

    const filter = {
      _id: new Types.ObjectId(id),
      version,
      $or: [
        { userId: new Types.ObjectId(userId) },
        { assignedTo: new Types.ObjectId(userId) },
      ],
    };

    const oldTask = await this.taskModel.findOne(filter).exec();
    if (!oldTask) {
      throw new ConflictException(
        'Task was modified by another request. Please reload and retry.',
      );
    }

    const saved = await this.taskModel
      .findOneAndUpdate(filter, { $set, $inc: { version: 1 } }, { new: true })
      .exec();

    if (!saved) {
      throw new ConflictException(
        'Task was modified by another request. Please reload and retry.',
      );
    }

    await this.activityLogService.log(id, userId, ActivityAction.UPDATED, {
      before: {
        status: oldTask.status,
        assignedTo: oldTask.assignedTo?.toString(),
        dueDate: oldTask.dueDate,
      },
      after: {
        status: saved.status,
        assignedTo: saved.assignedTo?.toString(),
        dueDate: saved.dueDate,
      },
    });

    const assignedToChanged =
      updates.assignedTo !== undefined && updates.assignedTo !== oldTask.assignedTo?.toString();
    if (assignedToChanged) {
      await this.activityLogService.log(id, userId, ActivityAction.ASSIGNED, {
        assignedTo: updates.assignedTo,
      });
      this.notificationsGateway.notifyTaskAssigned(updates.assignedTo!, saved);
    }

    const statusChanged = updates.status !== undefined && updates.status !== oldTask.status;
    if (statusChanged) {
      await this.activityLogService.log(id, userId, ActivityAction.STATUS_CHANGED, {
        from: oldTask.status,
        to: saved.status,
      });
    }

    this.notificationsGateway.notifyTaskUpdated(oldTask.userId.toString(), saved);

    const dueDateChanged =
      updates.dueDate !== undefined &&
      new Date(updates.dueDate).getTime() !== oldTask.dueDate?.getTime();
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
    const saved = await this.taskModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(taskId),
          version: dto.expectedVersion,
          $or: [
            { userId: new Types.ObjectId(requestingUserId) },
            { assignedTo: new Types.ObjectId(requestingUserId) },
          ],
        },
        {
          $set: { assignedTo: new Types.ObjectId(dto.assigneeId) },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (!saved) {
      throw new ConflictException(
        'Task not found, version mismatch, or insufficient permissions.',
      );
    }

    await this.activityLogService.log(taskId, requestingUserId, ActivityAction.ASSIGNED, {
      assignedTo: dto.assigneeId,
    });
    this.notificationsGateway.notifyTaskAssigned(dto.assigneeId, saved);

    return saved;
  }
}
