import { Module } from '@nestjs/common';
import { SendMonthlyBillsUseCase } from '../application/send-monthly-bills.use-case';
import { BillingController } from './billing.controller';
import { DebugController } from './debug.controller';
import { ResendEmailService } from '../../../shared/infrastructure/email/resend-email.service';
import { NotificationModule } from '../../notification/infrastructure/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [
    SendMonthlyBillsUseCase,
    ResendEmailService,
  ],
  controllers: [BillingController, DebugController],
})
export class BillingModule {}
