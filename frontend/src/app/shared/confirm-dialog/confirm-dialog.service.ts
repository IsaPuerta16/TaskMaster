import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState>({
    open: false,
    title: 'Confirmar',
    message: '',
    confirmLabel: 'Aceptar',
    cancelLabel: 'Cancelar',
    danger: false,
  });

  private resolver: ((value: boolean) => void) | null = null;

  confirm(
    message: string,
    options?: { title?: string; confirmLabel?: string; danger?: boolean },
  ): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
    }
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this.state.set({
        open: true,
        title: options?.title ?? 'Confirmar',
        message,
        confirmLabel: options?.confirmLabel ?? 'Aceptar',
        cancelLabel: 'Cancelar',
        danger: options?.danger ?? false,
      });
    });
  }

  accept(): void {
    this.resolver?.(true);
    this.resolver = null;
    this.state.update((s) => ({ ...s, open: false }));
  }

  cancel(): void {
    this.resolver?.(false);
    this.resolver = null;
    this.state.update((s) => ({ ...s, open: false }));
  }
}
