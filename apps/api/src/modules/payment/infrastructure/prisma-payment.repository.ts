import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { IPaymentRepository } from '../domain/payment.repository.port';
import { Payment } from '../domain/payment.entity';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOrganizationId(organizationId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        propertyTenant: {
          property: {
            organizationId,
          },
        },
      },
      include: {
        propertyTenant: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(p => this.mapToEntity(p));
  }

  async findAllByTenantId(propertyTenantId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { propertyTenantId },
      include: {
        propertyTenant: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(p => this.mapToEntity(p));
  }

  async findAllByPropertyId(propertyId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        propertyTenant: {
          propertyId,
        },
      },
      include: {
        propertyTenant: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(p => this.mapToEntity(p));
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });
    if (!payment) return null;
    return this.mapToEntity(payment);
  }

  async create(data: any): Promise<Payment> {
    const payment = await this.prisma.payment.create({
      data: {
        propertyTenantId: data.propertyTenantId,
        recordedById: data.recordedById,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
      },
    });
    return this.mapToEntity(payment);
  }

  async update(id: string, data: any): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id },
      data,
    });
    return this.mapToEntity(payment);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }

  private mapToEntity(p: any): Payment {
    return new Payment(
      p.id,
      p.propertyTenantId,
      p.recordedById,
      Number(p.amount),
      p.paymentDate,
      p.paymentMethod,
      p.receiptUrl,
      p.notes,
      p.createdAt,
      p.propertyTenant ? {
        id: p.propertyTenant.id,
        monthlyRent: Number(p.propertyTenant.monthlyRent),
        property: {
          id: p.propertyTenant.property.id,
          address: p.propertyTenant.property.address,
        },
        tenant: {
          id: p.propertyTenant.tenant.id,
          name: p.propertyTenant.tenant.name,
        },
      } : undefined
    );
  }
}
