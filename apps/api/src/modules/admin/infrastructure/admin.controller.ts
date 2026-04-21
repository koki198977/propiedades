import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../../shared/infrastructure/guards/super-admin.guard';
import { 
  ListAllOrganizationsUseCase, 
  ListAllUsersUseCase, 
  AdminCreateOrganizationUseCase, 
  AssignUserToOrganizationUseCase 
} from '../application/admin.use-cases';
import { OrganizationRole } from '@propiedades/types';

@Controller('admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminController {
  constructor(
    private readonly listOrgs: ListAllOrganizationsUseCase,
    private readonly listUsers: ListAllUsersUseCase,
    private readonly createOrg: AdminCreateOrganizationUseCase,
    private readonly assignUser: AssignUserToOrganizationUseCase,
  ) {}

  @Get('organizations')
  async getAllOrganizations() {
    return this.listOrgs.execute();
  }

  @Get('users')
  async getAllUsers() {
    return this.listUsers.execute();
  }

  @Post('organizations')
  async createOrganization(@Body() data: { name: string, slug?: string }) {
    return this.createOrg.execute(data);
  }

  @Post('organizations/:id/assign-admin')
  async assignAdmin(@Param('id') organizationId: string, @Body() data: { userId: string }) {
    return this.assignUser.execute(organizationId, data.userId, OrganizationRole.ADMIN);
  }
}
