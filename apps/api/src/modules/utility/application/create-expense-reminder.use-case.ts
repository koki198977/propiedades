import { Inject, Injectable } from '@nestjs/common';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';
import { CreateExpenseReminderDto } from '@propiedades/types';

@Injectable()
export class CreateExpenseReminderUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY)
    private readonly utilityRepository: IUtilityRepository,
  ) {}

  async execute(dto: CreateExpenseReminderDto, organizationId: string) {
    return this.utilityRepository.createReminder({
      ...dto,
      organizationId, // In case we want to add it to the model later
    });
  }
}
