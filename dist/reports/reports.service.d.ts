import type { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { TaskDocument } from '../tasks/schemas/task.schema';
export declare class ReportsService {
    private readonly taskModel;
    private readonly userModel;
    private readonly cacheManager;
    constructor(taskModel: Model<TaskDocument>, userModel: Model<any>, cacheManager: Cache);
    getCompletedTasksPerUser(): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        completedCount: number;
    }[]>;
    getTasksCompletedOverTime(from: Date, to: Date): Promise<{
        date: string;
        count: number;
    }[]>;
    getOverdueTasks(): Promise<TaskDocument[]>;
}
