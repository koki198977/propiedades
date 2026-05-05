import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAuthRepository, AUTH_REPOSITORY } from '../domain/auth.repository.port';
import { IOrganizationRepository, ORGANIZATION_REPOSITORY } from '../../organization/domain/organization.repository.port';
import { UserProfileDto } from '@propiedades/types';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
  ) {}

  async execute(userId: string): Promise<UserProfileDto> {
    const user = await this.authRepo.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const organizations = await this.orgRepo.findAllByUserId(user.id);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organizations: organizations.map(o => ({
        id: o.id,
        organizationId: o.organizationId,
        userId: o.userId,
        role: o.role,
        organization: {
          id: o.organization!.id,
          name: o.organization!.name,
          slug: o.organization!.slug,
          bankName: o.organization!.bankName,
          bankAccountType: o.organization!.bankAccountType,
          bankAccountNumber: o.organization!.bankAccountNumber,
          bankAccountRut: o.organization!.bankAccountRut,
          bankAccountEmail: o.organization!.bankAccountEmail,
          createdAt: o.organization!.createdAt.toISOString(),
        },
        createdAt: o.createdAt.toISOString(),
      })),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
