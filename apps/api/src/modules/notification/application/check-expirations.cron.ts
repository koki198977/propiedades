import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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

  @Cron('15 14 * * *') // PRUEBA: 10:15 hora Chile (UTC-4) = 14:15 UTC — cambiar a '0 13 * * *' después
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
          html: this.wrapHtml('Aviso de Vencimiento', message, property.address),
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
          html: this.wrapHtml('Cobro de Arriendo', message, property.address),
        });
      }
    }

    if (propertiesDueToday.length > 0) {
      this.logger.log(`Generated ${propertiesDueToday.length} payment due notifications.`);
    }
  }

  private async checkExpenseReminders() {
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    // Incluir desde ayer para no perder recordatorios si el cron corre tarde
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const reminders = await this.prisma.expenseReminder.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: fiveDaysFromNow,
          gte: yesterday,
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
          html: this.wrapHtml('Recordatorio de Pago', message, reminder.property.address),
        });
      }
    }
  }

  private async checkSecurityDepositDeadlines() {
    // Alert at 40 days after contract end (5 days before the 45-day legal limit)
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    const pendingDeposits = await this.prisma.propertyTenant.findMany({
      where: {
        isActive: false,
        isSecurityDepositReturned: false,
        endDate: {
          lte: fortyDaysAgo,
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
      const daysSinceEnd = Math.floor((new Date().getTime() - new Date(tenancy.endDate!).getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = 45 - daysSinceEnd;
      
      let message = '';
      let title = '';

      if (daysRemaining > 0) {
        title = 'Plazo Garantía Próximo a Vencer';
        message = `Atención: Han pasado ${daysSinceEnd} días desde el término del contrato de ${tenancy.tenant.name} en ${tenancy.property.address}. Le quedan ${daysRemaining} días para cumplir el plazo legal de devolución de garantía.`;
      } else {
        title = 'Plazo Devolución Garantía VENCIDO';
        message = `Atención: El plazo legal de 45 días para la devolución de la garantía de ${tenancy.tenant.name} en ${tenancy.property.address} ha EXSPIRADO.`;
      }
      
      await this.notificationRepo.create({
        userId: tenancy.property.userId,
        type: NotificationType.SYSTEM,
        title,
        message,
      });

      if (tenancy.property.user.email) {
        await this.emailService.send({
          to: tenancy.property.user.email,
          subject: `⚠️ ${title}: ${tenancy.tenant.name}`,
          html: this.wrapHtml(title, message, tenancy.property.address),
        });
      }
    }
  }

  private wrapHtml(title: string, message: string, address: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .card { background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .title { color: #4f46e5; font-size: 20px; font-weight: 700; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .message { font-size: 16px; color: #374151; margin-bottom: 25px; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
          .property { font-weight: 600; color: #111827; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="color: #4f46e5; margin: 0;">Yagnam Propiedades</h2>
        </div>
        <div class="card">
          <div class="title">${title}</div>
          <div class="message">${message}</div>
          <div style="font-size: 14px; color: #6b7280;">
            Propiedad: <span class="property">${address}</span>
          </div>
        </div>
        <div class="footer">
          Este es un correo automático generado por tu sistema de gestión de propiedades.
        </div>
      </body>
      </html>
    `;
  }
}
