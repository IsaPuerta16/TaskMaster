import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail/mail.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarNotesModule } from './modules/calendar-notes/calendar-notes.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MailModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
          throw new Error('DATABASE_URL no está configurada. Agrega la conexión de Supabase en el archivo .env.');
        }

        const shouldUseSsl =
          (configService.get<string>('DB_SSL') ?? 'true').toLowerCase() === 'true';

        return {
          type: 'postgres' as const,
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize:
            (configService.get<string>('DB_SYNC') ?? 'true').toLowerCase() === 'true',
          ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AssistantModule,
    AuthModule,
    CalendarNotesModule,
    SettingsModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
  ],
})
export class AppModule {}
