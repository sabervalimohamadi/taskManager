import { Model, Types } from 'mongoose';
import { ActivityAction, ActivityLog, ActivityLogDocument } from './schemas/activity-log.schema';
export declare class ActivityLogService {
    private readonly activityLogModel;
    constructor(activityLogModel: Model<ActivityLogDocument>);
    log(taskId: string | Types.ObjectId, userId: string | Types.ObjectId, action: ActivityAction, metadata?: Record<string, any>): Promise<ActivityLog>;
    getLogsForTask(taskId: string): Promise<ActivityLogDocument[]>;
}
