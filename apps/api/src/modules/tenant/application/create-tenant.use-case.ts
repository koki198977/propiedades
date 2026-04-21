import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CreateTenantDto } from '@propiedades/types';
import { ITenantRepository, TENANT_REPOSITORY } from '../domain/tenant.repository.port';

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(userId: string, organizationId: string, dto: CreateTenantDto) {
    // Validar unicidad de RUT/documentId por organización
    if (dto.documentId) {
      const existingByRut = await this.tenantRepo.findByDocumentIdAndOrg(dto.documentId, organizationId);
      if (existingByRut) {
        throw new ConflictException('Ya hay un arrendatario registrado con ese RUT/documento en este espacio de trabajo.');
      }
    }

    // Validar unicidad de email por organización
    if (dto.email) {
      const existingByEmail = await this.tenantRepo.findByEmailAndOrg(dto.email, organizationId);
      if (existingByEmail) {
        throw new ConflictException('Ya hay un arrendatario registrado con ese email en este espacio de trabajo.');
      }
    }

    return this.tenantRepo.create({
      ...dto,
      userId,
      organizationId,
    });
  }
}
