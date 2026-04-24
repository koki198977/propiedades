import { Inject, Injectable } from '@nestjs/common';
import { CreatePropertyDto } from '@propiedades/types';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository,
  ) {}

  async execute(userId: string, organizationId: string, dto: CreatePropertyDto) {
    return this.propertyRepo.create({
      userId,
      organizationId,
      address: dto.address,
      name: dto.name ?? null,
      city: dto.city ?? null,
      category: dto.category,
      customCategory: dto.customCategory ?? null,
      bedrooms: dto.bedrooms ?? 0,
      bathrooms: dto.bathrooms ?? 0,
      m2Total: dto.m2Total ?? 0,
      m2Built: dto.m2Built ?? 0,
      hasParking: dto.hasParking ?? false,
      hasStorage: dto.hasStorage ?? false,
      paymentDueDay: dto.paymentDueDay,
      rol: dto.rol ?? null,
      contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : null,
      notes: dto.notes ?? null,
      expectedRent: dto.expectedRent ?? null,
    });
  }
}
