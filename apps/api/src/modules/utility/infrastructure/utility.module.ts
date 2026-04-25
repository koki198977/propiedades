import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { CreateUtilityUseCase } from '../application/create-utility.use-case';
import { GetUtilitiesUseCase } from '../application/get-utilities.use-case';
import { DeleteUtilityUseCase } from '../application/delete-utility.use-case';
import { CreateExpenseUseCase } from '../application/create-expense.use-case';
import { CreateExpenseReminderUseCase } from '../application/create-expense-reminder.use-case';
import { GetExpenseRemindersUseCase } from '../application/get-expense-reminders.use-case';
import { DeleteExpenseReminderUseCase } from '../application/delete-expense-reminder.use-case';
import { PayExpenseReminderUseCase } from '../application/pay-expense-reminder.use-case';
import { UTILITY_REPOSITORY } from '../domain/utility.repository.port';
import { PrismaUtilityRepository } from './prisma-utility.repository';

@Module({
  controllers: [UtilityController],
  providers: [
    CreateUtilityUseCase,
    GetUtilitiesUseCase,
    DeleteUtilityUseCase,
    CreateExpenseUseCase,
    CreateExpenseReminderUseCase,
    GetExpenseRemindersUseCase,
    DeleteExpenseReminderUseCase,
    PayExpenseReminderUseCase,
    {
      provide: UTILITY_REPOSITORY,
      useClass: PrismaUtilityRepository,
    },
  ],
  exports: [UTILITY_REPOSITORY],
})
export class UtilityModule {}
