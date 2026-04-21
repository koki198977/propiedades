import { Inject, Injectable } from '@nestjs/common';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';

@Injectable()
export class DeleteExpenseReminderUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY)
    private readonly utilityRepository: IUtilityRepository,
  ) {}

  async execute(id: string) {
    return this.utilityRepository.deleteReminder(id);
  }
}
