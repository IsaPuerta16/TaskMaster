import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.state().open) {
      <div class="confirm-backdrop" (click)="dialog.cancel()" role="presentation"></div>
      <div class="confirm-modal" role="alertdialog" aria-modal="true" [attr.aria-label]="dialog.state().title">
        <h2 class="confirm-modal__title">{{ dialog.state().title }}</h2>
        <p class="confirm-modal__message">{{ dialog.state().message }}</p>
        <div class="confirm-modal__actions">
          <button type="button" class="confirm-modal__btn" (click)="dialog.cancel()">
            {{ dialog.state().cancelLabel }}
          </button>
          <button
            type="button"
            class="confirm-modal__btn confirm-modal__btn--primary"
            [class.confirm-modal__btn--danger]="dialog.state().danger"
            (click)="dialog.accept()"
          >
            {{ dialog.state().confirmLabel }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .confirm-backdrop {
        position: fixed;
        inset: 0;
        background: var(--app-modal-backdrop, rgba(0, 0, 0, 0.45));
        z-index: 500;
      }
      .confirm-modal {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 501;
        width: min(400px, calc(100vw - 2rem));
        padding: 1.25rem;
        border-radius: 16px;
        background: var(--app-card, #fff);
        border: 1px solid var(--app-border, #e2e8f0);
        box-shadow: var(--app-shadow-md, 0 12px 40px rgba(0, 0, 0, 0.15));
        font-family: var(--font-family, system-ui, sans-serif);
      }
      .confirm-modal__title {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--app-text, #0f172a);
      }
      .confirm-modal__message {
        margin: 0 0 1rem;
        font-size: 0.9rem;
        line-height: 1.45;
        color: var(--app-text-muted, #64748b);
      }
      .confirm-modal__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .confirm-modal__btn {
        border: 1px solid var(--app-border-strong, #cbd5e1);
        border-radius: 10px;
        padding: 0.45rem 0.85rem;
        background: var(--app-input-bg, #f8fafc);
        cursor: pointer;
        font-weight: 600;
        font-size: 0.85rem;
      }
      .confirm-modal__btn--primary {
        border-color: var(--app-accent-solid);
        background: var(--app-accent-solid);
        color: #fff;
      }
      .confirm-modal__btn--danger {
        border-color: var(--app-danger);
        background: var(--app-danger);
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialogService);
}
