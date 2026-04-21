import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ORGANIZATION_REPOSITORY, IOrganizationRepository } from '../domain/organization.repository.port';
import { OrganizationRole } from '@propiedades/types';

@Injectable()
export class GetUserOrganizationsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(userId: string) {
    const memberships = await this.organizationRepo.findAllByUserId(userId);
    return memberships.map(m => ({
      ...m.organization,
      role: m.role,
    }));
  }
}

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(userId: string, data: { name: string }) {
    const slug = data.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);
    return this.organizationRepo.create({
      name: data.name,
      slug,
      creatorId: userId,
    });
  }
}

@Injectable()
export class GetOrganizationMembersUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(organizationId: string) {
    return this.organizationRepo.listMembers(organizationId);
  }
}

@Injectable()
export class InviteMemberUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(organizationId: string, email: string, role: OrganizationRole) {
    const user = await this.organizationRepo.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('El usuario no existe. Debe registrarse en la plataforma primero.');
    }

    const existingMember = await this.organizationRepo.findMember(organizationId, user.id);
    if (existingMember) {
      throw new BadRequestException('El usuario ya es miembro de esta empresa.');
    }

    return this.organizationRepo.addMember(organizationId, user.id, role);
  }
}

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(organizationId: string, authorId: string, userIdToRemove: string) {
    if (authorId === userIdToRemove) {
      throw new BadRequestException('No puedes revocar tu propio acceso por este medio.');
    }
    
    await this.organizationRepo.removeMember(organizationId, userIdToRemove);
  }
}

