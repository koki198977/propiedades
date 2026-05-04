import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  console.log('Sending test email using configuration from .env...');
  console.log('From:', process.env.SMTP_FROM);
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || 'onboarding@resend.dev',
      to: 'cursofelizapp@gmail.com',
      subject: 'Test Email - Yagnam Propiedades',
      html: '<h1>Configuración Exitosa</h1><p>Si recibes esto, Resend está funcionando correctamente con tu dominio.</p>'
    });
    console.log('Data:', data);
    console.log('Error:', error);
  } catch (err) {
    console.error('Exception:', err);
  }
}

test();
