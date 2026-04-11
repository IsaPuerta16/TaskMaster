import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/layout';
import { AppSettingsService } from '@core/services/app-settings.service';

@Component({
  selector: 'app-funcionalidades',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './funcionalidades.component.html',
  styleUrls: ['./funcionalidades.component.scss'],
})
export class FuncionalidadesComponent {
  readonly appSettings = inject(AppSettingsService);

  readonly F = computed(() => this.appSettings.ui().funcionalidadesPage);
}
