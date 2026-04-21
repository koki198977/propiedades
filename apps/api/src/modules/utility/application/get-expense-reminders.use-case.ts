import { Inject, Injectable } from '@nestjs/common';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';

@Injectable()
export class GetExpenseRemindersUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY)
    private readonly utilityRepository: IUtilityRepository,
  ) {}

  async execute(propertyId: string) {
    return this.utilityRepository.findAllRemindersByPropertyId(propertyId);
  }

  async executeByOrganization(organizationId: string) {
    return this.utilityRepository.findAllRemindersByOrganizationId(organizationId);
  }
}
