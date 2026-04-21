import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(organizationId: string) {
    // 1. Total Properties
    const totalProperties = await this.prisma.property.count({
      where: { organizationId },
    });

    // 2. Occupancy Rate
    const totalTenants = await this.prisma.propertyTenant.count({
      where: {
        property: { organizationId },
        isActive: true,
      },
    });
    const occupancyRate = totalProperties > 0 ? (totalTenants / totalProperties) * 100 : 0;

    // 3. Total Income (Current Month)
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    const monthlyIncome = await this.prisma.payment.aggregate({
      where: {
        propertyTenant: {
          property: { organizationId }
        },
        paymentDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const monthlyExpenses = await this.prisma.utility.aggregate({
      where: {
        property: { organizationId },
        OR: [
          { billingMonth: { gte: startOfMonth, lte: endOfMonth } },
          { billingMonth: null, createdAt: { gte: startOfMonth, lte: endOfMonth } } 
        ]
      },
      _sum: { amount: true },
    });

    const incomeSum = Number(monthlyIncome._sum.amount || 0);
    const expensesSum = Number(monthlyExpenses._sum.amount || 0);

    // 4. Monthly Income History (Last 6 months)
    const incomeHistory = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
      const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999));

      const income = await this.prisma.payment.aggregate({
        where: {
          propertyTenant: {
            property: { organizationId }
          },
          paymentDate: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const exp = await this.prisma.utility.aggregate({
        where: {
          property: { organizationId },
          OR: [
            { billingMonth: { gte: start, lte: end } },
            { billingMonth: null, createdAt: { gte: start, lte: end } }
          ]
        },
        _sum: { amount: true }
      });

      const currIncome = Number(income._sum.amount || 0);
      const currExpenses = Number(exp._sum.amount || 0);

      incomeHistory.push({
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        income: currIncome,
        expenses: currExpenses,
        netIncome: currIncome - currExpenses,
      });
    }

    return {
      kpis: {
        totalProperties,
        activeTenants: totalTenants,
        occupancyRate: Math.round(occupancyRate),
        monthlyIncomeSum: incomeSum,
        monthlyExpensesSum: expensesSum,
        netIncomeSum: incomeSum - expensesSum,
      },
      incomeHistory, // Now contains income, expenses, and netIncome!
    };
  }
}
