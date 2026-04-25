import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { CheckExpirationsCron } from '../application/check-expirations.cron';
import { ResendEmailService } from '../../../shared/infrastructure/email/resend-email.service';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    CheckExpirationsCron,
    ResendEmailService,
  ],
  exports: [NotificationRepository],
})
export class NotificationModule {}
