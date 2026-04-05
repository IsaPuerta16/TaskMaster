import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/layout';
import { AppSettingsService } from '@core/services/app-settings.service';

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [FooterComponent, RouterLink],
  templateUrl: './asistente-ia.component.html',
  styleUrl: './asistente-ia.component.scss',
})
export class AsistenteIaComponent {
  readonly appSettings = inject(AppSettingsService);
  readonly F = computed(() => this.appSettings.ui().asistenteIaPage);
}
