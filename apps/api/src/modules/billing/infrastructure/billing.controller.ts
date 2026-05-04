import { Controller, Post, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { RequireRole } from '../../../shared/infrastructure/decorators/require-role.decorator';
import { OrganizationRole } from '@propiedades/types';
import { SendMonthlyBillsUseCase } from '../application/send-monthly-bills.use-case';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:id/billing')
export class BillingController {
  constructor(
    private readonly sendBillsUseCase: SendMonthlyBillsUseCase,
  ) {}

  @Post('send-all')
  @UseGuards(OrganizationGuard)
  @RequireRole(OrganizationRole.ADMIN)
  @ApiHeader({ name: 'x-organization-id', required: true })
  @ApiOperation({ summary: 'Enviar cobro de arriendo a todos los inquilinos activos' })
  async sendAll(@Param('id') id: string) {
    return this.sendBillsUseCase.execute(id);
  }

  @Post('tenancy/:tenancyId/send')
  @UseGuards(OrganizationGuard)
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @ApiHeader({ name: 'x-organization-id', required: true })
  @ApiOperation({ summary: 'Enviar cobro de arriendo a un inquilino específico' })
  async sendSingle(@Param('tenancyId') tenancyId: string) {
    return this.sendBillsUseCase.executeSingle(tenancyId);
  }
}
