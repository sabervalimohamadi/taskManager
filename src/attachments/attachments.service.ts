import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TasksService } from '../tasks/tasks.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private readonly attachmentModel: Model<AttachmentDocument>,
    private readonly tasksService: TasksService,
  ) {}

  async addAttachment(
    taskId: string,
    userId: string,
    dto: CreateAttachmentDto,
  ): Promise<AttachmentDocument> {
    await this.tasksService.assertUserCanAccessTask(taskId, userId);

    const attachment = new this.attachmentModel({
      ...dto,
      taskId: new Types.ObjectId(taskId),
      uploadedBy: new Types.ObjectId(userId),
    });
    return attachment.save();
  }

  async getAttachments(taskId: string, userId: string): Promise<AttachmentDocument[]> {
    await this.tasksService.assertUserCanAccessTask(taskId, userId);

    return this.attachmentModel
      .find({ taskId: new Types.ObjectId(taskId) })
      .exec();
  }

  async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await this.attachmentModel.findById(attachmentId).exec();
    if (!attachment) {
      throw new ForbiddenException('Attachment not found or access denied');
    }

    if (attachment.uploadedBy.toString() !== userId) {
      throw new ForbiddenException('Only the uploader can delete this attachment');
    }
    await attachment.deleteOne();
  }
}
