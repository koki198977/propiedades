import { Payment } from './payment.entity';

export interface IPaymentRepository {
  findAllByOrganizationId(organizationId: string): Promise<Payment[]>;
  findAllByTenantId(tenantId: string): Promise<Payment[]>;
  findAllByPropertyId(propertyId: string): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  create(data: any): Promise<Payment>;
  update(id: string, data: any): Promise<Payment>;
  delete(id: string): Promise<void>;
}

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');
