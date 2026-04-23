import { Inject, Injectable } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';
import { AssignTenantDto } from '@propiedades/types';

@Injectable()
export class AssignTenantUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository,
  ) {}

  async execute(propertyId: string, organizationId: string, dto: AssignTenantDto) {
    const property = await this.propertyRepo.findById(propertyId);
    if (!property) throw new Error('Propiedad no encontrada');
    
    if (property.organizationId !== organizationId) {
      throw new Error('Esta propiedad no pertenece a tu espacio de trabajo actual');
    }

    return this.propertyRepo.assignTenant(propertyId, dto);
  }
}
