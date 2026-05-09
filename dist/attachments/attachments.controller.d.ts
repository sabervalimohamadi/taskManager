import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    addAttachment(taskId: string, user: {
        userId: string;
    }, dto: CreateAttachmentDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/attachment.schema").Attachment, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/attachment.schema").Attachment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getAttachments(taskId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/attachment.schema").Attachment, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/attachment.schema").Attachment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    deleteAttachment(attachmentId: string, user: {
        userId: string;
    }): Promise<void>;
}
