import { Inject, Injectable } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';
import { AssignTenantDto } from '@propiedades/types';

@Injectable()
export class AssignTenantUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository,
  ) {}

  async execute(propertyId: string, userId: string, dto: AssignTenantDto) {
    const property = await this.propertyRepo.findById(propertyId);
    if (!property) throw new Error('Propiedad no encontrada');
    if (property.userId !== userId) throw new Error('No tienes permiso para modificar esta propiedad');

    return this.propertyRepo.assignTenant(propertyId, dto);
  }
}
