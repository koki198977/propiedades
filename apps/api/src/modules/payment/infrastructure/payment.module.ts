import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { CreatePaymentUseCase } from '../application/create-payment.use-case';
import { GetPaymentsUseCase } from '../application/get-payments.use-case';
import { DeletePaymentUseCase } from '../application/delete-payment.use-case';
import { PAYMENT_REPOSITORY } from '../domain/payment.repository.port';
import { PrismaPaymentRepository } from './prisma-payment.repository';
import { PropertyModule } from '../../property/infrastructure/property.module';

@Module({
  imports: [PropertyModule],
  controllers: [PaymentController],
  providers: [
    CreatePaymentUseCase,
    GetPaymentsUseCase,
    DeletePaymentUseCase,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },
  ],
  exports: [PAYMENT_REPOSITORY, CreatePaymentUseCase],
})
export class PaymentModule {}
