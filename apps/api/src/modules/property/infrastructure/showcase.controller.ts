import { Controller, Get, Param, Inject, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IPropertyRepository, PROPERTY_REPOSITORY } from '../domain/property.repository.port';

@ApiTags('Showcase')
@Controller('showcase')
export class ShowcaseController {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly propertyRepo: IPropertyRepository & { prisma: any },
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener propiedades disponibles públicas de un usuario' })
  async getPublicShowcase(@Param('userId') userId: string) {
    const user = await this.propertyRepo.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const memberships = await this.propertyRepo.prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true }
    });
    const organizationIds = memberships.map(m => m.organizationId);
    
    const displayName = memberships.length > 0 ? memberships[0].organization.name : user.fullName;

    const properties = await this.propertyRepo.prisma.property.findMany({
      where: { 
        OR: [
          { userId },
          { organizationId: { in: organizationIds } }
        ],
        isActive: true,
        tenants: {
          none: { 
            isActive: true,
            tenant: {
              name: { not: 'Histórico Sistema Anterior' }
            }
          }
        }
      },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      owner: {
        name: displayName,
        email: user.email,
        whatsapp: '+56900000000'
      },
      properties: properties.map(p => ({
        id: p.id,
        category: p.category,
        address: p.name || 'Propiedad sin nombre', // Usamos el nombre descriptivo como "dirección pública"
        notes: p.notes,
        expectedRent: p.expectedRent,
        photos: p.photos.map(ph => ({ url: ph.url, order: ph.order }))
      }))
    };
  }

  @Get(':userId/property/:propertyId')
  @ApiOperation({ summary: 'Obtener detalles públicos de una propiedad específica' })
  async getPublicPropertyDetail(@Param('userId') userId: string, @Param('propertyId') propertyId: string) {
    const property = await this.propertyRepo.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        photos: { orderBy: { order: 'asc' } },
        meters: true,
        user: { select: { fullName: true, email: true } },
        organization: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    return {
      owner: {
        name: property.organization?.name || property.user.fullName,
        email: property.user.email,
        whatsapp: '+56900000000'
      },
      property: {
        id: property.id,
        category: property.category,
        address: property.name || 'Propiedad sin nombre', // Título público
        city: property.city,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        m2Built: property.m2Built,
        hasParking: property.hasParking,
        hasStorage: property.hasStorage,
        notes: property.notes,
        expectedRent: property.expectedRent,
        photos: property.photos.map(ph => ({ url: ph.url, order: ph.order })),
      }
    };
  }
}
