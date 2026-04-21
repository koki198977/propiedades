import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';
import { CloudinaryService } from '../../../shared/infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class DeletePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository & { 
      // Need extra methods for photos
      getPhoto?: (id: string) => Promise<any>;
    },
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(propertyId: string, organizationId: string): Promise<void> {
    const property = await this.propertyRepo.findById(propertyId);
    
    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    if (property.organizationId !== organizationId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta propiedad');
    }

    // 1. Delete photos from Cloudinary
    if (property.photos && property.photos.length > 0) {
      console.log(`🧹 Eliminando ${property.photos.length} fotos de Cloudinary para propiedad ${propertyId}`);
      for (const photo of property.photos) {
        try {
          if (photo.publicId && photo.publicId !== 'legacy-import') {
            await this.cloudinaryService.deleteImage(photo.publicId);
          }
        } catch (error) {
          console.warn(`No se pudo eliminar la imagen ${photo.publicId} de Cloudinary:`, error);
          // Continue with other photos
        }
      }
    }

    // 2. Delete from database
    // The repository's delete method should handle this.
    // Due to ON DELETE CASCADE in Prisma, related rows (meters, active contracts, etc.) are deleted automatically.
    try {
      await this.propertyRepo.delete(propertyId);
    } catch (error) {
      console.error("Error al eliminar propiedad de DB:", error);
      throw new BadRequestException('Error al eliminar la propiedad de la base de datos');
    }
  }
}
