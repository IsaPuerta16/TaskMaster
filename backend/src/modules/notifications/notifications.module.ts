import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserSettings } from '../settings/entities/user-settings.entity';
import { Task } from '../tasks/entities/task.entity';
import { SettingsModule } from '../settings/settings.module';
import { NotificationDigestService } from './notification-digest.service';

@Module({
  imports: [
    ScheduleModule,
    SettingsModule,
    TypeOrmModule.forFeature([UserSettings, Task]),
  ],
  providers: [NotificationDigestService],
})
export class NotificationsModule {}
