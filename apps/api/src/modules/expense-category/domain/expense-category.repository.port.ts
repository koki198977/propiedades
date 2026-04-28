import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '@propiedades/types';
import { ExpenseCategory } from '@prisma/client';

export const EXPENSE_CATEGORY_REPOSITORY = 'EXPENSE_CATEGORY_REPOSITORY';

export interface IExpenseCategoryRepository {
  create(organizationId: string, data: CreateExpenseCategoryDto): Promise<ExpenseCategory>;
  findAll(organizationId: string, includeInactive?: boolean): Promise<ExpenseCategory[]>;
  update(id: string, organizationId: string, data: UpdateExpenseCategoryDto): Promise<ExpenseCategory>;
  findByName(organizationId: string, name: string): Promise<ExpenseCategory | null>;
}
