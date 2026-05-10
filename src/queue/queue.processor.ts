import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job } from 'bull';
import { Model } from 'mongoose';
import { NotificationsGateway } from '../gateway/notifications.gateway';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';

@Processor('task-deadlines')
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Process()
  async handleDeadlineReminder(job: Job<{ taskId: string }>): Promise<void> {
    const { taskId } = job.data;

    const task = await this.taskModel
      .findById(taskId)
      .select('title dueDate userId assignedTo')
      .lean<TaskDocument>()
      .exec();

    if (!task) {
      this.logger.warn(`Task ${taskId} not found for deadline reminder`);
      return;
    }

    const ownerId = task.userId.toString();
    const payload = { taskId, title: task.title, dueDate: task.dueDate };

    await this.notificationsGateway.notifyDeadlineReminder(ownerId, payload);

    if (task.assignedTo) {
      const assigneeId = task.assignedTo.toString();
      if (assigneeId !== ownerId) {
        await this.notificationsGateway.notifyDeadlineReminder(assigneeId, payload);
      }
    }
  }

  @OnQueueFailed()
  onFailed(job: Job<{ taskId: string }>, error: Error): void {
    this.logger.error({
      jobId: job.id,
      taskId: job.data.taskId,
      attempt: job.attemptsMade,
      error: error.message,
    });
  }

  @OnQueueCompleted()
  onCompleted(job: Job<{ taskId: string }>): void {
    this.logger.log({ jobId: job.id, taskId: job.data.taskId });
  }
}
