import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { CreateTenantUseCase } from '../application/create-tenant.use-case';
import { GetTenantsUseCase } from '../application/get-tenants.use-case';
import { GetTenantByIdUseCase } from '../application/get-tenant-by-id.use-case';
import { UpdateTenantUseCase } from '../application/update-tenant.use-case';
import { DeleteTenantUseCase } from '../application/delete-tenant.use-case';
import { TENANT_REPOSITORY } from '../domain/tenant.repository.port';
import { PrismaTenantRepository } from './prisma-tenant.repository';

@Module({
  controllers: [TenantController],
  providers: [
    CreateTenantUseCase,
    GetTenantsUseCase,
    GetTenantByIdUseCase,
    UpdateTenantUseCase,
    DeleteTenantUseCase,
    {
      provide: TENANT_REPOSITORY,
      useClass: PrismaTenantRepository,
    },
  ],
  exports: [TENANT_REPOSITORY],
})
export class TenantModule {}


