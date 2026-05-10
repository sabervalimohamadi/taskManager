import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import {
  OutboxEvent,
  OutboxEventDocument,
} from './schemas/outbox-event.schema';
import { QueueService } from './queue.service';

const MAX_ATTEMPTS = 5;

@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);

  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEventDocument>,
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly queueService: QueueService,
  ) {}

  @Cron('*/5 * * * * *')
  async drainOutbox(): Promise<void> {
    const events = await this.outboxModel
      .find({ status: 'pending' })
      .limit(100)
      .exec();

    for (const event of events) {
      try {
        await this.handleEvent(event);
        event.status = 'done';
      } catch (err) {
        event.attempts += 1;
        this.logger.error(
          `Outbox event ${String(event._id)} (${event.type}) failed on attempt ${event.attempts}: ${(err as Error).message}`,
        );
        if (event.attempts >= MAX_ATTEMPTS) {
          event.status = 'failed';
        }
      }
      await event.save();
    }
  }

  private async handleEvent(event: OutboxEventDocument): Promise<void> {
    if (event.type === 'reschedule-deadline') {
      const { taskId } = event.payload as { taskId: string };

      const task = await this.taskModel.findById(taskId).exec();

      if (!task || !task.dueDate) {
        return;
      }

      await this.queueService.cancelDeadlineJob(taskId);
      await this.queueService.scheduleDeadlineJob(task);
    }
  }
}
