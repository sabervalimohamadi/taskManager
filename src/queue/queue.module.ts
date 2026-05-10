import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GatewayModule } from '../gateway/gateway.module';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { OutboxEvent, OutboxEventSchema } from './schemas/outbox-event.schema';
import { OutboxService } from './outbox.service';
import { OutboxWorker } from './outbox.worker';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'task-deadlines' }),
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: OutboxEvent.name, schema: OutboxEventSchema },
    ]),
    GatewayModule,
  ],
  providers: [QueueService, QueueProcessor, OutboxService, OutboxWorker],
  exports: [QueueService, OutboxService],
})
export class QueueModule {}
