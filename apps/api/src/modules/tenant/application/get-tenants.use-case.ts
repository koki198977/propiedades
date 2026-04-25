import { Inject, Injectable } from '@nestjs/common';
import { ITenantRepository, TENANT_REPOSITORY } from '../domain/tenant.repository.port';
import { PaginationQuery } from '@propiedades/types';

@Injectable()
export class GetTenantsUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(organizationId: string, query?: PaginationQuery) {
    return this.tenantRepo.findAllByOrganizationId(organizationId, query);
  }
}
