import { Utility } from './utility.entity';
import { ExpenseReminder } from './expense-reminder.entity';
import { UtilityType } from '@propiedades/types';

export interface IUtilityRepository {
  // Utility (payments)
  findAllByOrganizationId(organizationId: string): Promise<Utility[]>;
  findAllByPropertyId(propertyId: string): Promise<Utility[]>;
  create(data: { propertyId: string; type: UtilityType; amount: number; isIncludedInRent: boolean; billingMonth?: Date; notes?: string; recordedById?: string }): Promise<Utility>;
  update(id: string, data: any): Promise<Utility>;
  delete(id: string): Promise<void>;

  // Expense Reminders
  findReminderById(id: string): Promise<ExpenseReminder | null>;
  findAllRemindersByOrganizationId(organizationId: string): Promise<ExpenseReminder[]>;
  findAllRemindersByPropertyId(propertyId: string): Promise<ExpenseReminder[]>;
  createReminder(data: any): Promise<ExpenseReminder>;
  updateReminder(id: string, data: any): Promise<ExpenseReminder>;
  deleteReminder(id: string): Promise<void>;
}

export const UTILITY_REPOSITORY = Symbol('IUtilityRepository');
