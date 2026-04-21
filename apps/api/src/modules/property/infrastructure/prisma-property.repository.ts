import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { IPropertyRepository } from '../domain/property.repository.port';
import { Property } from '../domain/property.entity';

@Injectable()
export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(public prisma: PrismaService) {}

  async findAllByOrganizationId(organizationId: string): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: { organizationId },
      include: {
        meters: true,
        photos: {
          orderBy: { order: 'asc' },
        },
        tenants: {
          where: { isActive: true },
          include: { tenant: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return properties.map(p => this.mapToEntity(p));
  }

  async findById(id: string): Promise<Property | null> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        meters: true,
        photos: {
          orderBy: { order: 'asc' },
        },
        tenants: {
          where: { isActive: true },
          include: { tenant: true },
          take: 1,
        },
      },
    });
    if (!property) return null;
    return this.mapToEntity(property);
  }

  async findActiveTenancyByPropertyId(propertyId: string): Promise<any | null> {
    const tenancy = await this.prisma.propertyTenant.findFirst({
      where: {
        propertyId,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });
    return tenancy;
  }

  async create(data: any): Promise<Property> {
    const property = await this.prisma.property.create({
      data,
    });
    return this.mapToEntity(property);
  }

  async update(id: string, data: any): Promise<Property> {
    const property = await this.prisma.property.update({
      where: { id },
      data,
    });
    return this.mapToEntity(property);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({
      where: { id },
    });
  }

  async assignTenant(propertyId: string, data: any): Promise<any> {
    // First, deactivate any previous active tenancy for this property (if any)
    await this.prisma.propertyTenant.updateMany({
      where: { propertyId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    // Create the new tenancy
    return this.prisma.propertyTenant.create({
      data: {
        propertyId,
        tenantId: data.tenantId,
        startDate: new Date(data.startDate),
        monthlyRent: data.monthlyRent,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });
  }

  async addPhoto(propertyId: string, data: { url: string; publicId: string }): Promise<any> {
    const maxOrderPhoto = await this.prisma.propertyPhoto.findFirst({
      where: { propertyId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = maxOrderPhoto ? maxOrderPhoto.order + 1 : 0;

    return this.prisma.propertyPhoto.create({
      data: {
        propertyId,
        url: data.url,
        publicId: data.publicId,
        order: nextOrder,
      },
    });
  }

  async deletePhoto(photoId: string): Promise<any> {
    // Return the deleted photo so we can access its publicId if needed
    return this.prisma.propertyPhoto.delete({
      where: { id: photoId },
    });
  }

  async getPhoto(photoId: string): Promise<any> {
    return this.prisma.propertyPhoto.findUnique({
      where: { id: photoId },
    });
  }

  async updatePhotosOrder(propertyId: string, photoOrders: Array<{ id: string, order: number }>): Promise<void> {
    await this.prisma.$transaction(
      photoOrders.map(po => 
        this.prisma.propertyPhoto.updateMany({
          where: { id: po.id, propertyId },
          data: { order: po.order },
        })
      )
    );
  }

  private mapToEntity(p: any): Property {
    return new Property(
      p.id,
      p.userId,
      p.organizationId,
      p.category,
      p.customCategory,
      p.address,
      p.paymentDueDay,
      p.contractEndDate,
      p.rol,
      p.notes,
      p.expectedRent,
      p.createdAt,
      p.updatedAt,
      p.meters ? p.meters.map((m: any) => ({
        id: m.id,
        label: m.label,
        number: m.number,
        createdAt: m.createdAt,
      })) : [],
      p.tenants && p.tenants.length > 0 ? p.tenants[0] : null,
      p.photos ? p.photos.map((ph: any) => ({
        id: ph.id,
        url: ph.url,
        publicId: ph.publicId,
        order: ph.order,
        uploadedAt: ph.uploadedAt,
      })) : [],
    );
  }
}
