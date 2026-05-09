import { Model } from 'mongoose';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';
import { QueueService } from '../queue/queue.service';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskDocument } from './schemas/task.schema';
export declare class TasksService {
    private readonly taskModel;
    private readonly activityLogService;
    private readonly queueService;
    private readonly notificationsGateway;
    constructor(taskModel: Model<TaskDocument>, activityLogService: ActivityLogService, queueService: QueueService, notificationsGateway: NotificationsGateway);
    create(userId: string, dto: CreateTaskDto): Promise<TaskDocument>;
    findAll(userId: string, query: QueryTaskDto): Promise<{
        data: TaskDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, userId: string): Promise<TaskDocument>;
    update(id: string, userId: string, dto: UpdateTaskDto): Promise<TaskDocument>;
    remove(id: string, userId: string): Promise<void>;
    assignTask(taskId: string, dto: AssignTaskDto, requestingUserId: string): Promise<TaskDocument>;
}
