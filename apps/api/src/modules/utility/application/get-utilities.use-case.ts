import { Inject, Injectable } from '@nestjs/common';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';

@Injectable()
export class GetUtilitiesUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY) private readonly utilityRepo: IUtilityRepository,
  ) {}

  async execute(propertyId: string) {
    return this.utilityRepo.findAllByPropertyId(propertyId);
  }

  async executeByOrganization(organizationId: string) {
    return this.utilityRepo.findAllByOrganizationId(organizationId);
  }
}
