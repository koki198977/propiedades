import { SetMetadata } from '@nestjs/common';
import { OrganizationRole } from '@propiedades/types';

export const ROLES_KEY = 'organization_roles';
export const RequireRole = (...roles: OrganizationRole[]) => SetMetadata(ROLES_KEY, roles);
