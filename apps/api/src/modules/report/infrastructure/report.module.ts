import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { GetDashboardMetricsUseCase } from '../application/get-dashboard-metrics.use-case';
import { GetFinancialStatementUseCase } from '../application/get-financial-statement.use-case';

@Module({
  controllers: [ReportController],
  providers: [
    GetDashboardMetricsUseCase,
    GetFinancialStatementUseCase,
  ],
  exports: [GetDashboardMetricsUseCase, GetFinancialStatementUseCase],
})
export class ReportModule {}
