import { Controller, Post, UseGuards, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { RequireRole } from '../../../shared/infrastructure/decorators/require-role.decorator';
import { OrganizationRole } from '@propiedades/types';
import { SendMonthlyBillsUseCase } from '../application/send-monthly-bills.use-case';
import { CheckExpirationsCron } from '../../notification/application/check-expirations.cron';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations/:id/billing')
export class BillingController {
  constructor(
    private readonly sendBillsUseCase: SendMonthlyBillsUseCase,
    private readonly cronService: CheckExpirationsCron,
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

  // --- DEBUG ENDPOINT (Temporary) ---
  @Post('debug-trigger-cron')
  @RequireRole(OrganizationRole.ADMIN)
  @ApiOperation({ summary: 'FORZAR ejecución de cron de notificaciones (DEBUG)' })
  async triggerCronManually() {
    await this.cronService.handleCron();
    return { success: true, message: 'Cron job executed manually.' };
  }
}
