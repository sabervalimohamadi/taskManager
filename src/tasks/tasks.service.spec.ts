import { ConflictException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';
import { OutboxService } from '../queue/outbox.service';
import { QueueService } from '../queue/queue.service';
import { Task } from './schemas/task.schema';
import { TasksService } from './tasks.service';

function makeTask(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    assignedTo: undefined,
    status: 'todo',
    dueDate: undefined,
    ...overrides,
  };
}

describe('TasksService', () => {
  let service: TasksService;

  const mockTaskModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findById: jest.fn(),
  };
  const mockActivityLog = { log: jest.fn().mockResolvedValue(undefined) };
  const mockQueue = { scheduleDeadlineJob: jest.fn() };
  const mockOutbox = { enqueue: jest.fn() };
  const mockGateway = {
    notifyTaskAssigned: jest.fn(),
    notifyTaskUpdated: jest.fn(),
  };
  const mockCache = { del: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken(Task.name), useValue: mockTaskModel },
        { provide: ActivityLogService, useValue: mockActivityLog },
        { provide: QueueService, useValue: mockQueue },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: NotificationsGateway, useValue: mockGateway },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get(TasksService);
    jest.clearAllMocks();
  });

  // ── Optimistic lock ────────────────────────────────────────────────────────

  describe('update() — optimistic locking', () => {
    const taskId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();

    it('throws ConflictException when version is stale (findOne returns null)', async () => {
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(taskId, userId, { version: 5, title: 'x' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when concurrent writer wins between findOne and findOneAndUpdate', async () => {
      const oldTask = makeTask({ userId: new Types.ObjectId(userId) });

      mockTaskModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(oldTask),
      });
      mockTaskModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(taskId, userId, { version: 0, title: 'updated' }),
      ).rejects.toThrow(ConflictException);
    });

    it('returns the updated task on success', async () => {
      const oldTask = makeTask({ userId: new Types.ObjectId(userId) });
      const saved = { ...oldTask, title: 'updated', version: 1 };

      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(oldTask),
      });
      mockTaskModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(saved),
      });

      const result = await service.update(taskId, userId, {
        version: 0,
        title: 'updated',
      });
      expect(result).toBe(saved);
    });
  });

  // ── IDOR prevention ────────────────────────────────────────────────────────

  describe('assertUserCanAccessTask() — IDOR prevention', () => {
    it('throws NotFoundException when task belongs to a different user', async () => {
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.assertUserCanAccessTask(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns the task when the requesting user owns it', async () => {
      const task = makeTask();
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(task),
      });

      const result = await service.assertUserCanAccessTask(
        task._id.toString(),
        task.userId.toString(),
      );
      expect(result).toBe(task);
    });

    it('returns the task when the requesting user is the assignee', async () => {
      const assigneeId = new Types.ObjectId();
      const task = makeTask({ assignedTo: assigneeId });
      mockTaskModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(task),
      });

      const result = await service.assertUserCanAccessTask(
        task._id.toString(),
        assigneeId.toString(),
      );
      expect(result).toBe(task);
    });
  });

  // ── Concurrent assignTask ──────────────────────────────────────────────────

  describe('assignTask() — concurrent update', () => {
    it('throws ConflictException when version does not match (race condition)', async () => {
      mockTaskModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.assignTask(
          new Types.ObjectId().toString(),
          { assigneeId: new Types.ObjectId().toString(), expectedVersion: 0 },
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('returns the saved task and fires notification on success', async () => {
      const assigneeId = new Types.ObjectId();
      const saved = makeTask({ assignedTo: assigneeId });
      mockTaskModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(saved),
      });

      const result = await service.assignTask(
        saved._id.toString(),
        { assigneeId: assigneeId.toString(), expectedVersion: 0 },
        saved.userId.toString(),
      );

      expect(result).toBe(saved);
      expect(mockGateway.notifyTaskAssigned).toHaveBeenCalledWith(
        assigneeId.toString(),
        saved,
      );
    });
  });
});
