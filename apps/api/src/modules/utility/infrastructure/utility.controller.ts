import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { RequireRole } from '../../../shared/infrastructure/decorators/require-role.decorator';
import { CreateUtilityUseCase } from '../application/create-utility.use-case';
import { GetUtilitiesUseCase } from '../application/get-utilities.use-case';
import { DeleteUtilityUseCase } from '../application/delete-utility.use-case';
import { CreateExpenseReminderUseCase } from '../application/create-expense-reminder.use-case';
import { GetExpenseRemindersUseCase } from '../application/get-expense-reminders.use-case';
import { DeleteExpenseReminderUseCase } from '../application/delete-expense-reminder.use-case';
import { PayExpenseReminderUseCase } from '../application/pay-expense-reminder.use-case';
import { CreateUtilityDto, CreateExpenseReminderDto, OrganizationRole } from '@propiedades/types';

@ApiTags('Utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('utilities')
export class UtilityController {
  constructor(
    private readonly createUtilityUseCase: CreateUtilityUseCase,
    private readonly getUtilitiesUseCase: GetUtilitiesUseCase,
    private readonly deleteUtilityUseCase: DeleteUtilityUseCase,
    private readonly createReminderUseCase: CreateExpenseReminderUseCase,
    private readonly getRemindersUseCase: GetExpenseRemindersUseCase,
    private readonly deleteReminderUseCase: DeleteExpenseReminderUseCase,
    private readonly payReminderUseCase: PayExpenseReminderUseCase,
  ) {}

  @Post()
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @ApiOperation({ summary: 'Registrar un nuevo gasto (servicio) para una propiedad' })
  async create(@Request() req: any, @Body() dto: CreateUtilityDto) {
    return this.createUtilityUseCase.execute(dto, req.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar gastos de mi organización' })
  async findAllGlobal(@Request() req: any) {
    return this.getUtilitiesUseCase.executeByOrganization(req.organizationId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Listar gastos por propiedad' })
  async findAll(@Param('propertyId') propertyId: string) {
    return this.getUtilitiesUseCase.execute(propertyId);
  }

  @Delete(':id')
  @RequireRole(OrganizationRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un gasto registrado' })
  async delete(@Param('id') id: string) {
    return this.deleteUtilityUseCase.execute(id);
  }

  // --- Reminders ---

  @Post('reminders')
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @ApiOperation({ summary: 'Crear un nuevo recordatorio de gasto' })
  async createReminder(@Request() req: any, @Body() dto: CreateExpenseReminderDto) {
    return this.createReminderUseCase.execute(dto, req.organizationId);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Obtener recordatorios activos de mi organización' })
  async findRemindersGlobal(@Request() req: any) {
    return this.getRemindersUseCase.executeByOrganization(req.organizationId);
  }

  @Get('reminders/property/:propertyId')
  @ApiOperation({ summary: 'Obtener recordatorios activos por propiedad' })
  async findReminders(@Param('propertyId') propertyId: string) {
    return this.getRemindersUseCase.execute(propertyId);
  }

  @Delete('reminders/:id')
  @RequireRole(OrganizationRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un recordatorio' })
  async deleteReminder(@Param('id') id: string) {
    return this.deleteReminderUseCase.execute(id);
  }

  @Post('reminders/:id/pay')
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @ApiOperation({ summary: 'Registrar pago de un recordatorio y avanzar fecha' })
  async payReminder(@Request() req: any, @Param('id') id: string) {
    return this.payReminderUseCase.execute(id, req.user.id);
  }
}
