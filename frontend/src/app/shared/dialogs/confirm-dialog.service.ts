import { Injectable, inject, signal } from '@angular/core';
import { AppSettingsService } from '@core/services/app-settings.service';

export interface ConfirmDialogPayload {
  title: string;
  message: string;
  /** Etiqueta del botón que confirma (p. ej. Eliminar) */
  confirmLabel: string;
  /** Si true, el botón de confirmar se ve como acción destructiva */
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly appSettings = inject(AppSettingsService);
  readonly payload = signal<ConfirmDialogPayload | null>(null);
  private resolveFn: ((value: boolean) => void) | null = null;

  pick(es: string, en: string): string {
    return this.appSettings.isEnglish() ? en : es;
  }

  ask(options: ConfirmDialogPayload): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.payload.set(options);
    });
  }

  confirm(): void {
    this.resolveFn?.(true);
    this.resolveFn = null;
    this.payload.set(null);
  }

  cancel(): void {
    this.resolveFn?.(false);
    this.resolveFn = null;
    this.payload.set(null);
  }
}
