import { UtilityType } from '@propiedades/types';

export class Utility {
  constructor(
    public readonly id: string,
    public readonly propertyId: string,
    public readonly type: UtilityType,
    public readonly amount: number,
    public readonly isIncludedInRent: boolean,
    public readonly billingMonth?: Date | null,
    public readonly notes?: string | null,
    public readonly recordedById?: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
