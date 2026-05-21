import { Body, Controller, NotFoundException, Post, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../services/mail.service';

@Controller('mail')
export class MailTestController {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  @Post('test')
  async sendTestEmail(@Body('to') to: string) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv === 'production') {
      throw new NotFoundException();
    }

    await this.mailService.sendMail(
      to,
      'Prueba SMTP - TaskMaster',
      `
        <h1>Correo de prueba</h1>
        <p>SMTP de Gmail está funcionando correctamente en TaskMaster.</p>
      `,
      'Correo de prueba. SMTP de Gmail está funcionando correctamente en TaskMaster.',
    );

    return {
      message: 'Correo enviado correctamente',
    };
  }
}