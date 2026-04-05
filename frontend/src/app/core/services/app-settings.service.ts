import { computed, Injectable, signal } from '@angular/core';
import { UI_EN, UI_ES, type UiStrings } from '../ui-strings';
import {
  DEFAULT_PRODUCTIVIDAD_PREFS,
  PRODUCTIVIDAD_PREFS_KEY,
  PRODUCTIVIDAD_RANGE_KEY,
  type ProductividadPrefs,
  type ProductividadRange,
} from '@core/productividad-settings';

export const APP_SETTINGS_KEY = 'taskmaster_app_settings';

export type ThemeChoice = 'claro' | 'oscuro' | 'sistema';

export interface AppSettings {
  theme: ThemeChoice;
  fontSize: string;
  idioma: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

const DEFAULTS: AppSettings = {
  theme: 'claro',
  fontSize: 'mediano',
  idioma: 'es',
  dateFormat: 'ddmmyyyy',
  timeFormat: '24',
  timezone: 'america_bogota',
};

/** Zonas IANA alineadas con los valores del selector de configuración */
export const TIMEZONE_IANA: Record<string, string> = {
  america_bogota: 'America/Bogota',
  america_mexico: 'America/Mexico_City',
  europe_madrid: 'Europe/Madrid',
};

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  readonly settings = signal<AppSettings>({ ...DEFAULTS });

  /** Textos de interfaz según idioma (tema/claro-oscuro siguen en applyTheme) */
  readonly ui = computed<UiStrings>(() =>
    this.settings().idioma === 'en' ? UI_EN : UI_ES,
  );
  readonly productividadRange = signal<ProductividadRange>('7');
  readonly productividadPrefs = signal<ProductividadPrefs>({ ...DEFAULT_PRODUCTIVIDAD_PREFS });

  /** Sincronizado con `applyTheme()` — útil para estilos del header sin depender solo de variables en `html`. */
  readonly themeIsDark = signal(false);

  constructor() {
    this.loadFromStorage();
    this.applyAll();
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.settings().theme === 'sistema') {
          this.applyTheme();
        }
      });
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<AppSettings>;
        this.settings.set({ ...DEFAULTS, ...p });
      }
    } catch {
      /* ignore */
    }

    try {
      const r = localStorage.getItem(PRODUCTIVIDAD_RANGE_KEY);
      if (r === '7' || r === '30') {
        this.productividadRange.set(r);
      }
      const pr = localStorage.getItem(PRODUCTIVIDAD_PREFS_KEY);
      if (pr) {
        const p = JSON.parse(pr) as Partial<ProductividadPrefs>;
        this.productividadPrefs.set({ ...DEFAULT_PRODUCTIVIDAD_PREFS, ...p });
      }
    } catch {
      /* ignore */
    }
  }

  setTheme(theme: ThemeChoice): void {
    this.settings.update((s) => ({ ...s, theme }));
    this.persistSettings();
    this.applyTheme();
  }

  patch<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settings.update((s) => ({ ...s, [key]: value }));
    this.persistSettings();
    if (key === 'theme') {
      this.applyTheme();
    } else if (key === 'fontSize') {
      this.applyFontSize();
    } else if (key === 'idioma') {
      this.applyLang();
    }
  }

  setProductividadRange(value: ProductividadRange): void {
    this.productividadRange.set(value);
    try {
      localStorage.setItem(PRODUCTIVIDAD_RANGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  toggleProductividadInsights(): void {
    this.productividadPrefs.update((p) => ({ ...p, showInsights: !p.showInsights }));
    try {
      localStorage.setItem(PRODUCTIVIDAD_PREFS_KEY, JSON.stringify(this.productividadPrefs()));
    } catch {
      /* ignore */
    }
  }

  private persistSettings(): void {
    try {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(this.settings()));
    } catch {
      /* ignore */
    }
  }

  private applyAll(): void {
    this.applyTheme();
    this.applyFontSize();
    this.applyLang();
  }

  private applyTheme(): void {
    const t = this.settings().theme;
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    let dark = false;
    if (t === 'oscuro') {
      root.setAttribute('data-theme', 'dark');
      dark = true;
    } else if (t === 'sistema' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.setAttribute('data-theme', 'dark');
        dark = true;
      }
    }
    root.style.colorScheme = dark ? 'dark' : 'light';
    this.themeIsDark.set(dark);
  }

  private applyFontSize(): void {
    document.documentElement.setAttribute('data-font-size', this.settings().fontSize);
  }

  private applyLang(): void {
    document.documentElement.lang = this.settings().idioma === 'en' ? 'en' : 'es';
  }

  /** Locale numérico de fecha según formato (orden día/mes/año) e idioma */
  private dateLocale(): string {
    const s = this.settings();
    if (s.dateFormat === 'mmddyyyy') {
      return 'en-US';
    }
    if (s.dateFormat === 'yyyymmdd') {
      return 'sv-SE';
    }
    return s.idioma === 'en' ? 'en-GB' : 'es-CO';
  }

  private timeZoneIana(): string {
    return TIMEZONE_IANA[this.settings().timezone] ?? 'America/Bogota';
  }

  formatDateTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    const s = this.settings();
    const hour12 = s.timeFormat === '12';
    return new Intl.DateTimeFormat(this.dateLocale(), {
      timeZone: this.timeZoneIana(),
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12,
    }).format(d);
  }

  /** Etiquetas cortas en gráficos de actividad (día de la semana) */
  formatWeekdayShort(d: Date): string {
    const s = this.settings();
    const loc = s.idioma === 'en' ? 'en-US' : 'es-CO';
    return new Intl.DateTimeFormat(loc, {
      timeZone: this.timeZoneIana(),
      weekday: 'short',
    }).format(d);
  }

  /** Día/mes para vista compacta (periodo largo) */
  formatDayMonth(d: Date): string {
    return new Intl.DateTimeFormat(this.dateLocale(), {
      timeZone: this.timeZoneIana(),
      day: 'numeric',
      month: 'numeric',
    }).format(d);
  }

  /** Fecha relativa corta para lista de notificaciones (vencimientos) */
  formatDueDateShort(d: Date): string {
    return new Intl.DateTimeFormat(this.dateLocale(), {
      timeZone: this.timeZoneIana(),
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d);
  }

  isEnglish(): boolean {
    return this.settings().idioma === 'en';
  }
}
