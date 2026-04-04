import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SearchService } from '@core/services/search.service';
import { AuthService } from '@core/services/auth.service';

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
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        if (!url.startsWith('/buscar')) {
          return;
        }
        const tree = this.router.parseUrl(url);
        const raw = tree.queryParams['q'];
        const qstr = typeof raw === 'string' ? raw : Array.isArray(raw) ? (raw[0] ?? '') : '';
        this.search.setQuery(qstr);
      });
  }

  goSearch(): void {
    const q = this.search.query().trim();
    void this.router.navigate(['/buscar'], { queryParams: { q } });
  }
}
