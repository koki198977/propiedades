import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ORGANIZATION_REPOSITORY, IOrganizationRepository } from '../../organization/domain/organization.repository.port';
import { AUTH_REPOSITORY, IAuthRepository } from '../../auth/domain/auth.repository.port';
import { OrganizationRole } from '@propiedades/types';

@Injectable()
export class ListAllOrganizationsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute() {
    return this.organizationRepo.findAll();
  }
}

@Injectable()
export class ListAllUsersUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
  ) {}

  async execute() {
    return this.authRepo.findAll();
  }
}

@Injectable()
export class AdminCreateOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(data: { name: string, slug?: string }) {
    const slug = data.slug || (data.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7));
    
    const existing = await this.organizationRepo.findBySlug(slug);
    if (existing) {
      throw new BadRequestException('El slug de la organización ya existe.');
    }

    return this.organizationRepo.create({
      name: data.name,
      slug,
    });
  }
}

@Injectable()
export class AssignUserToOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(organizationId: string, userId: string, role: OrganizationRole = OrganizationRole.ADMIN) {
    const existingMember = await this.organizationRepo.findMember(organizationId, userId);
    if (existingMember) {
      // Si ya es miembro, actualizamos el rol a ADMIN (o el solicitado)
      await this.organizationRepo.updateMemberRole(organizationId, userId, role);
      return this.organizationRepo.findMember(organizationId, userId);
    }

    return this.organizationRepo.addMember(organizationId, userId, role);
  }
}
