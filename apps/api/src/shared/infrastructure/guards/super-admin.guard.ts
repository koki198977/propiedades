import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@propiedades/types';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('No tienes permisos de Super Administrador para acceder a este recurso.');
    }

    return true;
  }
}
