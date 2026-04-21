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
      category: dto.category,
      paymentDueDay: dto.paymentDueDay,
      rol: dto.rol ?? null,
      contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : null,
      notes: dto.notes ?? null,
      expectedRent: dto.expectedRent ?? null,
    });
  }
}
