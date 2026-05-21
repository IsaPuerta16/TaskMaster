import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { UI_EN, UI_ES, type UiStrings } from '../ui-strings';
import {
  DEFAULT_PRODUCTIVIDAD_PREFS,
  type ProductividadPrefs,
  type ProductividadRange,
} from '@core/productividad-settings';
import { AuthService } from '@core/services/auth.service';
import {
  cacheUserSettingsSnapshot,
  readCachedUserSettingsSnapshot,
} from '@core/utils/user-settings-cache.util';
import { UserSettingsService } from '@features/user-settings/data-access/user-settings.service';
import type {
  AppSettings,
  ThemeChoice,
  UserSettingsResponse,
} from '@features/user-settings/data-access/user-settings.model';

const DEFAULTS: AppSettings = {
  theme: 'claro',
  fontSize: 'mediano',
  idioma: 'es',
  dateFormat: 'ddmmyyyy',
  timeFormat: '24',
  timezone: 'america_bogota',
};

const FONT_SIZES = new Set(['pequeno', 'mediano', 'grande']);
const THEMES = new Set<ThemeChoice>(['claro', 'oscuro', 'sistema']);

function normalizeAppSettings(raw: Partial<AppSettings>): AppSettings {
  const merged = { ...DEFAULTS, ...raw };
  if (!FONT_SIZES.has(merged.fontSize) && merged.fontSize === 'normal') {
    merged.fontSize = 'mediano';
  } else if (!FONT_SIZES.has(merged.fontSize)) {
    merged.fontSize = DEFAULTS.fontSize;
  }
  if (!THEMES.has(merged.theme)) {
    merged.theme = DEFAULTS.theme;
  }
  return merged;
}


export const TIMEZONE_IANA: Record<string, string> = {
  america_bogota: 'America/Bogota',
  america_mexico: 'America/Mexico_City',
  europe_madrid: 'Europe/Madrid',
};

export type { AppSettings, ThemeChoice };

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  private readonly auth = inject(AuthService);
  private readonly userSettingsService = inject(UserSettingsService);

  readonly settings = signal<AppSettings>({ ...DEFAULTS });

  
  readonly ui = computed<UiStrings>(() =>
    this.settings().idioma === 'en' ? UI_EN : UI_ES,
  );
  readonly productividadRange = signal<ProductividadRange>('7');
  readonly productividadPrefs = signal<ProductividadPrefs>({ ...DEFAULT_PRODUCTIVIDAD_PREFS });

  
  readonly themeIsDark = signal(false);

  
  private loadedSettingsUserId: string | null = null;

  constructor() {
    this.applyAll();
    effect(
      () => {
        const user = this.auth.user();
        if (user) {
          if (this.loadedSettingsUserId !== user.id) {
            this.loadedSettingsUserId = user.id;
            const cached = readCachedUserSettingsSnapshot(user.id);
            if (cached) {
              this.applyRemoteSettings(cached);
            }
            this.loadFromServer(user.id);
          }
          return;
        }
        this.loadedSettingsUserId = null;
        this.resetToDefaults();
      },
      { allowSignalWrites: true },
    );
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.settings().theme === 'sistema') {
          this.applyTheme();
        }
      });
    }
  }

  private loadFromServer(userId: string): void {
    this.userSettingsService.getSettings().subscribe({
      next: (snapshot) => {
        cacheUserSettingsSnapshot(userId, snapshot);
        this.applyRemoteSettings(snapshot);
      },
    });
  }

  private resetToDefaults(): void {
    this.settings.set({ ...DEFAULTS });
    this.productividadRange.set('7');
    this.productividadPrefs.set({ ...DEFAULT_PRODUCTIVIDAD_PREFS });
    this.applyAll();
  }

  private applyRemoteSettings(snapshot: UserSettingsResponse): void {
    this.settings.set(normalizeAppSettings(snapshot.appSettings));
    this.productividadRange.set(snapshot.productivity.range);
    this.productividadPrefs.set({
      ...DEFAULT_PRODUCTIVIDAD_PREFS,
      showInsights: snapshot.productivity.showInsights,
    });
    this.applyAll();
  }

  setTheme(theme: ThemeChoice): void {
    this.settings.update((s) => ({ ...s, theme }));
    this.applyTheme();
    this.persistRemote({ appSettings: { theme } });
  }

  patch<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settings.update((s) => ({ ...s, [key]: value }));
    if (key === 'theme') {
      this.applyTheme();
    } else if (key === 'fontSize') {
      this.applyFontSize();
    } else if (key === 'idioma') {
      this.applyLang();
    }
    this.persistRemote({ appSettings: { [key]: value } });
  }

  setProductividadRange(value: ProductividadRange): void {
    this.productividadRange.set(value);
    this.persistRemote({ productivity: { range: value } });
  }

  toggleProductividadInsights(): void {
    const showInsights = !this.productividadPrefs().showInsights;
    this.productividadPrefs.update((p) => ({ ...p, showInsights }));
    this.persistRemote({ productivity: { showInsights } });
  }

  private applyAll(): void {
    this.applyTheme();
    this.applyFontSize();
    this.applyLang();
  }

  private persistRemote(payload: {
    appSettings?: Partial<AppSettings>;
    productivity?: Partial<{ range: ProductividadRange; showInsights: boolean }>;
  }): void {
    if (!this.auth.isAuthenticated()) return;
    this.userSettingsService.patchSettings(payload).subscribe({
      next: (snapshot) => {
        const userId = this.auth.user()?.id;
        if (userId) {
          cacheUserSettingsSnapshot(userId, snapshot);
        }
        this.applyPersistedSnapshot(snapshot, payload);
      },
      error: () => {
        const userId = this.auth.user()?.id;
        if (userId) {
          this.loadFromServer(userId);
        }
      },
    });
  }

  
  private applyPersistedSnapshot(
    snapshot: UserSettingsResponse,
    payload: {
      appSettings?: Partial<AppSettings>;
      productivity?: Partial<{ range: ProductividadRange; showInsights: boolean }>;
    },
  ): void {
    if (payload.appSettings) {
      const patch = payload.appSettings;
      const remote = normalizeAppSettings(snapshot.appSettings);
      this.settings.update((current) =>
        normalizeAppSettings({
          ...current,
          ...(patch.theme !== undefined ? { theme: remote.theme } : {}),
          ...(patch.fontSize !== undefined ? { fontSize: remote.fontSize } : {}),
          ...(patch.idioma !== undefined ? { idioma: remote.idioma } : {}),
          ...(patch.dateFormat !== undefined ? { dateFormat: remote.dateFormat } : {}),
          ...(patch.timeFormat !== undefined ? { timeFormat: remote.timeFormat } : {}),
          ...(patch.timezone !== undefined ? { timezone: remote.timezone } : {}),
        }),
      );
    }
    if (payload.productivity) {
      this.productividadRange.set(snapshot.productivity.range);
      this.productividadPrefs.set({
        ...DEFAULT_PRODUCTIVIDAD_PREFS,
        showInsights: snapshot.productivity.showInsights,
      });
    }
    this.applyAll();
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

  
  formatWeekdayShort(d: Date): string {
    const s = this.settings();
    const loc = s.idioma === 'en' ? 'en-US' : 'es-CO';
    return new Intl.DateTimeFormat(loc, {
      timeZone: this.timeZoneIana(),
      weekday: 'short',
    }).format(d);
  }

  
  formatDayMonth(d: Date): string {
    return new Intl.DateTimeFormat(this.dateLocale(), {
      timeZone: this.timeZoneIana(),
      day: 'numeric',
      month: 'numeric',
    }).format(d);
  }

  
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
