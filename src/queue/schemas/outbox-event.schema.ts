import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OutboxEventDocument = HydratedDocument<OutboxEvent>;

export type OutboxStatus = 'pending' | 'done' | 'failed';

@Schema({ timestamps: true })
export class OutboxEvent {
  @Prop({ required: true })
  type: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, unknown>;

  @Prop({ default: 'pending', enum: ['pending', 'done', 'failed'] })
  status: OutboxStatus;

  @Prop({ default: 0 })
  attempts: number;
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEvent);

OutboxEventSchema.index({ status: 1, createdAt: 1 });
