import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/layout';
import { AppSettingsService } from '@core/services/app-settings.service';

@Component({
  selector: 'app-productividad',
  standalone: true,
  imports: [RouterLink, FooterComponent],
  templateUrl: './productividad.component.html',
  styleUrl: './productividad.component.scss',
})
export class ProductividadComponent {
  readonly appSettings = inject(AppSettingsService);
  readonly F = computed(() => this.appSettings.ui().productividadPage);
  readonly notificationCount = 1;
}
