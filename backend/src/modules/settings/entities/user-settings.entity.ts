import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface StoredAppSettings {
  theme: 'claro' | 'oscuro' | 'sistema';
  fontSize: string;
  idioma: 'es' | 'en';
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export interface StoredProductivitySettings {
  range: '7' | '30';
  showInsights: boolean;
}

export interface StoredNotificationSettings {
  recordatorios: boolean;
  resumenDiario: boolean;
  resumenSemanal: boolean;
  sonidos: boolean;
  escritorio: boolean;
  readIds: string[];
  desktopUserOff: boolean;
}

export const DEFAULT_APP_SETTINGS: StoredAppSettings = {
  theme: 'claro',
  fontSize: 'mediano',
  idioma: 'es',
  dateFormat: 'ddmmyyyy',
  timeFormat: '24',
  timezone: 'america_bogota',
};

export const DEFAULT_PRODUCTIVITY_SETTINGS: StoredProductivitySettings = {
  range: '7',
  showInsights: true,
};

export const DEFAULT_NOTIFICATION_SETTINGS: StoredNotificationSettings = {
  recordatorios: true,
  resumenDiario: true,
  resumenSemanal: true,
  sonidos: true,
  escritorio: false,
  readIds: [],
  desktopUserOff: false,
};

@Entity('user_settings')
export class UserSettings {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'app_settings', type: 'jsonb', default: () => "'{}'" })
  appSettings: StoredAppSettings;

  @Column({ name: 'productivity_settings', type: 'jsonb', default: () => "'{}'" })
  productivity: StoredProductivitySettings;

  @Column({ name: 'notification_settings', type: 'jsonb', default: () => "'{}'" })
  notifications: StoredNotificationSettings;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
