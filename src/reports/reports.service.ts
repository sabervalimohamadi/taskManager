import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from '../tasks/schemas/task.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private readonly userModel: Model<any>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getCompletedTasksPerUser(): Promise<
    { user: { id: string; name: string; email: string }; completedCount: number }[]
  > {
    const cacheKey = 'report:completed-per-user';
    const cached = await this.cacheManager.get<
      { user: { id: string; name: string; email: string }; completedCount: number }[]
    >(cacheKey);
    if (cached) return cached;

    const result = await this.taskModel.aggregate([
      { $match: { status: TaskStatus.DONE } },
      { $group: { _id: '$userId', completedCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          user: {
            id: '$_id',
            name: '$userInfo.name',
            email: '$userInfo.email',
          },
          completedCount: 1,
        },
      },
    ]);

    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async getTasksCompletedOverTime(
    from: Date,
    to: Date,
  ): Promise<{ date: string; count: number }[]> {
    return this.taskModel.aggregate([
      {
        $match: {
          status: TaskStatus.DONE,
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ]);
  }

  async getOverdueTasks(): Promise<TaskDocument[]> {
    const cacheKey = 'report:overdue';
    const cached = await this.cacheManager.get<TaskDocument[]>(cacheKey);
    if (cached) return cached;

    const result = await this.taskModel
      .find({
        dueDate: { $lt: new Date() },
        status: { $ne: TaskStatus.DONE },
      })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .exec();

    await this.cacheManager.set(cacheKey, result, 30000);
    return result;
  }
}
