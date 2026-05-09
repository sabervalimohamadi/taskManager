import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    addComment(taskId: string, user: {
        userId: string;
    }, dto: CreateCommentDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").Comment, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getComments(taskId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").Comment, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    deleteComment(commentId: string, user: {
        userId: string;
    }): Promise<void>;
}
