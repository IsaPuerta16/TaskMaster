import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/layout';
import { SearchService } from '@core/services/search.service';
import { SearchableItem } from '@core/search/search-index';
import { TaskService } from '@core/services/task.service';
import { AuthService } from '@core/services/auth.service';
import type { Task } from '@core/models';

export interface TaskSearchHit {
  id: string;
  title: string;
  dueDate: string;
  status: string;
}

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [FooterComponent, RouterLink, DatePipe],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.scss',
})
export class BuscarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private search = inject(SearchService);
  private taskService = inject(TaskService);
  private auth = inject(AuthService);

  readonly results = signal<SearchableItem[]>([]);
  readonly taskHits = signal<TaskSearchHit[]>([]);
  readonly term = signal('');

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.term.set(q);
      this.search.setQuery(q);
      this.results.set(this.search.searchResults(q));
      this.searchTasks(q);
    });
  }

  private searchTasks(q: string): void {
    if (!this.auth.isAuthenticated() || !q.trim()) {
      this.taskHits.set([]);
      return;
    }
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        const t = q.trim().toLowerCase();
        const hits = tasks
          .filter((task) => {
            const hay = [
              task.title,
              task.description ?? '',
              task.project ?? '',
              ...(task.tags ?? []),
            ]
              .join(' ')
              .toLowerCase();
            return hay.includes(t);
          })
          .slice(0, 12)
          .map((task) => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            status: task.status,
          }));
        this.taskHits.set(hits);
      },
      error: () => this.taskHits.set([]),
    });
  }
}
