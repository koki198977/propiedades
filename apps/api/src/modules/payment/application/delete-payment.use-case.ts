import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IPaymentRepository, PAYMENT_REPOSITORY } from '../domain/payment.repository.port';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../../property/domain/property.repository.port';

@Injectable()
export class DeletePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository,
  ) {}

  async execute(organizationId: string, id: string): Promise<void> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    const propertyId = (payment as any).propertyTenant?.propertyId;
    if (propertyId) {
      const property = await this.propertyRepo.findById(propertyId);
      if (!property || property.organizationId !== organizationId) {
        throw new ForbiddenException('Este pago no pertenece a tu espacio de trabajo actual');
      }
    }

    await this.paymentRepo.delete(id);
  }
}
