import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';

export enum ActivityAction {
  CREATED = 'created',
  UPDATED = 'updated',
  ASSIGNED = 'assigned',
  STATUS_CHANGED = 'status_changed',
}

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

@Schema()
export class ActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'Task', required: true, index: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ActivityAction, required: true })
  action: ActivityAction;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
