import { Inject, Injectable } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';

@Injectable()
export class GetPropertiesUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository,
  ) {}

  async execute(organizationId: string) {
    return this.propertyRepo.findAllByOrganizationId(organizationId);
  }

  async executeById(id: string) {
    return this.propertyRepo.findById(id);
  }

  async executeActiveTenancy(propertyId: string) {
    return this.propertyRepo.findActiveTenancyByPropertyId(propertyId);
  }
}
