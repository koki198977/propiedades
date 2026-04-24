import { PropertyCategory } from '@propiedades/types';

export class Property {
  constructor(
    public readonly id: string,
    public readonly userId: string, // Creador
    public readonly organizationId: string, // Workspace dueño
    public readonly category: PropertyCategory,
    public readonly customCategory: string | null = null,
    public readonly name: string | null = null,
    public readonly address: string,
    public readonly city: string | null = null,
    public readonly bedrooms: number | null = null,
    public readonly bathrooms: number | null = null,
    public readonly m2Total: number | null = null,
    public readonly m2Built: number | null = null,
    public readonly hasParking: boolean = false,
    public readonly hasStorage: boolean = false,
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
    name?: string;
    address: string;
    city?: string;
    bedrooms?: number;
    bathrooms?: number;
    m2Total?: number;
    m2Built?: number;
    hasParking?: boolean;
    hasStorage?: boolean;
    paymentDueDay: number;
    contractEndDate?: Date;
    rol?: string;
    notes?: string;
    expectedRent?: number;
  }) {
    return {
      userId: params.userId,
      organizationId: params.organizationId,
      category: params.category,
      customCategory: params.customCategory,
      name: params.name,
      address: params.address,
      city: params.city,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      m2Total: params.m2Total,
      m2Built: params.m2Built,
      hasParking: params.hasParking,
      hasStorage: params.hasStorage,
      paymentDueDay: params.paymentDueDay,
      contractEndDate: params.contractEndDate,
      rol: params.rol,
      notes: params.notes,
      expectedRent: params.expectedRent,
    };
  }
}
