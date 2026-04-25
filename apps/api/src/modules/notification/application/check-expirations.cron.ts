import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { NotificationRepository } from '../infrastructure/notification.repository';
import { NotificationType } from '@propiedades/types';
import { ResendEmailService } from '../../../shared/infrastructure/email/resend-email.service';

@Injectable()
export class CheckExpirationsCron {
  private readonly logger = new Logger(CheckExpirationsCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationRepo: NotificationRepository,
    private readonly emailService: ResendEmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running daily notification checks...');
    await this.checkContractExpirations();
    await this.checkPaymentDueDays();
    await this.checkExpenseReminders();
    await this.checkSecurityDepositDeadlines();
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
      include: { user: true }
    });

    for (const property of expiringSoon) {
      const message = `El contrato de la propiedad en ${property.address} vence el ${property.contractEndDate?.toLocaleDateString('es-CL')}.`;
      
      await this.notificationRepo.create({
        userId: property.userId,
        type: NotificationType.EXPIRATION,
        title: 'Contrato Próximo a Vencer',
        message,
      });

      if (property.user.email) {
        await this.emailService.send({
          to: property.user.email,
          subject: `📄 Vencimiento de Contrato: ${property.address}`,
          html: `<p>${message}</p>`,
        });
      }
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
      include: { user: true }
    });

    for (const property of propertiesDueToday) {
      const message = `Hoy es el día de pago acordado para la propiedad en ${property.address}.`;
      
      await this.notificationRepo.create({
        userId: property.userId,
        type: NotificationType.PAYMENT_DUE,
        title: 'Día de Pago en Propiedad',
        message,
      });

      if (property.user.email) {
        await this.emailService.send({
          to: property.user.email,
          subject: `💰 Cobro de Arriendo: ${property.address}`,
          html: `<p>${message}</p>`,
        });
      }
    }

    if (propertiesDueToday.length > 0) {
      this.logger.log(`Generated ${propertiesDueToday.length} payment due notifications.`);
    }
  }

  private async checkExpenseReminders() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const reminders = await this.prisma.expenseReminder.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: threeDaysFromNow,
          gte: new Date(),
        },
      },
      include: {
        property: {
          include: {
            user: true
          }
        }
      }
    });

    for (const reminder of reminders) {
      const message = `Recordatorio: El pago de "${reminder.title}" para la propiedad ${reminder.property.address} vence el ${reminder.nextDueDate.toLocaleDateString('es-CL')}.`;
      
      await this.notificationRepo.create({
        userId: reminder.property.userId,
        type: NotificationType.EXPENSE_DUE,
        title: 'Vencimiento de Servicio',
        message,
      });

      if (reminder.property.user.email) {
        await this.emailService.send({
          to: reminder.property.user.email,
          subject: `🔔 Aviso de Pago: ${reminder.title}`,
          html: `<p>${message}</p>`,
        });
      }
    }
  }

  private async checkSecurityDepositDeadlines() {
    // 45 days after contract end
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    const pendingDeposits = await this.prisma.propertyTenant.findMany({
      where: {
        isActive: false,
        isSecurityDepositReturned: false,
        endDate: {
          lte: fortyFiveDaysAgo,
        }
      },
      include: {
        property: {
          include: {
            user: true
          }
        },
        tenant: true
      }
    });

    for (const tenancy of pendingDeposits) {
      const message = `Atención: Han pasado 45 días desde el término del contrato de ${tenancy.tenant.name} en ${tenancy.property.address}. Debe realizar la devolución de la garantía.`;
      
      await this.notificationRepo.create({
        userId: tenancy.property.userId,
        type: NotificationType.SYSTEM,
        title: 'Plazo Devolución Garantía Cumplido',
        message,
      });

      if (tenancy.property.user.email) {
        await this.emailService.send({
          to: tenancy.property.user.email,
          subject: `⚠️ Plazo de Garantía: ${tenancy.tenant.name}`,
          html: `<p>${message}</p>`,
        });
      }
    }
  }
}
