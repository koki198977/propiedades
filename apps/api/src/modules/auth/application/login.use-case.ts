import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IAuthRepository, AUTH_REPOSITORY } from '../domain/auth.repository.port';
import { IOrganizationRepository, ORGANIZATION_REPOSITORY } from '../../organization/domain/organization.repository.port';
import { LoginDto, AuthTokensDto, UserProfileDto } from '@propiedades/types';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<{ user: UserProfileDto; tokens: AuthTokensDto }> {
    const user = await this.authRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    const organizations = await this.orgRepo.findAllByUserId(user.id);

    const tokens = this.generateTokens(user.id, user.email);
    return {
      user: {
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
            createdAt: o.organization!.createdAt.toISOString(),
          },
          createdAt: o.createdAt.toISOString(),
        })),
        createdAt: user.createdAt.toISOString(),
      },
      tokens,
    };
  }

  private generateTokens(userId: string, email: string): AuthTokensDto {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    };
  }
}
