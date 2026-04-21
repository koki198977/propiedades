import { Inject, Injectable } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';
import { UpdatePropertyDto } from '@propiedades/types';

@Injectable()
export class UpdatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository,
  ) {}

  async execute(id: string, organizationId: string, userId: string, dto: UpdatePropertyDto) {
    const property = await this.propertyRepo.findById(id);
    if (!property) throw new Error('Propiedad no encontrada');
    
    // El guardia ya verificó que el usuario tiene acceso a la organización enviada.
    // Aquí verificamos que la propiedad realmente pertenezca a esa organización.
    if (property.organizationId !== organizationId) {
      throw new Error('Esta propiedad no pertenece a tu espacio de trabajo actual');
    }

    const updateData: any = {
      address: dto.address,
      category: dto.category,
      paymentDueDay: dto.paymentDueDay,
      rol: dto.rol,
      notes: dto.notes,
    };

    if (dto.contractEndDate) {
      updateData.contractEndDate = new Date(dto.contractEndDate);
    }

    return this.propertyRepo.update(id, updateData);
  }
}
