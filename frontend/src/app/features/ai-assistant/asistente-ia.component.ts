import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AUTH_ASSISTANT_ROUTE,
  AUTH_DEFAULT_ROUTE,
} from '@core/constants/auth-default-route';
import { AuthService } from '@core/services/auth.service';
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
  readonly auth = inject(AuthService);
  readonly appSettings = inject(AppSettingsService);
  readonly F = computed(() => this.appSettings.ui().asistenteIaPage);
  readonly assistantAppRoute = AUTH_ASSISTANT_ROUTE;
  readonly tasksRoute = AUTH_DEFAULT_ROUTE;
}
