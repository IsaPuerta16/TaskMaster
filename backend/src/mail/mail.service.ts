import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      this.transporter = null;
      this.log.warn('SMTP_HOST no configurado: el envío por correo está desactivado.');
      return;
    }
    const port = Number(this.config.get<string>('SMTP_PORT') ?? '587');
    const secure =
      (this.config.get<string>('SMTP_SECURE') ?? '').toLowerCase() === 'true' ||
      port === 465;
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASS')?.trim();

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  isEnabled(): boolean {
    return this.transporter !== null;
  }

  private fromAddress(): string {
    return (
      this.config.get<string>('MAIL_FROM')?.trim() ||
      this.config.get<string>('SMTP_USER')?.trim() ||
      'TaskMaster <noreply@localhost>'
    );
  }

  async sendMail(params: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.sendMail({
        from: this.fromAddress(),
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      return true;
    } catch (e) {
      this.log.warn(`No se pudo enviar correo a ${params.to}: ${(e as Error).message}`);
      return false;
    }
  }
}
