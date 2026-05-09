import type { Job } from 'bull';
import { Model } from 'mongoose';
import { NotificationsGateway } from '../gateway/notifications.gateway';
import { TaskDocument } from '../tasks/schemas/task.schema';
export declare class QueueProcessor {
    private readonly taskModel;
    private readonly notificationsGateway;
    private readonly logger;
    constructor(taskModel: Model<TaskDocument>, notificationsGateway: NotificationsGateway);
    handleDeadlineReminder(job: Job<{
        taskId: string;
    }>): Promise<void>;
    onFailed(job: Job<{
        taskId: string;
    }>, error: Error): void;
    onCompleted(job: Job<{
        taskId: string;
    }>): void;
}
