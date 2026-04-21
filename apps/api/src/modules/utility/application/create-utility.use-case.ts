import { Inject, Injectable } from '@nestjs/common';
import { CreateUtilityDto } from '@propiedades/types';
import { IUtilityRepository, UTILITY_REPOSITORY } from '../domain/utility.repository.port';

@Injectable()
export class CreateUtilityUseCase {
  constructor(
    @Inject(UTILITY_REPOSITORY) private readonly utilityRepo: IUtilityRepository,
  ) {}

  async execute(dto: CreateUtilityDto, organizationId: string, userId?: string) {
    return this.utilityRepo.create({
      ...dto,
      billingMonth: dto.billingMonth ? new Date(dto.billingMonth) : undefined,
      recordedById: userId,
      notes: dto.title || dto.notes, // Use title as fallback for notes
    });
  }
}
