import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from '../tasks/tasks.module';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
    forwardRef(() => TasksModule),
  ],
  controllers: [ActivityLogController],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
