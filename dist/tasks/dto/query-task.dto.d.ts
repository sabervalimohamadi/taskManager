import { TaskPriority, TaskStatus } from '../schemas/task.schema';
export declare class QueryTaskDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    page?: number;
    limit?: number;
}
