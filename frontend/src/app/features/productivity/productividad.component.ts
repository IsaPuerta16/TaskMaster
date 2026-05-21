import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_PRODUCTIVITY_ROUTE } from '@core/constants/auth-default-route';
import { AuthService } from '@core/services/auth.service';
import { FooterComponent } from '@shared/layout';
import { AppSettingsService } from '@core/services/app-settings.service';
import { TaskService } from '@features/tasks/data-access';
import { buildWeeklyReportText, downloadTextFile } from '@core/utils/task-export.util';

@Component({
  selector: 'app-productividad',
  standalone: true,
  imports: [RouterLink, FooterComponent],
  templateUrl: './productividad.component.html',
  styleUrl: './productividad.component.scss',
})
export class ProductividadComponent {
  private readonly taskService = inject(TaskService);

  readonly auth = inject(AuthService);
  readonly appSettings = inject(AppSettingsService);
  readonly F = computed(() => this.appSettings.ui().productividadPage);
  readonly productivityAppRoute = AUTH_PRODUCTIVITY_ROUTE;
  readonly notificationCount = 1;
  readonly reportLoading = signal(false);

  downloadWeeklyReport(): void {
    if (!this.auth.isAuthenticated() || this.reportLoading()) return;
    this.reportLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.taskService.getStats().subscribe({
          next: (stats) => {
            const text = buildWeeklyReportText(tasks, stats);
            downloadTextFile(
              `informe-semanal-${new Date().toISOString().slice(0, 10)}.txt`,
              text,
              'text/plain;charset=utf-8',
            );
            this.reportLoading.set(false);
          },
          error: () => this.reportLoading.set(false),
        });
      },
      error: () => this.reportLoading.set(false),
    });
  }
}
