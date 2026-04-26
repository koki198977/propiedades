import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { ITenantRepository } from '../domain/tenant.repository.port';
import { Tenant } from '../domain/tenant.entity';
import { PaginationQuery, PaginatedResponse } from '@propiedades/types';

@Injectable()
export class PrismaTenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOrganizationId(organizationId: string, query?: PaginationQuery): Promise<PaginatedResponse<Tenant>> {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const search = query?.search;
    const where: any = { 
      organizationId,
      isActive: true 
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { documentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        include: {
          properties: {
            where: { isActive: true },
            include: { property: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.tenant.count({
        where,
      }),
    ]);

    return {
      data: tenants.map(t => this.mapToEntity(t)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) return null;
    return this.mapToEntity(tenant);
  }

  async findByDocumentIdAndOrg(documentId: string, organizationId: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { documentId, organizationId },
    });
    if (!tenant) return null;
    return this.mapToEntity(tenant);
  }

  async findByEmailAndOrg(email: string, organizationId: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { email, organizationId },
    });
    if (!tenant) return null;
    return this.mapToEntity(tenant);
  }

  async create(data: any): Promise<Tenant> {
    const tenant = await this.prisma.tenant.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        name: data.name || data.fullName,
        email: data.email,
        phone: data.phone,
        documentId: data.documentId || data.rut,
      },
    });
    return this.mapToEntity(tenant);
  }

  async update(id: string, data: any): Promise<Tenant> {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        documentId: data.documentId,
        isActive: data.isActive,
      },
    });
    return this.mapToEntity(tenant);
  }

  async delete(id: string): Promise<void> {
    // Soft delete para no romper integridad financiera
    await this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private mapToEntity(t: any): Tenant {
    const activeProperty = t.properties && t.properties.length > 0 
      ? { id: t.properties[0].property.id, address: t.properties[0].property.address } 
      : null;

    return new Tenant(
      t.id,
      t.userId,
      t.organizationId,
      t.name,
      t.email,
      t.phone,
      t.documentId,
      t.isActive,
      t.createdAt,
      t.updatedAt,
      activeProperty
    );
  }
}
