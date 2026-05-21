import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EnsureSchemaService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EnsureSchemaService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.dataSource.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;

        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_reset_token TEXT NULL;

        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ NULL;
      `);

      await this.dataSource.query(`
        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS reminder_email_sent_at TIMESTAMPTZ NULL;

        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS project VARCHAR(80) NULL;

        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;

        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]'::jsonb;

        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS recurrence VARCHAR(16) NOT NULL DEFAULT 'none';
      `);

      this.logger.log('Columnas de users/tasks verificadas.');
    } catch (error) {
      this.logger.warn(
        'No se pudieron verificar columnas (revisa DATABASE_URL):',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
