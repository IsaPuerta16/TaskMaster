import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/layout';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';
import { AppSettingsService } from '@core/services/app-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';

  
  private readonly _settings = inject(AppSettingsService);
}
