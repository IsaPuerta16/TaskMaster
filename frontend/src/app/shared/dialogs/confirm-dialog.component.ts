import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialog.payload(); as p) {
      <div
        class="confirm-backdrop"
        role="presentation"
        (click)="onBackdrop($event)"
        aria-hidden="true"
      ></div>
      <div class="confirm-modal" role="dialog" aria-modal="true" [attr.aria-labelledby]="'confirm-title'">
        <h2 id="confirm-title" class="confirm-modal__title">{{ p.title }}</h2>
        <p class="confirm-modal__msg">{{ p.message }}</p>
        <div class="confirm-modal__actions">
          <button type="button" class="confirm-btn confirm-btn--ghost" (click)="dialog.cancel()">
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="confirm-btn"
            [class.confirm-btn--danger]="p.danger"
            (click)="dialog.confirm()"
          >
            {{ p.confirmLabel }}
          </button>
        </div>
      </div>
    }
  `,
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialogService);

  get cancelLabel(): string {
    return this.dialog.pick('Cancelar', 'Cancel');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dialog.payload()) this.dialog.cancel();
  }

  onBackdrop(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) this.dialog.cancel();
  }
}
