import { Inject, Injectable, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { IAuthRepository, AUTH_REPOSITORY } from '../domain/auth.repository.port'
import { RegisterDto, AuthTokensDto, UserProfileDto, UserRole, OrganizationRole } from '@propiedades/types'
import { IOrganizationRepository, ORGANIZATION_REPOSITORY } from '../../organization/domain/organization.repository.port'

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RegisterDto): Promise<{ user: UserProfileDto; tokens: AuthTokensDto }> {
    const existing = await this.authRepo.findByEmail(dto.email)
    if (existing) throw new ConflictException('El email ya está registrado')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.authRepo.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      fullName: dto.fullName.trim(),
      role: UserRole.ADMIN,
    })

    // Create default organization
    const org = await this.orgRepo.create({
      name: `Mi Propiedad`,
      slug: `mi-propiedad-${Date.now()}`,
      creatorId: user.id, // Owner
    })

    const tokens = this.generateTokens(user.id, user.email)
    return {
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role, 
        organizations: [{
          id: org.members[0].id,
          organizationId: org.id,
          userId: user.id,
          role: OrganizationRole.ADMIN,
          organization: {
            id: org.id,
            name: org.name,
            slug: org.slug,
            createdAt: org.createdAt.toISOString(),
          },
          createdAt: org.createdAt.toISOString(),
        } as any],
        createdAt: user.createdAt.toISOString() 
      },
      tokens,
    }
  }

  private generateTokens(userId: string, email: string): AuthTokensDto {
    const payload = { sub: userId, email }
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    }
  }
}
