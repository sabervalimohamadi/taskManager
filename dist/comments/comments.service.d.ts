import { Model } from 'mongoose';
import { TaskDocument } from '../tasks/schemas/task.schema';
import { CommentDocument } from './schemas/comment.schema';
export declare class CommentsService {
    private readonly commentModel;
    private readonly taskModel;
    constructor(commentModel: Model<CommentDocument>, taskModel: Model<TaskDocument>);
    addComment(taskId: string, userId: string, content: string): Promise<CommentDocument>;
    getComments(taskId: string): Promise<CommentDocument[]>;
    deleteComment(commentId: string, userId: string): Promise<void>;
}
