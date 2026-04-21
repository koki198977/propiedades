import { Controller, Get, Post, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { RequireRole } from '../../../shared/infrastructure/decorators/require-role.decorator';
import { 
  GetUserOrganizationsUseCase, 
  CreateOrganizationUseCase, 
  UpdateOrganizationUseCase,
  GetOrganizationMembersUseCase,
  InviteMemberUseCase,
  RemoveMemberUseCase
} from '../application/organization.use-cases';
import { CreateOrganizationDto, InviteMemberDto, OrganizationRole } from '@propiedades/types';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly getOrgsUseCase: GetUserOrganizationsUseCase,
    private readonly createOrgUseCase: CreateOrganizationUseCase,
    private readonly updateOrgUseCase: UpdateOrganizationUseCase,
    private readonly getMembersUseCase: GetOrganizationMembersUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis organizaciones' })
  async findMyOrganizations(@Request() req: any) {
    return this.getOrgsUseCase.execute(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva organización' })
  async create(@Request() req: any, @Body() dto: CreateOrganizationDto) {
    return this.createOrgUseCase.execute(req.user.id, dto);
  }

  @Post(':id') // Using POST for update due to frontend preferences or PATCH
  @UseGuards(OrganizationGuard)
  @RequireRole(OrganizationRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos de la organización' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.updateOrgUseCase.execute(id, dto);
  }

  @Get(':id/members')
  @UseGuards(OrganizationGuard)
  @ApiHeader({ name: 'x-organization-id', required: true })
  @ApiOperation({ summary: 'Listar miembros de la organización' })
  async findMembers(@Param('id') id: string) {
    return this.getMembersUseCase.execute(id);
  }

  @Post(':id/members')
  @UseGuards(OrganizationGuard)
  @RequireRole(OrganizationRole.ADMIN)
  @ApiHeader({ name: 'x-organization-id', required: true })
  @ApiOperation({ summary: 'Invitar un nuevo miembro a la organización' })
  async inviteMember(@Param('id') id: string, @Body() dto: InviteMemberDto) {
    return this.inviteMemberUseCase.execute(id, dto.email, dto.role);
  }

  @Delete(':id/members/:userId')
  @UseGuards(OrganizationGuard)
  @RequireRole(OrganizationRole.ADMIN)
  @ApiHeader({ name: 'x-organization-id', required: true })
  @ApiOperation({ summary: 'Revocar acceso de un miembro' })
  async removeMember(@Param('id') id: string, @Request() req: any, @Param('userId') userIdToRemove: string) {
    return this.removeMemberUseCase.execute(id, req.user.id, userIdToRemove);
  }
}

