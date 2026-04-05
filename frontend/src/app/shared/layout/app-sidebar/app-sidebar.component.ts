import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { AppSettingsService } from '@core/services/app-settings.service';

/** Ancho a partir del cual el menú se muestra completo sin pedir expansión (coincide con SCSS del sidebar). */
const SIDEBAR_COLLAPSE_MAX_PX = 960;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss',
})
export class AppSidebarComponent {
  readonly auth = inject(AuthService);
  readonly appSettings = inject(AppSettingsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Vista estrecha: el panel de enlaces empieza colapsado (true hasta medir el viewport). */
  readonly narrow = signal(true);

  /** Usuario expande/contrae el menú (solo relevante si `narrow`). */
  readonly menuExpanded = signal(false);

  /** Panel visible: escritorio siempre; móvil/tablet solo si `menuExpanded`. */
  readonly panelOpen = computed(() => !this.narrow() || this.menuExpanded());

  readonly nav = computed(() => {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    if (en) {
      return {
        brandTitle: 'TaskMaster',
        menuKicker: 'Menu',
        sectionMain: 'Main',
        sectionAccount: 'Account',
        profile: 'My profile',
        calendar: 'Calendar',
        tasks: 'My tasks',
        productivity: 'Productivity',
        ai: 'AI assistant',
        notifications: 'Notifications',
        settings: 'Settings',
        logout: 'Log out',
        aria: 'Application menu',
        openMenu: 'Open navigation menu',
        closeMenu: 'Close navigation menu',
      };
    }
    return {
      brandTitle: 'TaskMaster',
      menuKicker: 'Tu menú',
      sectionMain: 'Principal',
      sectionAccount: 'Cuenta',
      profile: 'Mi Perfil',
      calendar: 'Calendario',
      tasks: 'Mis Tareas',
      productivity: 'Productividad',
      ai: 'Asistente IA',
      notifications: 'Notificaciones',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
      aria: 'Menú de la aplicación',
      openMenu: 'Abrir menú de navegación',
      closeMenu: 'Cerrar menú de navegación',
    };
  });

  constructor() {
    afterNextRender(() => {
      this.syncViewport();
      fromEvent(window, 'resize')
        .pipe(debounceTime(120), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.syncViewport());
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.narrow()) {
          this.menuExpanded.set(false);
        }
      });
  }

  toggleMenuPanel(): void {
    this.menuExpanded.update((v) => !v);
  }

  private lastNarrow: boolean | null = null;

  private syncViewport(): void {
    const narrow = window.innerWidth <= SIDEBAR_COLLAPSE_MAX_PX;
    this.narrow.set(narrow);

    if (this.lastNarrow === null) {
      this.menuExpanded.set(!narrow);
    } else if (this.lastNarrow !== narrow) {
      this.menuExpanded.set(!narrow);
    }
    this.lastNarrow = narrow;
  }
}
