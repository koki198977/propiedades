import { Inject, Injectable } from '@nestjs/common';
import { IExpenseCategoryRepository, EXPENSE_CATEGORY_REPOSITORY } from '../domain/expense-category.repository.port';

@Injectable()
export class GetExpenseCategoriesUseCase {
  constructor(
    @Inject(EXPENSE_CATEGORY_REPOSITORY) private readonly repository: IExpenseCategoryRepository,
  ) {}

  async execute(organizationId: string, includeInactive = false) {
    return this.repository.findAll(organizationId, includeInactive);
  }
}
