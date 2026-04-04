import { Injectable, signal } from '@angular/core';
import { SEARCH_INDEX, SearchableItem } from '../search/search-index';

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  /** Texto actual del buscador (sincronizado con la ruta /buscar?q=). */
  readonly query = signal('');

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** Filtra el índice por término (vacío = todo el índice). */
  searchResults(term: string): SearchableItem[] {
    const raw = term.trim();
    if (!raw) {
      return [...SEARCH_INDEX];
    }
    const t = fold(raw);
    return SEARCH_INDEX.filter((item) => {
      const hay = fold(
        [item.title, item.description, ...item.keywords].join(' '),
      );
      return hay.includes(t);
    });
  }
}
