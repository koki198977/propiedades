import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/infrastructure/prisma.module';
import { ExpenseCategoryController } from './expense-category.controller';
import { CreateExpenseCategoryUseCase } from '../application/create-expense-category.use-case';
import { GetExpenseCategoriesUseCase } from '../application/get-expense-categories.use-case';
import { UpdateExpenseCategoryUseCase } from '../application/update-expense-category.use-case';
import { PrismaExpenseCategoryRepository } from './prisma-expense-category.repository';
import { EXPENSE_CATEGORY_REPOSITORY } from '../domain/expense-category.repository.port';

@Module({
  imports: [PrismaModule],
  controllers: [ExpenseCategoryController],
  providers: [
    CreateExpenseCategoryUseCase,
    GetExpenseCategoriesUseCase,
    UpdateExpenseCategoryUseCase,
    {
      provide: EXPENSE_CATEGORY_REPOSITORY,
      useClass: PrismaExpenseCategoryRepository,
    },
  ],
  exports: [EXPENSE_CATEGORY_REPOSITORY, CreateExpenseCategoryUseCase],
})
export class ExpenseCategoryModule {}
