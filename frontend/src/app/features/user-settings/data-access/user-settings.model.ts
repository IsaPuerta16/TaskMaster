import type { ProductividadRange } from '@core/productividad-settings';

export type ThemeChoice = 'claro' | 'oscuro' | 'sistema';

export interface AppSettings {
  theme: ThemeChoice;
  fontSize: string;
  idioma: 'es' | 'en';
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export interface ProductivitySettings {
  range: ProductividadRange;
  showInsights: boolean;
}

export interface NotifPrefs {
  recordatorios: boolean;
  resumenDiario: boolean;
  resumenSemanal: boolean;
  sonidos: boolean;
  escritorio: boolean;
}

export interface NotificationSettings extends NotifPrefs {
  readIds: string[];
  desktopUserOff: boolean;
}

export interface UserSettingsResponse {
  appSettings: AppSettings;
  productivity: ProductivitySettings;
  notifications: NotificationSettings;
}

export interface UpdateUserSettingsDto {
  appSettings?: Partial<AppSettings>;
  productivity?: Partial<ProductivitySettings>;
  notifications?: Partial<NotificationSettings>;
}
