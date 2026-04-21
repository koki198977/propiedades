import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { RequireRole } from '../../../shared/infrastructure/decorators/require-role.decorator';
import { GetDashboardMetricsUseCase } from '../application/get-dashboard-metrics.use-case';
import { GetFinancialStatementUseCase } from '../application/get-financial-statement.use-case';
import { OrganizationRole } from '@propiedades/types';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('reports')
export class ReportController {
  constructor(
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private readonly getFinancialStatementUseCase: GetFinancialStatementUseCase,
  ) {}

  @Get('dashboard')
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR, OrganizationRole.VIEWER)
  @ApiOperation({ summary: 'Obtener métricas y KPIs para el dashboard' })
  async getDashboard(@Request() req: any) {
    return this.getDashboardMetricsUseCase.execute(req.organizationId);
  }

  @Get('statement')
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR, OrganizationRole.VIEWER)
  @ApiOperation({ summary: 'Obtener rendición de caja (ingresos y egresos) por rango de fechas' })
  async getStatement(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    
    // Default to 'today' if no dates provided
    if (!startDate && !endDate) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return this.getFinancialStatementUseCase.execute(req.organizationId, start, end);
  }
}
