import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TasksService } from '../tasks/tasks.service';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly tasksService: TasksService,
  ) {}

  async addComment(
    taskId: string,
    userId: string,
    content: string,
  ): Promise<CommentDocument> {
    await this.tasksService.assertUserCanAccessTask(taskId, userId);

    const comment = new this.commentModel({
      content,
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    });
    return comment.save();
  }

  async getComments(
    taskId: string,
    userId: string,
  ): Promise<CommentDocument[]> {
    await this.tasksService.assertUserCanAccessTask(taskId, userId);

    return this.commentModel
      .find({ taskId: new Types.ObjectId(taskId) })
      .sort({ createdAt: 1 })
      .populate('userId', 'name')
      .exec();
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new ForbiddenException('Comment not found or access denied');
    }

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Only the comment author can delete this comment',
      );
    }
    await comment.deleteOne();
  }
}
