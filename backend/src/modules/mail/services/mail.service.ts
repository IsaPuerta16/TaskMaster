import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST')?.trim();
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const secure =
      this.configService.get<string>('SMTP_SECURE')?.toLowerCase() === 'true';
    const user = this.configService.get<string>('SMTP_USER')?.trim();
    const pass = this.configService.get<string>('SMTP_PASS')?.trim();

    if (!host || !user || !pass) {
      this.transporter = null;
      this.logger.warn(
        'SMTP no configurado (SMTP_HOST, SMTP_USER, SMTP_PASS): el envío por correo está desactivado.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`Correo omitido (SMTP off): ${subject} → ${to}`);
      return;
    }

    const from =
      this.configService.get<string>('MAIL_FROM') ??
      this.configService.get<string>('SMTP_USER');

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
    } catch (error) {
      this.logger.error('Error enviando correo SMTP', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo electrónico',
      );
    }
  }

  async sendTaskReminderEmail(params: {
    to: string;
    userName: string;
    taskTitle: string;
    dueDate: Date;
    priority?: string;
  }): Promise<void> {
    const { to, userName, taskTitle, dueDate, priority } = params;

    const formattedDate = dueDate.toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    });

    const safeUserName = this.escapeHtml(userName);
    const safeTaskTitle = this.escapeHtml(taskTitle);
    const safePriority = this.escapeHtml(priority ?? 'Pendiente');

    const appUrl =
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:4200';

    const subject = 'Tu tarea está próxima a vencer - TaskMaster';

    const html = this.buildTaskReminderEmailHtml({
      userName: safeUserName,
      taskTitle: safeTaskTitle,
      dueDate: formattedDate,
      priority: safePriority,
      appUrl,
    });

    const text = `Hola, ${userName}. Te recordamos que la tarea "${taskTitle}" vence el ${formattedDate}. Ingresa a TaskMaster para revisar los detalles.`;

    await this.sendMail(to, subject, html, text);
  }

  async sendOverdueTaskEmail(params: {
    to: string;
    userName: string;
    taskTitle: string;
    dueDate: Date;
  }): Promise<void> {
    const { to, userName, taskTitle, dueDate } = params;
    const formattedDate = dueDate.toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    });
    const appUrl =
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:4200';
    const subject = 'Tarea vencida - TaskMaster';
    const safeUser = this.escapeHtml(userName);
    const safeTitle = this.escapeHtml(taskTitle);
    const html = `
      <p>Hola, ${safeUser}.</p>
      <p>La tarea <strong>${safeTitle}</strong> está vencida desde el ${this.escapeHtml(formattedDate)}.</p>
      <p><a href="${appUrl}/tasks?filter=vencidas">Ver tareas vencidas en TaskMaster</a></p>
    `;
    const text = `Hola, ${userName}. La tarea "${taskTitle}" está vencida (${formattedDate}).`;
    await this.sendMail(to, subject, html, text);
  }

  async sendPasswordResetEmail(params: {
    to: string;
    userName: string;
    token: string;
  }): Promise<void> {
    const appUrl =
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:4200';
    const link = `${appUrl}/reset-password?token=${encodeURIComponent(params.token)}`;
    const subject = 'Restablecer contraseña - TaskMaster';
    const safeUser = this.escapeHtml(params.userName);
    const html = `
      <p>Hola, ${safeUser}.</p>
      <p>Recibimos una solicitud para restablecer tu contraseña en TaskMaster.</p>
      <p><a href="${link}">Restablecer contraseña</a></p>
      <p>El enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
    `;
    const text = `Restablece tu contraseña en: ${link}`;
    await this.sendMail(params.to, subject, html, text);
  }

  private buildTaskReminderEmailHtml(params: {
    userName: string;
    taskTitle: string;
    dueDate: string;
    priority: string;
    appUrl: string;
  }): string {
    const { userName, taskTitle, dueDate, priority, appUrl } = params;

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Recordatorio de tarea</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background-color: #050b18;
          font-family: Arial, Helvetica, sans-serif;
          color: #ffffff;
        ">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="
            background: linear-gradient(135deg, #050b18 0%, #0b1224 45%, #0f1f3d 100%);
            padding: 40px 16px;
          ">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="
                  max-width: 720px;
                  background: #0b1224;
                  border: 1px solid #23314f;
                  border-radius: 22px;
                  overflow: hidden;
                  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
                ">
                  <tr>
                    <td style="
                      padding: 26px 32px;
                      background: linear-gradient(135deg, #111a2e 0%, #0b1224 100%);
                      border-bottom: 1px solid #23314f;
                    ">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="left">
                            <table cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="
                                  width: 46px;
                                  height: 46px;
                                  background: #1d293d;
                                  border: 1px solid #334568;
                                  border-radius: 14px;
                                  text-align: center;
                                  vertical-align: middle;
                                  font-size: 20px;
                                  font-weight: 700;
                                  color: #ffffff;
                                ">
                                  TM
                                </td>

                                <td style="padding-left: 14px;">
                                  <div style="
                                    font-size: 22px;
                                    font-weight: 800;
                                    color: #ffffff;
                                    letter-spacing: -0.3px;
                                  ">
                                    Task<span style="color: #60a5fa;">Master</span>
                                  </div>

                                  <div style="
                                    margin-top: 4px;
                                    font-size: 13px;
                                    color: #93a4bd;
                                  ">
                                    Organiza. Prioriza. Cumple.
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>

                          <td align="right" style="
                            font-size: 13px;
                            color: #60a5fa;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1.2px;
                          ">
                            Recordatorio
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 38px 32px 16px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td>
                            <div style="
                              font-size: 13px;
                              color: #60a5fa;
                              font-weight: 800;
                              text-transform: uppercase;
                              letter-spacing: 1.4px;
                              margin-bottom: 12px;
                            ">
                              Recordatorio de tarea
                            </div>

                            <h1 style="
                              margin: 0;
                              font-size: 34px;
                              line-height: 1.16;
                              color: #ffffff;
                              letter-spacing: -0.9px;
                            ">
                              Tu tarea está
                              <span style="color: #60a5fa;">próxima a vencer</span>
                            </h1>

                            <p style="
                              margin: 20px 0 0 0;
                              font-size: 17px;
                              line-height: 1.6;
                              color: #cbd5e1;
                            ">
                              Hola, <strong style="color: #ffffff;">${userName}</strong>.
                              Te recordamos que tienes una tarea próxima a vencer.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 18px 32px 8px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="
                        background: linear-gradient(135deg, #182235 0%, #111827 100%);
                        border: 1px solid #30415f;
                        border-radius: 18px;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
                      ">
                        <tr>
                          <td style="padding: 26px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td width="58" valign="top">
                                  <div style="
                                    width: 52px;
                                    height: 52px;
                                    border-radius: 14px;
                                    background: #1e293b;
                                    border: 1px solid #3b82f6;
                                    text-align: center;
                                    line-height: 52px;
                                    font-size: 24px;
                                  ">
                                    📄
                                  </div>
                                </td>

                                <td style="padding-left: 16px;">
                                  <div style="
                                    font-size: 22px;
                                    font-weight: 800;
                                    color: #ffffff;
                                    margin-bottom: 8px;
                                  ">
                                    ${taskTitle}
                                  </div>

                                  <span style="
                                    display: inline-block;
                                    padding: 6px 12px;
                                    border-radius: 999px;
                                    background: rgba(234, 179, 8, 0.16);
                                    color: #fde047;
                                    font-size: 12px;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    letter-spacing: 0.6px;
                                  ">
                                    ${priority}
                                  </span>
                                </td>
                              </tr>
                            </table>

                            <div style="
                              height: 1px;
                              background: #2f405e;
                              margin: 24px 0;
                            "></div>

                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td width="38" valign="top">
                                  <div style="
                                    width: 34px;
                                    height: 34px;
                                    border-radius: 999px;
                                    background: rgba(59, 130, 246, 0.14);
                                    color: #60a5fa;
                                    text-align: center;
                                    line-height: 34px;
                                    font-size: 17px;
                                  ">
                                    ⏰
                                  </div>
                                </td>

                                <td style="padding-left: 12px;">
                                  <div style="
                                    color: #93a4bd;
                                    font-size: 14px;
                                    font-weight: 700;
                                    margin-bottom: 4px;
                                  ">
                                    Fecha límite
                                  </div>

                                  <div style="
                                    color: #ffffff;
                                    font-size: 19px;
                                    font-weight: 800;
                                  ">
                                    ${dueDate}
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 28px 32px 34px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="left">
                            <a href="${appUrl}" target="_blank" style="
                              display: inline-block;
                              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                              color: #ffffff;
                              text-decoration: none;
                              font-size: 16px;
                              font-weight: 800;
                              padding: 15px 24px;
                              border-radius: 12px;
                              box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
                            ">
                              Ir a TaskMaster →
                            </a>
                          </td>

                          <td align="left" style="
                            padding-left: 22px;
                            color: #93a4bd;
                            font-size: 15px;
                            line-height: 1.5;
                          ">
                            Ingresa a TaskMaster para revisar los detalles
                            <br />
                            y gestionar tu tarea.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="
                      padding: 24px 32px;
                      background: #08111f;
                      border-top: 1px solid #23314f;
                    ">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="
                            color: #93a4bd;
                            font-size: 14px;
                            line-height: 1.5;
                          ">
                            <strong style="color: #cbd5e1;">TaskMaster</strong>
                            te ayuda a mantener el control de tus tareas.
                          </td>

                          <td align="right">
                            <div style="
                              display: inline-block;
                              width: 42px;
                              height: 42px;
                              border-radius: 12px;
                              border: 1px solid #30415f;
                              text-align: center;
                              line-height: 42px;
                              color: #93a4bd;
                              font-weight: 800;
                            ">
                              TM
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <div style="
                  max-width: 720px;
                  margin-top: 18px;
                  color: #64748b;
                  font-size: 12px;
                  line-height: 1.5;
                  text-align: center;
                ">
                  Este correo fue enviado automáticamente por TaskMaster.
                  No respondas a este mensaje.
                </div>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}