import { PaymentMethod } from '@propiedades/types';

export class Payment {
  constructor(
    public readonly id: string,
    public readonly propertyTenantId: string,
    public readonly recordedById: string,
    public readonly amount: number,
    public readonly paymentDate: Date,
    public readonly paymentMethod: PaymentMethod,
    public readonly receiptUrl?: string | null,
    public readonly notes?: string | null,
    public readonly createdAt?: Date,
    public readonly propertyTenant?: {
      id: string;
      monthlyRent: number;
      property: { id: string; address: string };
      tenant: { id: string; name: string };
    },
  ) {}
}
