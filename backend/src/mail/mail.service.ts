import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST ?? 'mailhog',
    port: parseInt(process.env.MAIL_PORT ?? '1025'),
    auth: process.env.MAIL_USER
      ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
      : undefined,
  });

  async sendVerification(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'noreply@nutritrack.local',
      to: email,
      subject: 'Verifica tu cuenta — NutriTrack',
      html: `
        <h2>Bienvenido a NutriTrack</h2>
        <p>Haz clic en el enlace para verificar tu cuenta:</p>
        <a href="${url}" style="background:#1A56B0;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Verificar cuenta
        </a>
        <p>El enlace caduca en 24 horas.</p>
      `,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'noreply@nutritrack.local',
      to: email,
      subject: 'Recuperar contraseña — NutriTrack',
      html: `
        <h2>Recuperar contraseña</h2>
        <p>Haz clic en el enlace para restablecer tu contraseña:</p>
        <a href="${url}" style="background:#1A56B0;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Restablecer contraseña
        </a>
        <p>El enlace caduca en 1 hora.</p>
      `,
    });
  }
}
