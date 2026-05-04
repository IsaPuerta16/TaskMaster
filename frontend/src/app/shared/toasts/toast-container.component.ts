import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite" aria-relevant="additions">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="toast"
          [class.toast--success]="t.kind === 'success'"
          [class.toast--info]="t.kind === 'info'"
          [class.toast--error]="t.kind === 'error'"
          role="status"
        >
          <span class="toast__icon" aria-hidden="true">{{ icon(t.kind) }}</span>
          <p class="toast__msg">{{ t.message }}</p>
          <button type="button" class="toast__close" (click)="toast.dismiss(t.id)" aria-label="Cerrar">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
  readonly toast = inject(ToastService);

  icon(kind: string): string {
    if (kind === 'success') return '✓';
    if (kind === 'error') return '!';
    return 'i';
  }
}
