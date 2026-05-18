import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { MailTestController } from './controllers/mail-test.controller';

@Module({
  controllers: [MailTestController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}