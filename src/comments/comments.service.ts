import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  async addComment(
    taskId: string,
    userId: string,
    content: string,
  ): Promise<CommentDocument> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    const comment = new this.commentModel({
      content,
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    });
    return comment.save();
  }

  async getComments(taskId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ taskId: new Types.ObjectId(taskId) })
      .sort({ createdAt: 1 })
      .populate('userId', 'name')
      .exec();
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException(`Comment ${commentId} not found`);

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('Only the comment author can delete this comment');
    }
    await comment.deleteOne();
  }
}
