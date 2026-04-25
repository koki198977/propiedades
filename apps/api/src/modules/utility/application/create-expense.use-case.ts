import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';

@Injectable()
export class CreateExpenseUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: {
    organizationId: string;
    propertyId?: string;
    amount: number;
    date: string;
    category: string;
    description: string;
    recordedById?: string;
  }) {
    return this.prisma.expense.create({
      data: {
        organizationId: data.organizationId,
        propertyId: data.propertyId,
        amount: data.amount,
        date: new Date(data.date),
        category: data.category,
        description: data.description,
        recordedById: data.recordedById,
      },
    });
  }
}
