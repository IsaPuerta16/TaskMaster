import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/layout';
import { AppSettingsService } from '@core/services/app-settings.service';
import { ToastContainerComponent } from '@shared/toasts/toast-container.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';

  /** Carga preferencias (tema, fuente, idioma) antes de cualquier vista autenticada */
  private readonly _settings = inject(AppSettingsService);
}
