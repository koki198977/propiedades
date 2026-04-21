import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class ResendEmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly fromDefault: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromDefault = this.configService.get<string>(
      'SMTP_FROM',
      'Sistema Propiedades <onboarding@resend.dev>',
    );
  }

  async send(options: SendEmailOptions) {
    try {
      const redirectTo = this.configService.get<string>('EMAIL_REDIRECT_TO');
      let finalTo = options.to;
      let finalSubject = options.subject;

      if (redirectTo) {
        this.logger.warn(`MODO PRUEBA: Redirigiendo email originalmente para ${options.to} hacia ${redirectTo}`);
        finalTo = redirectTo;
        finalSubject = `[TEST para ${options.to}] ${options.subject}`;
      }

      this.logger.log(`Enviando email a ${finalTo}: ${finalSubject}`);
      
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.fromDefault,
        to: finalTo,
        subject: finalSubject,
        html: options.html,
      });

      if (error) {
        this.logger.error(`Error de Resend: ${JSON.stringify(error)}`);
        throw error;
      }

      this.logger.log(`Email enviado con éxito. ID: ${data?.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Fallo al enviar email: ${error.message}`);
      throw error;
    }
  }
}
