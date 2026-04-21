import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { NotificationRepository } from '../infrastructure/notification.repository';
import { NotificationType } from '@propiedades/types';

@Injectable()
export class CheckExpirationsCron {
  private readonly logger = new Logger(CheckExpirationsCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationRepo: NotificationRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running daily notification checks...');
    await this.checkContractExpirations();
    await this.checkPaymentDueDays();
  }

  private async checkContractExpirations() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await this.prisma.property.findMany({
      where: {
        contractEndDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    });

    for (const property of expiringSoon) {
      await this.notificationRepo.create({
        userId: property.userId,
        type: NotificationType.EXPIRATION,
        title: 'Contrato Próximo a Vencer',
        message: `El contrato de la propiedad en ${property.address} vence el ${property.contractEndDate?.toLocaleDateString()}.`,
      });
    }
    
    if (expiringSoon.length > 0) {
      this.logger.log(`Generated ${expiringSoon.length} expiration notifications.`);
    }
  }

  private async checkPaymentDueDays() {
    const today = new Date();
    const currentDay = today.getDate();

    const propertiesDueToday = await this.prisma.property.findMany({
      where: {
        paymentDueDay: currentDay,
      },
    });

    for (const property of propertiesDueToday) {
      await this.notificationRepo.create({
        userId: property.userId,
        type: NotificationType.PAYMENT_DUE,
        title: 'Día de Pago en Propiedad',
        message: `Hoy es el día de pago acordado para la propiedad en ${property.address}.`,
      });
    }

    if (propertiesDueToday.length > 0) {
      this.logger.log(`Generated ${propertiesDueToday.length} payment due notifications.`);
    }
  }
}
