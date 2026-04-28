import { Inject, Injectable } from '@nestjs/common';
import { CreateUtilityDto, UtilityType } from '@propiedades/types';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';
import { CreateExpenseCategoryUseCase } from '../../expense-category/application/create-expense-category.use-case';

@Injectable()
export class CreateUtilityUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY) private readonly utilityRepo: IUtilityRepository,
    private readonly createCategoryUseCase: CreateExpenseCategoryUseCase,
  ) {}

  async execute(dto: CreateUtilityDto, organizationId: string, userId?: string) {
    const customName = dto.title || dto.notes;

    if (dto.type === UtilityType.OTHER && customName) {
      try {
        await this.createCategoryUseCase.execute(organizationId, { name: customName });
      } catch (e) {
        // Ignorar error de conflicto si ya existe
      }
    }

    return this.utilityRepo.create({
      ...dto,
      billingMonth: dto.billingMonth ? new Date(dto.billingMonth) : undefined,
      recordedById: userId,
      notes: customName, // Use title as fallback for notes
    });
  }
}
