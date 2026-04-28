import { Inject, Injectable } from '@nestjs/common';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';
import { CreateExpenseReminderDto } from '@propiedades/types';
import { CreateExpenseCategoryUseCase } from '../../expense-category/application/create-expense-category.use-case';
import { UtilityTypeLabels, UtilityType } from '@propiedades/types';

@Injectable()
export class CreateExpenseReminderUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY)
    private readonly utilityRepository: IUtilityRepository,
    private readonly createCategoryUseCase: CreateExpenseCategoryUseCase,
  ) {}

  async execute(dto: CreateExpenseReminderDto, organizationId: string) {
    const isBuiltIn = Object.values(UtilityTypeLabels).includes(dto.title);
    
    if (!isBuiltIn) {
      try {
        await this.createCategoryUseCase.execute(organizationId, { name: dto.title });
      } catch (e) {
        // Ignorar si ya existe
      }
    }

    return this.utilityRepository.createReminder({
      ...dto,
      organizationId, // In case we want to add it to the model later
    });
  }
}
