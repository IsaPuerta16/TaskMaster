import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService, type NotifPrefs } from '@core/services/notification.service';
import {
  AppSettingsService,
  type AppSettings,
  type ThemeChoice,
} from '@core/services/app-settings.service';
import type { ProductividadRange } from '@core/productividad-settings';
import { AppSidebarComponent } from '@shared/layout';

@Component({
  selector: 'app-user-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppSidebarComponent],
  templateUrl: './user-configuracion.component.html',
  styleUrl: './user-configuracion.component.scss',
})
export class UserConfiguracionComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly notif = inject(NotificationService);
  readonly appSettings = inject(AppSettingsService);

  avatarUrl = '';
  userHandle = '@Usuario';

  readonly settings = this.appSettings.settings;
  readonly prodRange = this.appSettings.productividadRange;
  readonly prodPrefs = this.appSettings.productividadPrefs;

  /** Textos de la pantalla según idioma (General) */
  readonly L = computed(() => {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    if (en) {
      return {
        subtitle: 'Manage your account',
        newTask: '+ New task',
        apariencia: 'Appearance',
        tema: 'Theme',
        claro: 'Light',
        oscuro: 'Dark',
        sistema: 'System',
        fontSize: 'Font size',
        general: 'General',
        idioma: 'Language',
        dateFormat: 'Date format',
        timeFormat: 'Time format',
        timezone: 'Time zone',
        notificaciones: 'Notifications',
        n1: 'Due date reminders',
        n1h: '1 day and 3 hours before',
        n2: 'Daily summary',
        n2h: 'Pending tasks each morning',
        n3: 'Weekly summary',
        n3h: 'Productivity every Monday',
        n4: 'Sounds',
        n4h: 'When new notifications arrive',
        n5: 'Desktop notifications',
        n5h: 'System alerts for due dates',
        notifFooter: 'Go to notification center',
        productividad: 'Productivity',
        prodRange: 'Default period in reports',
        insights: 'Show quick insights',
        insightsHint: 'Tips on the productivity view',
        prodFooter: 'View full productivity dashboard',
      };
    }
    return {
      subtitle: 'Gestiona tu cuenta',
      newTask: '+ Nueva Tarea',
      apariencia: 'Apariencia',
      tema: 'Tema',
      claro: 'Claro',
      oscuro: 'Oscuro',
      sistema: 'Sistema',
      fontSize: 'Tamaño de fuente',
      general: 'General',
      idioma: 'Idioma',
      dateFormat: 'Formato de fecha',
      timeFormat: 'Formato de hora',
      timezone: 'Zona horaria',
      notificaciones: 'Notificaciones',
      n1: 'Recordatorios de vencimiento',
      n1h: '1 día y 3 horas antes',
      n2: 'Resumen diario',
      n2h: 'Tareas pendientes cada mañana',
      n3: 'Resumen semanal',
      n3h: 'Productividad cada lunes',
      n4: 'Sonidos',
      n4h: 'Al recibir notificaciones nuevas',
      n5: 'Notificaciones en el escritorio',
      n5h: 'Avisos del sistema para vencimientos',
      notifFooter: 'Ir al centro de notificaciones',
      productividad: 'Productividad',
      prodRange: 'Periodo por defecto en informes',
      insights: 'Mostrar insights rápidos',
      insightsHint: 'Consejos en la vista de productividad',
      prodFooter: 'Ver panel completo de productividad',
    };
  });

  readonly idiomaOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  readonly dateFormatOptions = computed(() => {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    return [
      { value: 'ddmmyyyy', label: en ? 'DD/MM/YYYY' : 'DD/MM/AAAA' },
      { value: 'mmddyyyy', label: en ? 'MM/DD/YYYY' : 'MM/DD/AAAA' },
      { value: 'yyyymmdd', label: en ? 'YYYY-MM-DD' : 'AAAA-MM-DD' },
    ];
  });

  readonly timeFormatOptions = computed(() => {
    const en = this.appSettings.isEnglish();
    return [
      { value: '24', label: en ? '24-hour' : '24 horas' },
      { value: '12', label: en ? '12-hour (AM/PM)' : '12 horas (AM/PM)' },
    ];
  });

  readonly timezoneOptions = computed(() => {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    return [
      {
        value: 'america_bogota',
        label: en ? 'America/Bogota (GMT-5)' : 'América/Bogotá (GMT-5)',
      },
      {
        value: 'america_mexico',
        label: en ? 'America/Mexico City (GMT-6)' : 'América/Ciudad de México (GMT-6)',
      },
      {
        value: 'europe_madrid',
        label: en ? 'Europe/Madrid (GMT+1)' : 'Europa/Madrid (GMT+1)',
      },
    ];
  });

  readonly fontSizeOptions = computed(() => {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    return [
      { value: 'pequeno', label: en ? 'Small' : 'Pequeño' },
      { value: 'mediano', label: en ? 'Medium' : 'Mediano' },
      { value: 'grande', label: en ? 'Large' : 'Grande' },
    ];
  });

  readonly productividadRangoOptions = computed(() => {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    return [
      { value: '7' as ProductividadRange, label: en ? 'Last 7 days' : 'Últimos 7 días' },
      { value: '30' as ProductividadRange, label: en ? 'Last 30 days' : 'Últimos 30 días' },
    ];
  });

  ngOnInit(): void {
    const u = this.auth.user();
    const email = u?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u?.id ?? email)}`;
  }

  setTheme(theme: ThemeChoice): void {
    this.appSettings.setTheme(theme);
  }

  /** Los <select> emiten string; se valida en el servicio al persistir */
  onPatch(key: keyof AppSettings, value: string): void {
    this.appSettings.patch(key, value as AppSettings[typeof key]);
  }

  toggleNotifPref(key: keyof NotifPrefs): void {
    this.notif.togglePref(key);
  }

  setProductividadRange(value: string): void {
    if (value === '7' || value === '30') {
      this.appSettings.setProductividadRange(value);
    }
  }

  toggleProductividadInsights(): void {
    this.appSettings.toggleProductividadInsights();
  }

  /** Ayuda a diagnosticar por qué no hay avisos del sistema (contexto seguro, permiso, etc.). */
  escritorioEnvHint(): string | null {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return this.appSettings.isEnglish()
        ? 'This browser does not support notifications.'
        : 'Este navegador no admite notificaciones.';
    }
    if (!window.isSecureContext) {
      return this.appSettings.isEnglish()
        ? 'Use https:// or http://localhost. Desktop notifications do not work on plain HTTP with an IP address.'
        : 'Usa https:// o http://localhost: en HTTP con una IP del equipo las notificaciones del sistema no están disponibles.';
    }
    if (Notification.permission === 'denied') {
      return this.appSettings.isEnglish()
        ? 'Notifications are blocked for this site. Allow them from the lock icon in the address bar.'
        : 'Notificaciones bloqueadas para este sitio. Actívalas desde el icono junto a la barra de direcciones.';
    }
    return null;
  }
}
