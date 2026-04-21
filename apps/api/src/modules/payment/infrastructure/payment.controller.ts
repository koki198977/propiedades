import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { RequireRole } from '../../../shared/infrastructure/decorators/require-role.decorator';
import { CreatePaymentUseCase } from '../application/create-payment.use-case';
import { GetPaymentsUseCase } from '../application/get-payments.use-case';
import { DeletePaymentUseCase } from '../application/delete-payment.use-case';
import { CreatePaymentDto, OrganizationRole } from '@propiedades/types';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentsUseCase: GetPaymentsUseCase,
    private readonly deletePaymentUseCase: DeletePaymentUseCase,
  ) {}

  @Post()
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @ApiOperation({ summary: 'Registrar un nuevo pago de arriendo' })
  async create(@Request() req: any, @Body() dto: CreatePaymentDto) {
    return this.createPaymentUseCase.execute(req.user.id, req.organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cobros de mi organización' })
  async findAll(@Request() req: any) {
    return this.getPaymentsUseCase.executeByOrganization(req.organizationId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Listar pagos por propiedad' })
  async findByProperty(@Request() req: any, @Param('propertyId') propertyId: string) {
    // In the future, we should probably verify that propertyId belongs to req.organizationId
    return this.getPaymentsUseCase.executeByProperty(propertyId);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Listar pagos por arrendatario/ocupación' })
  async findByTenant(@Request() req: any, @Param('tenantId') tenantId: string) {
    // In the future, we should probably verify that tenantId belongs to req.organizationId
    return this.getPaymentsUseCase.executeByTenant(tenantId);
  }

  @Delete(':id')
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un registro de pago' })
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.deletePaymentUseCase.execute(req.organizationId, id);
  }
}
