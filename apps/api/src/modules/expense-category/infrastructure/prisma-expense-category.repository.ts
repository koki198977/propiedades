import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { IExpenseCategoryRepository } from '../domain/expense-category.repository.port';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '@propiedades/types';
import { ExpenseCategory } from '@prisma/client';

@Injectable()
export class PrismaExpenseCategoryRepository implements IExpenseCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, data: CreateExpenseCategoryDto): Promise<ExpenseCategory> {
    return this.prisma.expenseCategory.create({
      data: {
        organizationId,
        name: data.name.trim(),
      },
    });
  }

  async findAll(organizationId: string, includeInactive = false): Promise<ExpenseCategory[]> {
    return this.prisma.expenseCategory.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, organizationId: string, data: UpdateExpenseCategoryDto): Promise<ExpenseCategory> {
    const existing = await this.prisma.expenseCategory.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== organizationId) throw new Error('Not found');

    return this.prisma.expenseCategory.update({
      where: { id },
      data,
    });
  }

  async findByName(organizationId: string, name: string): Promise<ExpenseCategory | null> {
    return this.prisma.expenseCategory.findUnique({
      where: { organizationId_name: { organizationId, name: name.trim() } },
    });
  }
}
