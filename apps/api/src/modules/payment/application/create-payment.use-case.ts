import { Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '@propiedades/types';
import { IPaymentRepository, PAYMENT_REPOSITORY } from '../domain/payment.repository.port';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(userId: string, organizationId: string, dto: CreatePaymentDto) {
    // Note: Validation that propertyTenantId belongs to organizationId could be added here
    return this.paymentRepo.create({
      ...dto,
      recordedById: userId,
    });
  }
}
