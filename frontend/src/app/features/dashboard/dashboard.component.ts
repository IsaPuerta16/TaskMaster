import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TaskService, TaskStats } from '@core/services/task.service';
import { HeaderComponent } from '@shared/layout';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <div class="dashboard">
      <app-header />

      <div class="dashboard__bar">
        <span class="dashboard__user">{{ auth.user()?.fullName }}</span>
        <button type="button" class="btn btn-outline" (click)="auth.logout()">Salir</button>
      </div>

      <main class="main">
        <section class="stats" *ngIf="stats">
          <div class="stat-card">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Total tareas</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">Completadas</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
          <div class="stat-card stat-overdue">
            <span class="stat-value">{{ stats.overdue }}</span>
            <span class="stat-label">Vencidas</span>
          </div>
          <div class="stat-card stat-rate">
            <span class="stat-value">{{ stats.completionRate }}%</span>
            <span class="stat-label">Progreso</span>
          </div>
        </section>

        <section class="actions">
          <a routerLink="/tasks/new" class="btn btn-primary">+ Nueva tarea</a>
          <a routerLink="/tasks" class="btn btn-secondary">Ver todas las tareas</a>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: TaskStats | null = null;

  constructor(
    public auth: AuthService,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
    this.taskService.getStats().subscribe((s: TaskStats) => (this.stats = s));
  }
}
