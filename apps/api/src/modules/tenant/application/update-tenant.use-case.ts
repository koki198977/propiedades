import { Inject, Injectable } from '@nestjs/common';
import { ITenantRepository, TENANT_REPOSITORY } from '../domain/tenant.repository.port';
import { UpdateTenantDto } from '@propiedades/types';

@Injectable()
export class UpdateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(id: string, organizationId: string, userId: string, dto: UpdateTenantDto) {
    const tenant = await this.tenantRepo.findById(id);
    if (!tenant) throw new Error('Arrendatario no encontrado');
    
    if (tenant.organizationId !== organizationId) {
      throw new Error('Este arrendatario no pertenece a tu espacio de trabajo actual');
    }

    return this.tenantRepo.update(id, dto);
  }
}
