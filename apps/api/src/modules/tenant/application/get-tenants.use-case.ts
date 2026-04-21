import { Inject, Injectable } from '@nestjs/common';
import { ITenantRepository, TENANT_REPOSITORY } from '../domain/tenant.repository.port';

@Injectable()
export class GetTenantsUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(organizationId: string) {
    return this.tenantRepo.findAllByOrganizationId(organizationId);
  }
}
