import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private readonly attachmentModel: Model<AttachmentDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  async addAttachment(
    taskId: string,
    userId: string,
    dto: CreateAttachmentDto,
  ): Promise<AttachmentDocument> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    const attachment = new this.attachmentModel({
      ...dto,
      taskId: new Types.ObjectId(taskId),
      uploadedBy: new Types.ObjectId(userId),
    });
    return attachment.save();
  }

  async getAttachments(taskId: string): Promise<AttachmentDocument[]> {
    return this.attachmentModel
      .find({ taskId: new Types.ObjectId(taskId) })
      .exec();
  }

  async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await this.attachmentModel.findById(attachmentId).exec();
    if (!attachment) {
      throw new NotFoundException(`Attachment ${attachmentId} not found`);
    }

    if (attachment.uploadedBy.toString() !== userId) {
      throw new ForbiddenException('Only the uploader can delete this attachment');
    }
    await attachment.deleteOne();
  }
}
