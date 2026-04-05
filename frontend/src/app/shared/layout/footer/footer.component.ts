import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSettingsService } from '@core/services/app-settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly appSettings = inject(AppSettingsService);

  readonly L = computed(() => {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    if (en) {
      return {
        tagline: 'Smart task manager for teams and professionals.',
        nav: 'Navigation',
        home: 'Home',
        features: 'Features',
        productivity: 'Productivity',
        login: 'Log in',
        register: 'Sign up',
        contact: 'Contact',
        contactLine: 'Universidad Autónoma de Manizales',
        copy: '© 2025 TaskMaster. All rights reserved.',
      };
    }
    return {
      tagline: 'Gestor inteligente de tareas para equipos y profesionales.',
      nav: 'Navegación',
      home: 'Inicio',
      features: 'Funcionalidades',
      productivity: 'Productividad',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      contact: 'Contacto',
      contactLine: 'Universidad Autónoma de Manizales',
      copy: '© 2025 TaskMaster. Todos los derechos reservados.',
    };
  });
}
