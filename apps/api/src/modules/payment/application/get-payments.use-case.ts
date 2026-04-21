import { Inject, Injectable } from '@nestjs/common';
import { IPaymentRepository, PAYMENT_REPOSITORY } from '../domain/payment.repository.port';

@Injectable()
export class GetPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
  ) {}

  async executeByOrganization(organizationId: string) {
    return this.paymentRepo.findAllByOrganizationId(organizationId);
  }

  async executeByProperty(propertyId: string) {
    return this.paymentRepo.findAllByPropertyId(propertyId);
  }

  async executeByTenant(tenantId: string) {
    return this.paymentRepo.findAllByTenantId(tenantId);
  }
}
