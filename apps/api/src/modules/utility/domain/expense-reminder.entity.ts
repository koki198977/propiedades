import { ExpenseFrequency } from '@propiedades/types';

export class ExpenseReminder {
  constructor(
    public readonly id: string,
    public readonly propertyId: string,
    public readonly title: string,
    public readonly amount: number,
    public readonly frequency: ExpenseFrequency,
    public readonly nextDueDate: Date,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
  ) {}
}
