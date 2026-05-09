import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ActivityAction,
  ActivityLog,
  ActivityLogDocument,
} from './schemas/activity-log.schema';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async log(
    taskId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    action: ActivityAction,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    const entry = new this.activityLogModel({
      taskId: new Types.ObjectId(taskId.toString()),
      userId: new Types.ObjectId(userId.toString()),
      action,
      metadata,
    });
    return entry.save();
  }

  async getLogsForTask(taskId: string): Promise<ActivityLogDocument[]> {
    return this.activityLogModel
      .find({ taskId: new Types.ObjectId(taskId) })
      .sort({ timestamp: -1 })
      .exec();
  }
}
