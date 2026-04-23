import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { FinancialStatementDto, UtilityType, PaymentMethod } from '@propiedades/types';

@Injectable()
export class GetFinancialStatementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(organizationId: string, startDate: Date, endDate: Date): Promise<FinancialStatementDto> {
    // Ensure endDate covers the whole day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 1. Fetch Income (Payments)
    const payments = await this.prisma.payment.findMany({
      where: {
        propertyTenant: {
          property: { organizationId }
        },
        paymentDate: {
          gte: startDate,
          lte: end,
        },
      },
      include: {
        propertyTenant: {
          include: {
            property: true,
            tenant: true,
          }
        },
        recordedBy: true,
      },
      orderBy: { paymentDate: 'desc' },
    });

    // 2. Fetch Expenses/Costs (Utilities)
    const utilities = await this.prisma.utility.findMany({
      where: {
        property: { organizationId },
        OR: [
          { billingMonth: { gte: startDate, lte: end } },
          { billingMonth: null, createdAt: { gte: startDate, lte: end } }
        ]
      },
      include: {
        property: true,
        recordedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Fetch General Expenses (New Expense Model)
    const expenses = await this.prisma.expense.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: end },
      },
      include: {
        property: true,
        recordedBy: true,
      },
      orderBy: { date: 'desc' },
    });

    // 4. Process Income
    const incomeItems = payments.map(p => ({
      id: p.id,
      date: p.paymentDate.toISOString(),
      propertyAddress: p.propertyTenant.property.address,
      tenantName: p.propertyTenant.tenant.name,
      amount: Number(p.amount),
      method: p.paymentMethod as PaymentMethod,
      notes: p.notes || undefined,
      recordedBy: p.recordedBy?.fullName || 'Sistema',
    }));
    const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);

    // 5. Process Expenses vs Costs
    // Classification: 
    // Costs (Gastos Propietario/Inversión): TAX, INSURANCE, OTHER (maintenance usually)
    // Expenses (Servicios Operacionales): ELECTRICITY, WATER, GAS, INTERNET, COMMON_EXPENSES
    const costTypes = [UtilityType.TAX, UtilityType.INSURANCE, UtilityType.OTHER];
    
    // Mapping utilities (Legacy)
    const utilityExpenseItems = utilities
      .filter(u => !costTypes.includes(u.type as UtilityType))
      .map(u => ({
        id: u.id,
        date: u.createdAt.toISOString(),
        propertyAddress: u.property.address,
        type: u.type as UtilityType,
        amount: Number(u.amount),
        description: u.notes || undefined,
        recordedBy: u.recordedBy?.fullName || 'Sistema',
      }));

    const utilityCostItems = utilities
      .filter(u => costTypes.includes(u.type as UtilityType))
      .map(u => ({
        id: u.id,
        date: u.createdAt.toISOString(),
        propertyAddress: u.property.address,
        type: u.type as UtilityType,
        amount: Number(u.amount),
        description: u.notes || undefined,
        recordedBy: u.recordedBy?.fullName || 'Sistema',
      }));

    // Mapping NEW expenses
    // We treat them as 'OTHER' type for DTO compatibility if it's a cost or a generic expense
    const generalExpenseItems = expenses.map(e => ({
      id: e.id,
      date: e.date.toISOString(),
      propertyAddress: e.property?.address || 'Gastos Generales',
      type: UtilityType.OTHER, // Defaulting to OTHER for compatibility
      amount: Number(e.amount),
      description: `[${e.category}] ${e.description}`,
      recordedBy: e.recordedBy?.fullName || 'Sistema',
    }));

    // Combine them (For now we'll put all general expenses into expenseItems)
    const expenseItems = [...utilityExpenseItems, ...generalExpenseItems];
    const costItems = utilityCostItems;

    const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const totalCosts = costItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: end.toISOString(),
      },
      summary: {
        totalIncome,
        totalExpenses,
        totalCosts,
        netResult: totalIncome - (totalExpenses + totalCosts),
      },
      income: {
        items: incomeItems,
        total: totalIncome,
      },
      expenses: {
        items: expenseItems,
        total: totalExpenses,
      },
      costs: {
        items: costItems,
        total: totalCosts,
      },
    };
  }
}
