import type { Queue } from 'bull';
import { TaskDocument } from '../tasks/schemas/task.schema';
export declare class QueueService {
    private readonly deadlineQueue;
    private readonly logger;
    constructor(deadlineQueue: Queue);
    scheduleDeadlineJob(task: TaskDocument): Promise<void>;
    cancelDeadlineJob(taskId: string): Promise<void>;
}
