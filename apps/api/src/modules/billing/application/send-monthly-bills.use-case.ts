import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { ResendEmailService } from '../../../shared/infrastructure/email/resend-email.service';
import { ORGANIZATION_REPOSITORY, IOrganizationRepository } from '../../organization/domain/organization.repository.port';

@Injectable()
export class SendMonthlyBillsUseCase {
  private readonly logger = new Logger(SendMonthlyBillsUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: ResendEmailService,
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepo: IOrganizationRepository,
  ) {}

  async execute(organizationId: string) {
    // 1. Obtener la organización y sus datos bancarios
    const organization = await this.organizationRepo.findById(organizationId);
    if (!organization) throw new BadRequestException('Organización no encontrada');

    if (!organization.bankName || !organization.bankAccountNumber) {
      throw new BadRequestException('Debes configurar los datos bancarios de la organización primero.');
    }

    // 2. Obtener todos los inquilinos activos con sus propiedades
    const tenancies = await this.prisma.propertyTenant.findMany({
      where: {
        property: { organizationId },
        isActive: true,
      },
      include: {
        tenant: true,
        property: true,
      },
    });

    if (tenancies.length === 0) {
      return { sent: 0, message: 'No hay inquilinos activos para cobrar.' };
    }

    const results = {
      total: tenancies.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    const currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date());

    // 3. Enviar correos
    for (const tenancy of tenancies) {
      if (!tenancy.tenant.email) {
        results.failed++;
        results.errors.push(`Inquilino ${tenancy.tenant.name} no tiene email configurado.`);
        continue;
      }

      try {
        const html = this.generateEmailTemplate({
          organization,
          tenancy,
          month: currentMonth,
        });

        await this.emailService.send({
          to: tenancy.tenant.email,
          subject: `Cobro de Arriendo - ${currentMonth} - ${tenancy.property.address}`,
          html,
        });

        results.sent++;
      } catch (error) {
        this.logger.error(`Error enviando a ${tenancy.tenant.email}: ${error.message}`);
        results.failed++;
        results.errors.push(`Error enviando a ${tenancy.tenant.email}: ${error.message}`);
      }
    }

    return results;
  }

  private generateEmailTemplate(data: { organization: any, tenancy: any, month: string }) {
    const { organization, tenancy, month } = data;
    const amount = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(tenancy.monthlyRent));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .card { background: #f9fafb; border-radius: 12px; padding: 25px; border: 1px solid #e5e7eb; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .amount-label { color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 5px; }
          .amount-value { font-size: 32px; font-weight: 800; color: #111827; }
          .bank-info { background: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #d1d5db; margin-top: 15px; }
          .bank-info h3 { margin-top: 0; font-size: 16px; color: #374151; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
          .bank-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
          .bank-row span:first-child { color: #6b7280; }
          .bank-row span:last-child { font-weight: 600; color: #1f2937; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
          .property-address { font-weight: 500; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="color: #6366f1;">Aviso de Cobranza</h2>
          <p>Mes de ${month}</p>
        </div>

        <div class="card">
          <div class="amount-label">Monto de Arriendo</div>
          <div class="amount-value">${amount}</div>
          
          <p style="margin-top: 20px; font-size: 15px;">Estimado/a <strong>${tenancy.tenant.name}</strong>,</p>
          <p style="font-size: 15px;">Le recordamos que se encuentra disponible el cobro del arriendo correspondiente al mes de ${month}.</p>
          
          <div class="bank-info">
            <h3>Datos para Transferencia</h3>
            <div class="bank-row"><span>Banco:</span> <span>${organization.bankName}</span></div>
            <div class="bank-row"><span>Tipo Cuenta:</span> <span>${organization.bankAccountType}</span></div>
            <div class="bank-row"><span>N° Cuenta:</span> <span>${organization.bankAccountNumber}</span></div>
            <div class="bank-row"><span>RUT:</span> <span>${organization.bankAccountRut}</span></div>
            ${organization.bankAccountEmail ? `<div class="bank-row"><span>Email Comprobante:</span> <span>${organization.bankAccountEmail}</span></div>` : ''}
          </div>
        </div>

        <div class="footer">
          Propiedad: <span class="property-address">${tenancy.property.address}</span><br>
          Este es un correo automático generado por el sistema de gestión de propiedades de <strong>${organization.name}</strong>.
        </div>
      </body>
      </html>
    `;
  }
}
