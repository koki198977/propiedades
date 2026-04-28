import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CreateExpenseCategoryDto } from '@propiedades/types';
import { IExpenseCategoryRepository, EXPENSE_CATEGORY_REPOSITORY } from '../domain/expense-category.repository.port';

@Injectable()
export class CreateExpenseCategoryUseCase {
  constructor(
    @Inject(EXPENSE_CATEGORY_REPOSITORY) private readonly repository: IExpenseCategoryRepository,
  ) {}

  async execute(organizationId: string, data: CreateExpenseCategoryDto) {
    const existing = await this.repository.findByName(organizationId, data.name);
    if (existing) {
      if (!existing.isActive) {
        // reactivate
        return this.repository.update(existing.id, organizationId, { isActive: true });
      }
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return this.repository.create(organizationId, data);
  }
}
