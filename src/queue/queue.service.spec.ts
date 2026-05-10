import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskDocument } from '../tasks/schemas/task.schema';
import { QueueService } from './queue.service';

function makeTask(dueDateOffsetMs: number): TaskDocument {
  const id = '507f1f77bcf86cd799439011';
  return {
    _id: { toString: () => id },
    dueDate: new Date(Date.now() + dueDateOffsetMs),
  } as unknown as TaskDocument;
}

describe('QueueService', () => {
  let service: QueueService;
  const mockQueue = {
    add: jest.fn().mockResolvedValue(undefined),
    getJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: getQueueToken('task-deadlines'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get(QueueService);
    jest.clearAllMocks();
  });

  // ── Dedup via jobId ────────────────────────────────────────────────────────

  describe('scheduleDeadlineJob() — deduplication', () => {
    it('passes a deterministic jobId so BullMQ deduplicates concurrent schedules', async () => {
      const task = makeTask(2 * 60 * 60 * 1000); // 2 hours ahead
      const taskId = (task._id as { toString: () => string }).toString();

      await service.scheduleDeadlineJob(task);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'deadline-reminder',
        { taskId },
        expect.objectContaining({ jobId: `deadline-${taskId}` }),
      );
    });

    it('skips job when dueDate is already within the 30-minute reminder window', async () => {
      const task = makeTask(10 * 60 * 1000); // only 10 minutes ahead
      await service.scheduleDeadlineJob(task);
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('skips job when dueDate is in the past', async () => {
      const task = makeTask(-1000); // 1 second in the past
      await service.scheduleDeadlineJob(task);
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  // ── cancelDeadlineJob ──────────────────────────────────────────────────────

  describe('cancelDeadlineJob()', () => {
    it('removes the job if it exists', async () => {
      const mockJob = { remove: jest.fn().mockResolvedValue(undefined) };
      mockQueue.getJob.mockResolvedValue(mockJob);

      await service.cancelDeadlineJob('507f1f77bcf86cd799439011');

      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('does nothing when no job is found', async () => {
      mockQueue.getJob.mockResolvedValue(null);
      await expect(
        service.cancelDeadlineJob('no-such-id'),
      ).resolves.toBeUndefined();
    });
  });
});
