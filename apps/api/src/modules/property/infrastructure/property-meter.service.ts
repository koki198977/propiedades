import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';

@Injectable()
export class PropertyMeterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByPropertyId(propertyId: string) {
    return this.prisma.propertyMeter.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(propertyId: string, data: { label: string; number: string }) {
    return this.prisma.propertyMeter.create({
      data: { propertyId, label: data.label, number: data.number },
    });
  }

  async delete(id: string) {
    await this.prisma.propertyMeter.delete({ where: { id } });
  }
}
