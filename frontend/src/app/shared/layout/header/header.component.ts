import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { SearchService } from '@core/services/search.service';
import { AuthService } from '@core/services/auth.service';
import { AppSettingsService } from '@core/services/app-settings.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly search = inject(SearchService);
  readonly auth = inject(AuthService);
  readonly appSettings = inject(AppSettingsService);
  readonly ui = this.appSettings.ui;
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** Menú hamburguesa (tablet / móvil) */
  readonly menuOpen = signal(false);

  /** Ruta actual (p. ej. clases condicionales en la plantilla) */
  readonly routeUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
        this.routeUrl.set(this.router.url);
        const url = this.router.url;
        if (!url.startsWith('/buscar')) {
          return;
        }
        const tree = this.router.parseUrl(url);
        const raw = tree.queryParams['q'];
        const qstr = typeof raw === 'string' ? raw : Array.isArray(raw) ? (raw[0] ?? '') : '';
        this.search.setQuery(qstr);
      });

    fromEvent(this.document.defaultView ?? window, 'resize')
      .pipe(debounceTime(150), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if ((this.document.defaultView?.innerWidth ?? 0) >= 1025 && this.menuOpen()) {
          this.closeMenu();
        }
      });
  }

  toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    this.document.body.style.overflow = next ? 'hidden' : '';
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.document.body.style.overflow = '';
  }

  goSearch(): void {
    const q = this.search.query().trim();
    void this.router.navigate(['/buscar'], { queryParams: { q } });
  }
}
