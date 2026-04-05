import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/layout';
import { SearchService } from '@core/services/search.service';
import { SearchableItem } from '@core/search/search-index';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [FooterComponent, RouterLink],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.scss',
})
export class BuscarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private search = inject(SearchService);

  readonly results = signal<SearchableItem[]>([]);
  readonly term = signal('');

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.term.set(q);
      this.search.setQuery(q);
      this.results.set(this.search.searchResults(q));
    });
  }
}
