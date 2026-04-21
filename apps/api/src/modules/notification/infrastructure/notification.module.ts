import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { CheckExpirationsCron } from '../application/check-expirations.cron';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    CheckExpirationsCron,
  ],
  exports: [NotificationRepository],
})
export class NotificationModule {}
