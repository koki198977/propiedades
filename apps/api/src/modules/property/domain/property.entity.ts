import { PropertyCategory } from '@propiedades/types';

export class Property {
  constructor(
    public readonly id: string,
    public readonly userId: string, // Creador
    public readonly organizationId: string, // Workspace dueño
    public readonly category: PropertyCategory,
    public readonly customCategory: string | null = null,
    public readonly address: string,
    public readonly paymentDueDay: number,
    public readonly contractEndDate?: Date | null,
    public readonly rol?: string | null,
    public readonly notes?: string | null,
    public readonly expectedRent?: number | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly meters: Array<{
      id: string;
      label: string;
      number: string;
      createdAt: Date;
    }> = [],
    public readonly activeTenant?: any | null,
    public readonly photos: Array<{
      id: string;
      url: string;
      publicId: string;
      order: number;
      uploadedAt: Date;
    }> = [],
  ) {}

  static create(params: {
    userId: string;
    organizationId: string;
    category: PropertyCategory;
    customCategory?: string;
    address: string;
    paymentDueDay: number;
    contractEndDate?: Date;
    rol?: string;
    notes?: string;
  }) {
    return {
      userId: params.userId,
      organizationId: params.organizationId,
      category: params.category,
      customCategory: params.customCategory,
      address: params.address,
      paymentDueDay: params.paymentDueDay,
      contractEndDate: params.contractEndDate,
      rol: params.rol,
      notes: params.notes,
    };
  }
}
