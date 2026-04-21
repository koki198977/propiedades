import { Controller, Get, Param, Inject, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';

// Interfaz para la dependencia del usuario (asumimos que existe un tenant repository interno pero Prisma directo funciona mejor para leer un dato público si lo inyectamos)
// Para simplificar y hacerlo limpio, vamos a consultar los datos públicos mediante el PropertyRepository.

@ApiTags('Showcase')
@Controller('showcase')
export class ShowcaseController {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository & { prisma: any },
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener propiedades disponibles públicas de un usuario' })
  async getPublicShowcase(@Param('userId') userId: string) {
    // 1. Obtener el usuario (sólo nombre y email o contacto público)
    // Para simplificar usamos la base de datos de Prisma que está anexada al repositorio
    const user = await this.propertyRepo.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Obtener propiedades disponibles (sin contrato activo)
    const properties = await this.propertyRepo.prisma.property.findMany({
      where: { 
        userId, 
        isActive: true,
        tenants: {
          none: { isActive: true } // Que no tengan inquilinos activos
        }
      },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Mapear los datos públicos (remover información sensible si existiera)
    return {
      owner: {
        name: user.fullName,
        email: user.email,
        whatsapp: '+56900000000' // En el futuro se podría traer desde el perfil del usuario
      },
      properties: properties.map(p => ({
        id: p.id,
        category: p.category,
        address: p.address,
        notes: p.notes,
        expectedRent: p.expectedRent,
        photos: p.photos.map(ph => ({ url: ph.url, order: ph.order }))
      }))
    };
  }
}
