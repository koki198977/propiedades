import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IAuthRepository, AUTH_REPOSITORY } from '../domain/auth.repository.port';
import { UpdateProfileDto, UserProfileDto } from '@propiedades/types';
import { GetProfileUseCase } from './get-profile.use-case';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    private readonly getProfile: GetProfileUseCase,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.authRepo.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = {};

    if (dto.fullName) updateData.fullName = dto.fullName.trim();
    
    if (dto.email && dto.email !== user.email) {
      const existing = await this.authRepo.findByEmail(dto.email);
      if (existing) throw new ConflictException('El email ya está registrado');
      updateData.email = dto.email.toLowerCase().trim();
    }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await this.authRepo.update(userId, updateData);
    }

    return this.getProfile.execute(userId);
  }
}
