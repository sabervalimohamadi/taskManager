import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(user: {
        userId: string;
    }, query: QueryTaskDto): Promise<{
        data: import("./schemas/task.schema").TaskDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(user: {
        userId: string;
    }, dto: CreateTaskDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    findOne(id: string, user: {
        userId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, user: {
        userId: string;
    }, dto: UpdateTaskDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string, user: {
        userId: string;
    }): Promise<void>;
    assignTask(taskId: string, dto: AssignTaskDto, user: {
        userId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
