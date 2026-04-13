import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/layout';
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
  private readonly appSettings = inject(AppSettingsService);

  /** Textos de la landing según idioma (alineado con ui-strings-landing). */
  readonly L = computed(() => this.appSettings.ui().landing);
}
