import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { ITenantRepository } from '../domain/tenant.repository.port';
import { Tenant } from '../domain/tenant.entity';

@Injectable()
export class PrismaTenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOrganizationId(organizationId: string): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      where: { 
        organizationId,
        isActive: true 
      },
      orderBy: { name: 'asc' },
    });
    return tenants.map(t => this.mapToEntity(t));
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
    );
  }
}
