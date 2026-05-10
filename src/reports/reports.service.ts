import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from '../tasks/schemas/task.schema';

const MAX_RANGE_MS = 365 * 24 * 3600 * 1000;

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getCompletedTasksPerUser(
    userId: string,
  ): Promise<{ completedCount: number }[]> {
    const cacheKey = `report:completed-per-user:${userId}`;
    const cached = await this.cacheManager.get<{ completedCount: number }[]>(cacheKey);
    if (cached) return cached;

    const result = await this.taskModel.aggregate([
      {
        $match: {
          status: TaskStatus.DONE,
          $or: [
            { userId: new Types.ObjectId(userId) },
            { assignedTo: new Types.ObjectId(userId) },
          ],
        },
      },
      {
        $group: {
          _id: '$userId',
          completedCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          completedCount: 1,
        },
      },
    ]);

    await this.cacheManager.set(cacheKey, result, 60_000);
    return result;
  }

  async getTasksCompletedOverTime(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<{ date: string; count: number }[]> {
    const diff = to.getTime() - from.getTime();
    if (diff <= 0) {
      throw new BadRequestException('"from" must be earlier than "to"');
    }
    if (diff > MAX_RANGE_MS) {
      throw new BadRequestException('Date range cannot exceed 1 year');
    }

    return this.taskModel.aggregate([
      {
        $match: {
          status: TaskStatus.DONE,
          createdAt: { $gte: from, $lte: to },
          $or: [
            { userId: new Types.ObjectId(userId) },
            { assignedTo: new Types.ObjectId(userId) },
          ],
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

  async getOverdueTasks(userId: string): Promise<TaskDocument[]> {
    const cacheKey = `report:overdue:${userId}`;
    const cached = await this.cacheManager.get<TaskDocument[]>(cacheKey);
    if (cached) return cached;

    const result = await this.taskModel
      .find({
        dueDate: { $lt: new Date() },
        status: { $ne: TaskStatus.DONE },
        $or: [
          { userId: new Types.ObjectId(userId) },
          { assignedTo: new Types.ObjectId(userId) },
        ],
      })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .exec();

    await this.cacheManager.set(cacheKey, result, 30_000);
    return result;
  }
}
