import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/layout';
import { AUTH_DEFAULT_ROUTE } from '@core/constants/auth-default-route';
import { AuthService } from '@core/services/auth.service';
import { AppSettingsService } from '@core/services/app-settings.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  host: {
    style: 'display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box',
  },
})
export class LandingComponent {
  readonly auth = inject(AuthService);
  private readonly appSettings = inject(AppSettingsService);

  
  readonly L = computed(() => this.appSettings.ui().landing);
  readonly tasksRoute = AUTH_DEFAULT_ROUTE;
}
