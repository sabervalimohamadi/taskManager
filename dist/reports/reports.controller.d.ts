import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getCompletedTasksPerUser(): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        completedCount: number;
    }[]>;
    getTasksCompletedOverTime(from: string, to: string): Promise<{
        date: string;
        count: number;
    }[]>;
    getOverdueTasks(): Promise<(import("mongoose").Document<unknown, {}, import("../tasks/schemas/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("../tasks/schemas/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
