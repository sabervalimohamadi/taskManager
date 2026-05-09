import { Model } from 'mongoose';
import { TaskDocument } from '../tasks/schemas/task.schema';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentDocument } from './schemas/attachment.schema';
export declare class AttachmentsService {
    private readonly attachmentModel;
    private readonly taskModel;
    constructor(attachmentModel: Model<AttachmentDocument>, taskModel: Model<TaskDocument>);
    addAttachment(taskId: string, userId: string, dto: CreateAttachmentDto): Promise<AttachmentDocument>;
    getAttachments(taskId: string): Promise<AttachmentDocument[]>;
    deleteAttachment(attachmentId: string, userId: string): Promise<void>;
}
