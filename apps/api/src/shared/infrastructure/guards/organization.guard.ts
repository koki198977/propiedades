import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORGANIZATION_REPOSITORY, IOrganizationRepository } from '../../../modules/organization/domain/organization.repository.port';
import { ROLES_KEY } from '../decorators/require-role.decorator';
import { OrganizationRole } from '@propiedades/types';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepo: IOrganizationRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.headers['x-organization-id'];

    if (!organizationId) {
      throw new BadRequestException('Falta el encabezado x-organization-id');
    }

    if (!user) {
      return false;
    }

    const member = await this.organizationRepo.findMember(organizationId as string, user.id);
    if (!member) {
      throw new ForbiddenException('No tienes acceso a esta organización');
    }

    // Adjuntar info de la organización al request para que lo usen los controllers y el RolesGuard
    request.organizationId = organizationId;
    request.userOrgRole = member.role;

    // Verificar Roles si el decorador está presente
    const requiredRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.includes(member.role);
    if (!hasRole) {
      throw new ForbiddenException(`Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
