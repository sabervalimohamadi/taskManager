import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OutboxEvent,
  OutboxEventDocument,
} from './schemas/outbox-event.schema';

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEventDocument>,
  ) {}

  async enqueue(type: string, payload: Record<string, unknown>): Promise<void> {
    await this.outboxModel.create({ type, payload });
  }
}
