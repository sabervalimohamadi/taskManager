import { ActivityLogService } from './activity-log.service';
export declare class ActivityLogController {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
    getLogsForTask(taskId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/activity-log.schema").ActivityLog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/activity-log.schema").ActivityLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
