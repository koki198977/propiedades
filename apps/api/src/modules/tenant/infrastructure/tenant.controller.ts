import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { RequireRole } from '../../../shared/infrastructure/decorators/require-role.decorator';
import { CreateTenantUseCase } from '../application/create-tenant.use-case';
import { GetTenantsUseCase } from '../application/get-tenants.use-case';
import { GetTenantByIdUseCase } from '../application/get-tenant-by-id.use-case';
import { UpdateTenantUseCase } from '../application/update-tenant.use-case';
import { DeleteTenantUseCase } from '../application/delete-tenant.use-case';
import { CreateTenantDto, UpdateTenantDto, OrganizationRole, PaginationQuery } from '@propiedades/types';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly getTenantsUseCase: GetTenantsUseCase,
    private readonly getTenantByIdUseCase: GetTenantByIdUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly deleteTenantUseCase: DeleteTenantUseCase,
  ) {}

  @Post()
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @ApiOperation({ summary: 'Registrar un nuevo arrendatario' })
  async create(@Request() req: any, @Body() dto: CreateTenantDto) {
    return this.createTenantUseCase.execute(req.user.id, req.organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar arrendatarios de mi organización' })
  async findAll(@Request() req: any, @Query() query: PaginationQuery) {
    return this.getTenantsUseCase.execute(req.organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un arrendatario' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.getTenantByIdUseCase.execute(id, req.organizationId);
  }

  @Patch(':id')
  @RequireRole(OrganizationRole.ADMIN, OrganizationRole.EDITOR)
  @ApiOperation({ summary: 'Actualizar información de un arrendatario' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.updateTenantUseCase.execute(id, req.organizationId, req.user.id, dto);
  }

  @Delete(':id')
  @RequireRole(OrganizationRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un arrendatario' })
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.deleteTenantUseCase.execute(id, req.organizationId);
  }
}
