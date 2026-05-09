import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [UsersModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class GatewayModule {}
