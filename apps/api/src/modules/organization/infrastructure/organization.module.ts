import { Module, Global } from '@nestjs/common';
import { ORGANIZATION_REPOSITORY } from '../domain/organization.repository.port';
import { PrismaOrganizationRepository } from './prisma-organization.repository';
import { 
  GetUserOrganizationsUseCase, 
  CreateOrganizationUseCase, 
  UpdateOrganizationUseCase,
  GetOrganizationMembersUseCase,
  InviteMemberUseCase,
  RemoveMemberUseCase
} from '../application/organization.use-cases';
import { OrganizationController } from './organization.controller';

@Global()
@Module({
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: PrismaOrganizationRepository,
    },
    GetUserOrganizationsUseCase,
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    GetOrganizationMembersUseCase,
    InviteMemberUseCase,
    RemoveMemberUseCase,
  ],
  controllers: [OrganizationController],
  exports: [
    ORGANIZATION_REPOSITORY,
    GetUserOrganizationsUseCase,
  ],
})
export class OrganizationModule {}
