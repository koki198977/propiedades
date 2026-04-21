import { Module } from '@nestjs/common';
import { SendMonthlyBillsUseCase } from '../application/send-monthly-bills.use-case';
import { BillingController } from './billing.controller';
import { ResendEmailService } from '../../../shared/infrastructure/email/resend-email.service';

@Module({
  providers: [
    SendMonthlyBillsUseCase,
    ResendEmailService,
  ],
  controllers: [BillingController],
})
export class BillingModule {}
