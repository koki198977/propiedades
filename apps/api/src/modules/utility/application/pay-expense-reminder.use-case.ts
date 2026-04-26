import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';
import { ExpenseFrequency, UtilityType } from '@propiedades/types';

@Injectable()
export class PayExpenseReminderUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY)
    private readonly utilityRepository: IUtilityRepository,
  ) {}

  async execute(reminderId: string, userId?: string) {
    const reminder = await this.utilityRepository.findReminderById(reminderId);
    if (!reminder) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    // 1. Registrar el pago en el historial (Utility)
    await this.utilityRepository.create({
      propertyId: reminder.propertyId,
      type: this.mapTitleToUtilityType(reminder.title),
      amount: reminder.amount,
      isIncludedInRent: false,
      billingMonth: reminder.nextDueDate,
      notes: `${reminder.title} (Recurrente)`,
      recordedById: userId,
    });

    // 2. Calcular la siguiente fecha de vencimiento
    const nextDate = this.calculateNextDueDate(reminder.nextDueDate, reminder.frequency);

    // 3. Actualizar el recordatorio
    return this.utilityRepository.updateReminder(reminderId, {
      nextDueDate: nextDate,
    });
  }

  private calculateNextDueDate(currentDate: Date, frequency: ExpenseFrequency): Date {
    const date = new Date(currentDate);
    switch (frequency) {
      case ExpenseFrequency.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case ExpenseFrequency.BIMONTHLY:
        date.setMonth(date.getMonth() + 2);
        break;
      case ExpenseFrequency.QUARTERLY:
        date.setMonth(date.getMonth() + 3);
        break;
      case ExpenseFrequency.SEMIANNUAL:
        date.setMonth(date.getMonth() + 6);
        break;
      case ExpenseFrequency.ANNUAL:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }

  private mapTitleToUtilityType(title: string): UtilityType {
    const t = title.toLowerCase();
    
    // Priorizamos coincidencias más específicas o largas para evitar falsos positivos
    if (t.includes('comun')) return UtilityType.COMMON_EXPENSES;
    if (t.includes('contrib') || t.includes('tax') || t.includes('rol')) return UtilityType.TAX;
    if (t.includes('basura')) return UtilityType.GARBAGE;
    if (t.includes('segu')) return UtilityType.INSURANCE;
    if (t.includes('internet') || t.includes('wifi')) return UtilityType.INTERNET;
    if (t.includes('luz') || t.includes('elect')) return UtilityType.ELECTRICITY;
    if (t.includes('agua')) return UtilityType.WATER;
    
    // Check for 'gas' specifically as a word or clearly distinct
    if (t === 'gas' || t.includes(' gas ') || (t.includes('gas') && !t.includes('gasto'))) return UtilityType.GAS;
    
    return UtilityType.OTHER;
  }
}
