import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { IUtilityRepository } from '../domain/utility.repository.port';
import { Utility } from '../domain/utility.entity';
import { ExpenseReminder } from '../domain/expense-reminder.entity';
import { UtilityType } from '@propiedades/types';

@Injectable()
export class PrismaUtilityRepository implements IUtilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOrganizationId(organizationId: string): Promise<Utility[]> {
    const utilities = await this.prisma.utility.findMany({
      where: {
        property: {
          organizationId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return utilities.map(u => this.mapToEntity(u));
  }

  async findAllByPropertyId(propertyId: string): Promise<Utility[]> {
    const utilities = await this.prisma.utility.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
    return utilities.map(u => this.mapToEntity(u));
  }

  async create(data: { propertyId: string; type: UtilityType; amount: number; isIncludedInRent: boolean; billingMonth?: Date; notes?: string; recordedById?: string }): Promise<Utility> {
    const utility = await this.prisma.utility.create({
      data: {
        propertyId: data.propertyId,
        type: data.type,
        amount: data.amount,
        isIncludedInRent: data.isIncludedInRent,
        billingMonth: data.billingMonth ? new Date(data.billingMonth) : null,
        notes: data.notes,
        recordedById: data.recordedById,
      },
    });
    return this.mapToEntity(utility);
  }

  async update(id: string, data: any): Promise<Utility> {
    const utility = await this.prisma.utility.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount,
        isIncludedInRent: data.isIncludedInRent,
        billingMonth: data.billingMonth ? new Date(data.billingMonth) : null,
        notes: data.notes,
      },
    });
    return this.mapToEntity(utility);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.utility.delete({
      where: { id },
    });
  }

  // Expense Reminders
  async findReminderById(id: string): Promise<ExpenseReminder | null> {
    const reminder = await this.prisma.expenseReminder.findUnique({
      where: { id },
    });
    if (!reminder) return null;
    return this.mapReminderToEntity(reminder);
  }

  async findAllRemindersByOrganizationId(organizationId: string): Promise<ExpenseReminder[]> {
    const reminders = await this.prisma.expenseReminder.findMany({
      where: {
        property: {
          organizationId,
        },
        isActive: true,
      },
      orderBy: { nextDueDate: 'asc' },
    });
    return reminders.map(r => this.mapReminderToEntity(r));
  }

  async findAllRemindersByPropertyId(propertyId: string): Promise<ExpenseReminder[]> {
    const reminders = await this.prisma.expenseReminder.findMany({
      where: { propertyId, isActive: true },
      orderBy: { nextDueDate: 'asc' },
    });
    return reminders.map(r => this.mapReminderToEntity(r));
  }

  async createReminder(data: any): Promise<ExpenseReminder> {
    const reminder = await this.prisma.expenseReminder.create({
      data: {
        propertyId: data.propertyId,
        title: data.title,
        amount: data.amount,
        frequency: data.frequency,
        nextDueDate: new Date(data.nextDueDate),
        isActive: data.isActive ?? true,
      },
    });
    return this.mapReminderToEntity(reminder);
  }

  async updateReminder(id: string, data: any): Promise<ExpenseReminder> {
    const reminder = await this.prisma.expenseReminder.update({
      where: { id },
      data: {
        title: data.title,
        amount: data.amount,
        frequency: data.frequency,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
        isActive: data.isActive,
      },
    });
    return this.mapReminderToEntity(reminder);
  }

  async deleteReminder(id: string): Promise<void> {
    await this.prisma.expenseReminder.delete({
      where: { id },
    });
  }

  private mapToEntity(u: any): Utility {
    return new Utility(
      u.id,
      u.propertyId,
      u.type,
      Number(u.amount),
      u.isIncludedInRent,
      u.billingMonth,
      u.notes,
      u.recordedById,
      u.createdAt,
      u.updatedAt,
    );
  }

  private mapReminderToEntity(r: any): ExpenseReminder {
    return new ExpenseReminder(
      r.id,
      r.propertyId,
      r.title,
      Number(r.amount),
      r.frequency,
      r.nextDueDate,
      r.isActive,
      r.createdAt,
    );
  }
}
