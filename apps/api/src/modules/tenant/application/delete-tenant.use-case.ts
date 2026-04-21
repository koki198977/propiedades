import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ITenantRepository, TENANT_REPOSITORY } from '../domain/tenant.repository.port';

@Injectable()
export class DeleteTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(id: string, organizationId: string): Promise<void> {
    const tenant = await this.tenantRepo.findById(id);
    if (!tenant) throw new NotFoundException('Arrendatario no encontrado.');
    
    if (tenant.organizationId !== organizationId) {
      throw new ForbiddenException('No tienes permiso para eliminar este arrendatario');
    }
    
    await this.tenantRepo.delete(id);
  }
}
