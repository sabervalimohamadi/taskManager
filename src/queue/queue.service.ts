import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TaskDocument } from '../tasks/schemas/task.schema';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('task-deadlines') private readonly deadlineQueue: Queue,
  ) {}

  async scheduleDeadlineJob(task: TaskDocument): Promise<void> {
    const delay = task.dueDate!.getTime() - Date.now() - 30 * 60 * 1000;

    if (delay <= 0) {
      this.logger.warn(
        `Skipping deadline job for task ${task._id}: due date is past or within 30 min`,
      );
      return;
    }

    await this.deadlineQueue.add(
      'deadline-reminder',
      { taskId: task._id.toString() },
      {
        jobId: `deadline-${task._id}`,
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async cancelDeadlineJob(taskId: string): Promise<void> {
    const job = await this.deadlineQueue.getJob(`deadline-${taskId}`);
    if (job) {
      await job.remove();
    }
  }
}
